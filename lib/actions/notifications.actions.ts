'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Notification } from '@/types/database.types'

/**
 * Récupère les notifications de l'utilisateur connecté
 */
export async function getNotifications(limit: number = 20): Promise<Notification[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('destinataire_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    return []
  }

  return (data || []) as Notification[]
}

/**
 * Compte les notifications non lues
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('destinataire_id', user.id)
    .eq('lu', false)

  if (error) {
    console.error('Erreur lors du comptage des notifications:', error)
    return 0
  }

  return count || 0
}

/**
 * Marque une notification comme lue
 */
export async function markAsRead(notificationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('notifications')
    .update({ lu: true })
    .eq('id', notificationId)
    .eq('destinataire_id', user.id)

  if (error) {
    console.error('Erreur lors du marquage comme lu:', error)
    return { error: error.message }
  }

  revalidatePath('/notifications')
  return { success: true }
}

/**
 * Marque toutes les notifications comme lues
 */
export async function markAllAsRead() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('notifications')
    .update({ lu: true })
    .eq('destinataire_id', user.id)
    .eq('lu', false)

  if (error) {
    console.error('Erreur lors du marquage de toutes comme lues:', error)
    return { error: error.message }
  }

  revalidatePath('/notifications')
  return { success: true }
}

/**
 * Supprime une notification
 */
export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('destinataire_id', user.id)

  if (error) {
    console.error('Erreur lors de la suppression de la notification:', error)
    return { error: error.message }
  }

  revalidatePath('/notifications')
  return { success: true }
}
