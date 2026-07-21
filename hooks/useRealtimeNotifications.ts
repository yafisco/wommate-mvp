'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { Message } from '@/types/database.types'

export interface Notification {
  id: string
  type: 'new_message' | 'new_proposition' | 'demande_resolue'
  title: string
  message: string
  conversationId?: string
  timestamp: Date
}

export function useRealtimeNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) {
      console.log('❌ Pas d\'utilisateur connecté')
      return
    }

    console.log('✅ Utilisateur connecté:', user.id)
    const supabase = createClient()
    
    // Créer un channel unique avec un timestamp pour éviter les conflits
    const channelName = `notifications-${user.id}-${Date.now()}`

    // Créer le channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('📩 Nouveau message reçu (brut):', payload)
          const newMessage = payload.new as Message
          
          // Filtrer : seulement si l'utilisateur est le destinataire
          if (newMessage.destinataire_id !== user.id) {
            console.log('⏭️ Message ignoré (pas pour cet utilisateur):', newMessage.destinataire_id, 'vs', user.id)
            return
          }
          
          console.log('✅ Nouveau message reçu pour cet utilisateur:', payload)
          
          // Récupérer les infos de l'expéditeur
          const { data: sender } = await supabase
            .from('profils')
            .select('nom_complet')
            .eq('id', newMessage.expediteur_id)
            .single()

          const notification: Notification = {
            id: newMessage.id,
            type: 'new_message',
            title: `Nouveau message de ${sender?.nom_complet || 'un utilisateur'}`,
            message: newMessage.contenu.substring(0, 50) + (newMessage.contenu.length > 50 ? '...' : ''),
            conversationId: newMessage.conversation_id,
            timestamp: new Date(newMessage.created_at)
          }

          console.log('🔔 Notification créée:', notification)
          setNotifications((prev) => [notification, ...prev])

          // Son de notification (optionnel)
          try {
            const audio = new Audio('/notification.mp3')
            audio.play().catch(() => {})
          } catch {}
        }
      )
      .subscribe((status) => {
        console.log('🔔 Notifications Realtime status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('✓ Notifications Realtime connecté')
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('⚠ Notifications Realtime déconnecté')
        }
      })

    return () => {
      console.log('🔌 Unsubscribing from notifications')
      supabase.removeChannel(channel)
    }
  }, [user])

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return { notifications, removeNotification }
}
