'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message } from '@/types/database.types'

/**
 * Hook pour configurer Supabase Realtime sur une conversation
 */
export function useRealtimeMessages(
    conversationId: string,
    onNewMessage: (message: Message) => void
) {
    const subscriptionRef = useRef<any>(null)

    useEffect(() => {
        const supabase = createClient()

        // Écouter les nouveaux messages
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    onNewMessage(payload.new as Message)
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`✓ Realtime connecté pour la conversation ${conversationId}`)
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    console.warn(`⚠ Realtime déconnecté pour la conversation ${conversationId}`)
                }
            })

        subscriptionRef.current = channel

        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe()
            }
        }
    }, [conversationId, onNewMessage])
}
