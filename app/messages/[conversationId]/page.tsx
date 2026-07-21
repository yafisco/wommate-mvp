import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { getMessages, getOtherParticipant, markConversationAsRead } from '@/lib/actions/messages.actions'
import { ChatWindow } from '@/components/features/messages/ChatWindow'
import { MessageInput } from '@/components/features/messages/MessageInput'
import { Button } from '@/components/ui/Button'

interface PageProps {
    params: Promise<{ conversationId: string }>
}

export default async function ConversationPage({ params }: PageProps) {
    const { conversationId } = await params

    const messages = await getMessages(conversationId)
    const otherParticipant = await getOtherParticipant(conversationId)

    // Marquer comme lu
    await markConversationAsRead(conversationId)

    if (!otherParticipant) {
        return (
            <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
                <Container className="flex flex-col gap-6 max-w-2xl">
                    <Link href="/messages">
                        <Button variant="secondary">← Retour aux conversations</Button>
                    </Link>
                    <div className="text-center py-12">
                        <h2 className="font-display text-xl font-bold text-indigo-nuit mb-2">
                            Conversation non trouvée
                        </h2>
                        <p className="text-sm text-brume">
                            L&apos;utilisateur n&apos;existe plus ou la conversation a été supprimée.
                        </p>
                    </div>
                </Container>
            </main>
        )
    }

    return (
        <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
            <Container className="flex flex-col gap-0 max-w-2xl h-[calc(100vh-120px)] md:h-[calc(100vh-160px)]">
                {/* Lien retour */}
                <div className="mb-4">
                    <Link href="/messages" className="text-xs font-mono text-attaya hover:underline flex items-center gap-1">
                        ← Retour aux conversations
                    </Link>
                </div>

                {/* Chat */}
                <div className="flex flex-col flex-1 bg-white rounded-2xl shadow overflow-hidden">
                    <ChatWindow
                        conversationId={conversationId}
                        messages={messages}
                        otherParticipant={otherParticipant}
                    />
                    <MessageInput conversationId={conversationId} />
                </div>
            </Container>
        </main>
    )
}
