'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

export const NotificationIcon: React.FC = () => {
  const router = useRouter()
  const { notifications, removeNotification } = useRealtimeNotifications()
  const [isOpen, setIsOpen] = useState(false)

  function handleNotificationClick(notification: any) {
    if (notification.conversationId) {
      router.push(`/messages/${notification.conversationId}`)
    }
    removeNotification(notification.id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6 text-bone" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse border-2 border-indigo-nuit">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg rounded-xl shadow-2xl border border-indigo-nuit/20 z-50 overflow-hidden">
            <div className="bg-indigo-nuit text-bone px-4 py-3 border-b border-indigo-nuit/20">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <p className="text-xs text-bone/60">{notifications.length} notification{notifications.length > 1 ? 's' : ''}</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto bg-white">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-brume">
                  Aucune notification
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="px-4 py-3 border-b border-indigo-nuit/5 hover:bg-indigo-nuit/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-attaya/20 text-attaya flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-indigo-nuit">{notification.title}</p>
                        <p className="text-xs text-brume mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-[10px] text-brume mt-1">
                          {notification.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="bg-indigo-nuit/5 px-4 py-2 border-t border-indigo-nuit/10">
                <button
                  onClick={() => {
                    router.push('/messages')
                    setIsOpen(false)
                  }}
                  className="text-xs text-attaya hover:text-attaya/80 font-medium"
                >
                  Voir toutes les conversations
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
