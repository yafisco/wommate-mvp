'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Profil } from '@/types/database.types'

/**
 * Vérifie si l'utilisateur connecté est admin
 */
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')

  const { data: profil } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'admin') {
    throw new Error('Accès refusé : réservé aux administrateurs')
  }

  return user
}

/**
 * Récupère la liste des utilisateurs avec filtres
 */
export async function getUsers(
  search?: string,
  role?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ users: Profil[], total: number }> {
  await requireAdmin()

  const supabase = await createClient()

  let query = supabase
    .from('profils')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search && search.trim() !== '') {
    query = query.or(`nom_complet.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (role && role !== 'all') {
    query = query.eq('role', role)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return { users: [], total: 0 }
  }

  return { users: (data || []) as Profil[], total: count || 0 }
}

/**
 * Récupère les contenus signalés
 */
export async function getReportedContent() {
  await requireAdmin()

  const supabase = await createClient()

  // Récupérer les sujets signalés
  const { data: sujets, error: sujetsError } = await supabase
    .from('sujets_forum')
    .select('*, auteur:profils(*), groupe:groupes_thematiques(*)')
    .eq('signale', true)
    .order('created_at', { ascending: false })

  // Récupérer les réponses signalées
  const { data: reponses, error: reponsesError } = await supabase
    .from('reponses_forum')
    .select('*, auteur:profils(*), sujet:sujets_forum(*)')
    .eq('signale', true)
    .order('created_at', { ascending: false })

  // Récupérer les ressources signalées (si elles ont un champ signale)
  const { data: ressources, error: ressourcesError } = await supabase
    .from('ressources')
    .select('*, auteur:profils(*)')
    .eq('signale', true)
    .order('created_at', { ascending: false })

  return {
    sujets: sujets || [],
    reponses: reponses || [],
    ressources: ressources || []
  }
}

/**
 * Récupère les statistiques admin
 */
export async function getAdminStats() {
  await requireAdmin()

  const supabase = await createClient()

  // Nombre total d'utilisateurs
  const { count: totalUsers } = await supabase
    .from('profils')
    .select('*', { count: 'exact', head: true })

  // Utilisateurs actifs (connectés dans les 30 derniers jours)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: activeUsers } = await supabase
    .from('profils')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Nombre de demandes d'aide
  const { count: totalDemandes } = await supabase
    .from('demandes_aide')
    .select('*', { count: 'exact', head: true })

  // Demandes résolues
  const { count: resolvedDemandes } = await supabase
    .from('demandes_aide')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'resolue')

  // Taux de mise en relation
  const tauxMiseEnRelation = totalDemandes && totalDemandes > 0
    ? ((resolvedDemandes || 0) / totalDemandes * 100).toFixed(1)
    : '0'

  // Nombre de contenus signalés
  const { count: signalesSujets } = await supabase
    .from('sujets_forum')
    .select('*', { count: 'exact', head: true })
    .eq('signale', true)

  const { count: signalesReponses } = await supabase
    .from('reponses_forum')
    .select('*', { count: 'exact', head: true })
    .eq('signale', true)

  const totalSignales = (signalesSujets || 0) + (signalesReponses || 0)

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    totalDemandes: totalDemandes || 0,
    resolvedDemandes: resolvedDemandes || 0,
    tauxMiseEnRelation,
    totalSignales
  }
}

/**
 * Avertir un utilisateur (créer une notification)
 */
export async function warnUser(userId: string, message: string) {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .insert({
      destinataire_id: userId,
      type: 'admin_warning',
      contenu: `Avertissement de l'administration : ${message}`,
      lien: '/notifications'
    })

  if (error) {
    console.error('Erreur lors de l\'avertissement:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Ignorer un signalement
 */
export async function ignoreReport(type: 'sujet' | 'reponse' | 'ressource', id: string) {
  await requireAdmin()

  const supabase = await createClient()

  let table: string
  if (type === 'sujet') table = 'sujets_forum'
  else if (type === 'reponse') table = 'reponses_forum'
  else table = 'ressources'

  const { error } = await supabase
    .from(table)
    .update({ signale: false })
    .eq('id', id)

  if (error) {
    console.error('Erreur lors de l\'ignor du signalement:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

/**
 * Supprimer un contenu signalé
 */
export async function deleteReportedContent(type: 'sujet' | 'reponse' | 'ressource', id: string) {
  await requireAdmin()

  const supabase = await createClient()

  let table: string
  if (type === 'sujet') table = 'sujets_forum'
  else if (type === 'reponse') table = 'reponses_forum'
  else table = 'ressources'

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erreur lors de la suppression:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/forum')
  revalidatePath('/ressources')
  return { success: true }
}

/**
 * Modifier le rôle d'un utilisateur
 */
export async function updateUserRole(userId: string, newRole: string) {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from('profils')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Erreur lors de la modification du rôle:', error)
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
