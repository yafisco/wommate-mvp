'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateConversation } from '@/lib/actions/messages.actions'
import { Button } from '@/components/ui/Button'

interface MessageButtonProps {
    userId: string
    userName?: string
    variant?: 'primary' | 'secondary'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export const MessageButton: React.FC<MessageButtonProps> = ({
    userId,
    userName,
    variant = 'primary',
    size = 'md',
    className = ''
}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleClick() {
        setLoading(true)
        setError(null)

        try {
            const conversationId = await getOrCreateConversation(userId)
            router.push(`/messages/${conversationId}`)
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la création de la conversation'
            setError(errorMsg)
            setLoading(false)
        }
    }

    if (error) {
        return (
            <div className="text-xs text-terre font-medium p-2">
                {error}
            </div>
        )
    }

    return (
        <Button
            variant={variant}
            disabled={loading}
            onClick={handleClick}
            className={className}
            title={`Envoyer un message à ${userName || 'cet utilisateur'}`}
        >
            {loading ? '...' : '💬 Message'}
        </Button>
    )
}
