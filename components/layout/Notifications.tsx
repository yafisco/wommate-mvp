'use client'

import React from 'react'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'

export const Notifications: React.FC = () => {
  const { notifications, removeNotification } = useRealtimeNotifications()
  const router = useRouter()

  const handleNotificationClick = (notification: any) => {
    if (notification.conversationId) {
      router.push(`/messages/${notification.conversationId}`)
    }
    removeNotification(notification.id)
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className="bg-white rounded-xl shadow-lg border border-indigo-nuit/10 p-4 animate-slide-in cursor-pointer hover:bg-indigo-nuit/5 transition-colors"
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-attaya/20 text-attaya flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-indigo-nuit">{notification.title}</p>
              <p className="text-xs text-brume mt-1">{notification.message}</p>
              <p className="text-[10px] text-brume mt-2">
                {notification.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeNotification(notification.id)
              }}
              className="flex-shrink-0 text-brume hover:text-terre transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
