'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Message, Profil } from '@/types/database.types'
import { MessageBubble } from './MessageBubble'
import { useAuth } from '@/hooks/useAuth'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'

interface ChatWindowProps {
    conversationId: string
    messages: Message[]
    otherParticipant: Profil | null
    onNewMessage?: (message: Message) => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    conversationId,
    messages,
    otherParticipant,
    onNewMessage
}) => {
    const { user } = useAuth()
    const scrollRef = useRef<HTMLDivElement>(null)
    const [localMessages, setLocalMessages] = useState(messages)

    // Setup Realtime listener via hook
    useRealtimeMessages(conversationId, (newMessage) => {
        setLocalMessages((prev) => [...prev, newMessage])
        if (onNewMessage) {
            onNewMessage(newMessage)
        }
    })

    // Auto-scroll vers le bas quand de nouveaux messages arrivent
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [localMessages])

return (
    <div className="flex flex-col gap-0 h-full bg-white/50">
        {/* En-tête de conversation */}
        <div className="sticky top-0 z-10 px-4 py-3 bg-white border-b border-indigo-nuit/10 flex items-center gap-3">
            <div className="flex-1">
                <h3 className="font-display font-bold text-indigo-nuit text-sm">
                    {otherParticipant?.nom_complet || 'Conversation'}
                </h3>
                <p className="text-xs text-brume">
                    {otherParticipant?.filiere} • {otherParticipant?.niveau}
                </p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-pousse animate-pulse" />
        </div>

        {/* Zone de messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {localMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                    <p className="text-xs text-brume">
                        Aucun message. Commencez la conversation !
                    </p>
                </div>
            ) : (
                localMessages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.expediteur_id === user?.id}
                    />
                ))
            )}
            <div ref={scrollRef} />
        </div>
    </div>
)
}
