import React from 'react'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getNotifications, markAllAsRead, getUnreadCount } from '@/lib/actions/notifications.actions'
import { NotificationList } from '@/components/features/notifications/NotificationList'
import { revalidatePath } from 'next/cache'

export default async function NotificationsPage() {
  const notifications = await getNotifications(50)
  const unreadCount = await getUnreadCount()

  async function handleMarkAllAsRead() {
    'use server'
    await markAllAsRead()
    revalidatePath('/notifications')
  }

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-3xl">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">
            Notifications
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Vos notifications
          </h1>
          <p className="text-sm text-brume">
            Restez informé des nouvelles réponses, messages et propositions.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-indigo-nuit">
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </span>
          
          {unreadCount > 0 && (
            <form action={handleMarkAllAsRead}>
              <Button
                variant="secondary"
                size="sm"
                type="submit"
              >
                Tout marquer comme lu
              </Button>
            </form>
          )}
        </div>

        {/* Liste des notifications */}
        <NotificationList notifications={notifications} />
      </Container>
    </main>
  )
}
