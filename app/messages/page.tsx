import React from 'react'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getConversations } from '@/lib/actions/messages.actions'
import { ConversationList } from '@/components/features/messages/ConversationList'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/server'
import { TestConversationForm } from '@/components/features/messages/TestConversationForm'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('👤 Utilisateur connecté:', user?.id)

  const conversations = await getConversations()
  console.log('💬 Conversations récupérées:', conversations.length, conversations)

  // Récupérer les profils des autres participants
  const otherParticipantIds = conversations
    .flatMap((conv) => [
      conv.participant1_id === user?.id ? conv.participant2_id : conv.participant1_id
    ])
    .filter((id, idx, arr) => arr.indexOf(id) === idx)

  const { data: profils } = await supabase
    .from('profils')
    .select('*')
    .in('id', otherParticipantIds)

  const profilesMap: Record<string, any> = {}
  if (profils) {
    profils.forEach((p) => {
      profilesMap[p.id] = p
    })
  }

  // Récupérer tous les profils pour le formulaire de test (sauf l'utilisateur courant)
  const { data: allProfils } = await supabase
    .from('profils')
    .select('*')
    .neq('id', user?.id || '')
    .limit(10)

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-4xl">
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">
            Discussions
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Messagerie privée
          </h1>
          <p className="text-sm text-brume">
            Échangez en direct avec vos mentors et binômes d&apos;entraide.
          </p>
        </div>

        <ConversationList
          conversations={conversations}
          participants={profilesMap}
          currentConversationId={undefined}
        />
      </Container>
    </main>
  )
}
