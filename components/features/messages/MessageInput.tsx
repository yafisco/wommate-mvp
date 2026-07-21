'use client'

import React, { useState } from 'react'
import { sendMessage } from '@/lib/actions/messages.actions'
import { Button } from '@/components/ui/Button'

interface MessageInputProps {
    conversationId: string
    onMessageSent?: () => void
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId, onMessageSent }) => {
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = await sendMessage(conversationId, message)

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setMessage('')
            setLoading(false)
            if (onMessageSent) {
                onMessageSent()
            }
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as any)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 bg-white border-t border-indigo-nuit/10">
            {error && (
                <div className="text-xs text-terre font-medium px-3 py-2 bg-terre/10 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex gap-2 items-end">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Écrivez votre message... (Shift+Entrée pour nouvelle ligne)"
                    className="flex-1 px-3 py-2 text-sm border border-indigo-nuit/20 rounded-lg focus:outline-none focus:border-indigo-nuit focus:ring-1 focus:ring-indigo-nuit/20 resize-none max-h-24"
                    rows={2}
                    disabled={loading}
                />
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || message.trim().length === 0}
                    className="px-4 py-2 h-10 flex-shrink-0"
                >
                    {loading ? '...' : 'Envoyer'}
                </Button>
            </div>
        </form>
    )
}
