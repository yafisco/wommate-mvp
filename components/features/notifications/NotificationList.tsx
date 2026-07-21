'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Notification {
  id: string
  type: string
  contenu: string
  lien: string | null
  lu: boolean
  created_at: string
}

interface NotificationListProps {
  notifications: Notification[]
}

export const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
  const router = useRouter()

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'forum_reply':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        )
      case 'new_message':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'help_proposition':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )
    }
  }

  function getNotificationTypeLabel(type: string) {
    switch (type) {
      case 'forum_reply':
        return 'Forum'
      case 'new_message':
        return 'Message'
      case 'help_proposition':
        return 'Entraide'
      default:
        return 'Notification'
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours} h`
    if (diffDays < 7) return `Il y a ${diffDays} j`
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-2 border-indigo-nuit/15 bg-white/50">
        <div className="w-12 h-12 rounded-full bg-pousse/10 text-pousse flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-brume">
          Aucune notification pour le moment.
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 cursor-pointer transition-all duration-200 ${
            !notification.lu
              ? 'bg-indigo-nuit/5 border-indigo-nuit/20'
              : 'bg-white border-indigo-nuit/10'
          }`}
        >
          <Link href={notification.lien || '#'} className="block">
            <div className="flex items-start gap-3">
              {/* Icône */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                !notification.lu
                  ? 'bg-attaya/20 text-attaya'
                  : 'bg-indigo-nuit/10 text-indigo-nuit'
              }`}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="filiere" className="text-xs">
                      {getNotificationTypeLabel(notification.type)}
                    </Badge>
                    {!notification.lu && (
                      <span className="w-2 h-2 rounded-full bg-attaya flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-brume flex-shrink-0 font-mono">
                    {formatDate(notification.created_at)}
                  </span>
                </div>

                <p className={`text-sm ${
                  !notification.lu
                    ? 'text-encre font-medium'
                    : 'text-brume'
                }`}>
                  {notification.contenu}
                </p>
              </div>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  )
}
