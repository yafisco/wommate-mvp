'use client'

import React from 'react'
import { Message } from '@/types/database.types'

interface MessageBubbleProps {
    message: Message
    isOwn: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
    const timeFormatted = new Date(message.created_at).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <div className={`flex gap-3 mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] md:max-w-lg px-4 py-3 rounded-2xl break-words shadow-sm ${isOwn
                    ? 'bg-gradient-to-br from-indigo-nuit to-indigo-nuit/90 text-bone rounded-br-md'
                    : 'bg-white text-encre border border-indigo-nuit/10 rounded-bl-md'
                }`}
            >
                <p className="text-sm leading-relaxed">{message.contenu}</p>
                <div className={`flex items-center justify-end gap-1 mt-1.5 ${isOwn ? 'text-bone/50' : 'text-brume'}`}>
                    <time className="text-[10px]">{timeFormatted}</time>
                    {isOwn && message.lu && (
                        <span className="text-[10px]">✓✓</span>
                    )}
                </div>
            </div>
        </div>
    )
}
