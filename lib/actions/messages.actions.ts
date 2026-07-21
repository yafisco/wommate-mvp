'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { ConversationWithLastMessage, Message, MessageAvecAuteur } from '@/types/database.types'

/**
 * Récupère ou crée une conversation 1-à-1 avec un autre utilisateur
 */
export async function getOrCreateConversation(otherUserId: string): Promise<string> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')

    if (user.id === otherUserId) {
        throw new Error('Vous ne pouvez pas créer de conversation avec vous-même')
    }

    // Vérifier que l'autre utilisateur existe
    const { data: otherUser } = await supabase
        .from('profils')
        .select('id')
        .eq('id', otherUserId)
        .single()

    if (!otherUser) {
        throw new Error('Utilisateur introuvable')
    }

    // Appeler la fonction Supabase qui gère la logique atomique
    const { data, error } = await supabase
        .rpc('get_or_create_conversation', { other_user_id: otherUserId })

    if (error) {
        console.error('Erreur lors de la création/récupération de conversation:', error)
        throw new Error(error.message || 'Erreur lors de la création de la conversation')
    }

    return data as string
}

/**
 * Récupère la liste des conversations avec dernier message et count non-lus
 */
export async function getConversations(): Promise<ConversationWithLastMessage[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Récupérer directement les conversations de l'utilisateur
    const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Erreur lors de la récupération des conversations:', error)
        return []
    }

    // Pour chaque conversation, récupérer le dernier message
    const conversationsWithLastMessage = await Promise.all(
        (conversations || []).map(async (conv) => {
            const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)

            const lastMessage = messages && messages.length > 0 ? messages[0] : null

            // Compter les messages non-lus
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .eq('destinataire_id', user.id)
                .eq('lu', false)

            return {
                ...conv,
                last_message_id: lastMessage?.id,
                last_message_content: lastMessage?.contenu,
                last_message_sender_id: lastMessage?.expediteur_id,
                last_message_at: lastMessage?.created_at,
                last_message_read: lastMessage?.lu,
                unread_count: count || 0
            } as ConversationWithLastMessage
        })
    )

    return conversationsWithLastMessage
}

/**
 * Récupère les messages d'une conversation
 */
export async function getMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
): Promise<Message[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

    if (error) {
        console.error('Erreur lors de la récupération des messages:', error)
        return []
    }

    // Inverser pour avoir l'ordre chronologique (ancien→nouveau)
    return ((data || []) as Message[]).reverse()
}

/**
 * Envoie un message dans une conversation
 */
export async function sendMessage(conversationId: string, contenu: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    if (!contenu || contenu.trim().length === 0) {
        return { error: 'Le message ne peut pas être vide' }
    }

    // Récupérer la conversation pour obtenir l'autre participant
    const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversationId)
        .single()

    if (convError || !conv) {
        return { error: 'Conversation non trouvée' }
    }

    const destinataire_id = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            expediteur_id: user.id,
            destinataire_id,
            contenu: contenu.trim(),
            lu: false
        })
        .select()
        .single()

    if (error) {
        console.error('Erreur lors de l\'envoi du message:', error)
        return { error: error.message }
    }

    return { success: true, data }
}

/**
 * Marque tous les messages reçus d'une conversation comme lus
 */
export async function markConversationAsRead(conversationId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { error } = await supabase
        .from('messages')
        .update({ lu: true })
        .eq('conversation_id', conversationId)
        .eq('destinataire_id', user.id)
        .eq('lu', false)

    if (error) {
        console.error('Erreur lors du marquage des messages comme lus:', error)
        return { error: error.message }
    }

    return { success: true }
}

/**
 * Récupère le profil de l'autre participant d'une conversation
 */
export async function getOtherParticipant(conversationId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Récupérer la conversation
    const { data: conv } = await supabase
        .from('conversations')
        .select('participant1_id, participant2_id')
        .eq('id', conversationId)
        .single()

    if (!conv) return null

    const otherUserId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id

    // Récupérer le profil de l'autre utilisateur
    const { data: profil, error } = await supabase
        .from('profils')
        .select('*')
        .eq('id', otherUserId)
        .single()

    if (error) {
        console.error('Erreur lors de la récupération du profil:', error)
        return null
    }

    return profil
}


