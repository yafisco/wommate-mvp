'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ConversationWithLastMessage, Profil } from '@/types/database.types'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface ConversationListProps {
    conversations: ConversationWithLastMessage[]
    participants: Record<string, Profil>
    currentConversationId?: string
    onSelectConversation?: (conversationId: string) => void
}

export const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    participants,
    currentConversationId,
    onSelectConversation
}) => {
    const { user } = useAuth()
    const [localConversations, setLocalConversations] = useState(conversations)

    // Setup Realtime listener pour les mises à jour de conversations
    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel('conversations:updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'conversations'
                },
                () => {
                    // Note: Pour MVP, on peut laisser l'utilisateur rafraîchir manuellement
                    // Ou implémenter un polling léger
                }
            )
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [])

    if (localConversations.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-brume">
                    Aucune conversation pour le moment.
                </p>
                <p className="text-xs text-brume mt-2">
                    Commencez par contacter un mentor depuis les demandes d'aide.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {localConversations.map((conv) => {
                const isSelected = conv.id === currentConversationId
                const otherParticipantId =
                    conv.participant1_id === user?.id ? conv.participant2_id : conv.participant1_id
                const otherParticipant = participants[otherParticipantId]

                const dateFormatted = new Date(conv.last_message_at || conv.updated_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })

                return (
                    <Link
                        key={conv.id}
                        href={`/messages/${conv.id}`}
                        onClick={() => onSelectConversation?.(conv.id)}
                    >
                        <Card
                            className={`p-4 cursor-pointer transition-all duration-200 ${isSelected
                                ? 'bg-indigo-nuit/10 border-indigo-nuit/30'
                                : 'hover:bg-indigo-nuit/5 border-indigo-nuit/10'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar name={otherParticipant?.nom_complet || 'User'} size="md" />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h4 className="font-display font-bold text-sm text-indigo-nuit truncate">
                                            {otherParticipant?.nom_complet || 'Utilisateur'}
                                        </h4>
                                        <span className="text-xs text-brume flex-shrink-0 font-mono">{dateFormatted}</span>
                                    </div>

                                    <p className="text-xs text-brume truncate mb-1">
                                        {conv.last_message_sender_id === user?.id ? 'Vous: ' : ''}
                                        {conv.last_message_content || 'Aucun message'}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-brume font-mono">
                                            {otherParticipant?.filiere} • {otherParticipant?.niveau}
                                        </span>
                                        {conv.unread_count > 0 && (
                                            <Badge
                                                variant="statut-ouverte"
                                                className="px-2 py-0.5 text-[10px] font-bold"
                                            >
                                                {conv.unread_count} nouveau
                                                {conv.unread_count > 1 ? 'x' : ''}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Link>
                )
            })}
        </div>
    )
}
