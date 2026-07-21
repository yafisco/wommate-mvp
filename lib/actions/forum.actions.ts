'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { GroupeThematique, SujetForum, ReponseForum } from '@/types/database.types'
import { createGroupeThematiqueSchema, createSujetSchema, createReponseSchema } from '@/lib/validations/schemas'

// Legacy interface pour compatibilité
interface SujetWithDetails extends SujetWithReactionCounts {}

interface ReponseWithAuteur extends ReponseForum {
  auteur_nom: string | null
  auteur_filiere: string | null
  auteur_niveau: string | null
  auteur_role: string
  parent_id?: string | null
  utile_count?: number
  merci_count?: number
}

interface SujetWithReactionCounts extends SujetForum {
  auteur_nom: string | null
  auteur_filiere: string | null
  auteur_niveau: string | null
  auteur_role: string
  groupe_nom: string
  groupe_filiere: string | null
  groupe_couleur?: string
  reponse_count: number
  utile_count: number
  merci_count: number
  derniere_reponse_at: string | null
  tags?: string[]
}

/**
 * Récupère tous les groupes thématiques
 */
export async function getGroupesThematiques(): Promise<GroupeThematique[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groupes_thematiques')
    .select('*')
    .order('nom')

  if (error) {
    console.error('Erreur lors de la récupération des groupes:', error)
    return []
  }

  return (data || []) as GroupeThematique[]
}

/**
 * Crée un nouveau groupe thématique (admin ou utilisateur connecté)
 */
export async function createGroupeThematique(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Validation avec Zod
  const nom = formData.get('nom') as string
  const filiere = formData.get('filiere') as string
  const description = formData.get('description') as string

  const validationResult = createGroupeThematiqueSchema.safeParse({
    nom,
    filiere,
    description
  })

  if (!validationResult.success) {
    return { error: validationResult.error.errors[0].message }
  }

  const { data, error } = await supabase
    .from('groupes_thematiques')
    .insert({
      nom: validationResult.data.nom.trim(),
      filiere: validationResult.data.filiere?.trim() || null,
      description: validationResult.data.description?.trim() || null
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la création du groupe:', error)
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true, data }
}

/**
 * Supprime un groupe thématique (admin uniquement)
 */
export async function deleteGroupeThematique(groupeId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier si l'utilisateur est admin
  const { data: profil } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'admin') {
    return { error: 'Seuls les administrateurs peuvent supprimer des groupes' }
  }

  const { error } = await supabase
    .from('groupes_thematiques')
    .delete()
    .eq('id', groupeId)

  if (error) {
    console.error('Erreur lors de la suppression du groupe:', error)
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true }
}

/**
 * Récupère les sujets d'un groupe avec pagination et filtres
 */
export async function getSujetsByGroupe(
  groupeId: string,
  limit: number = 20,
  offset: number = 0,
  searchQuery?: string,
  filter?: 'recent' | 'popular' | 'unanswered'
): Promise<SujetWithReactionCounts[]> {
  const supabase = await createClient()

  let query = supabase
    .from('sujets_with_reaction_counts')
    .select('*')
    .eq('groupe_id', groupeId)

  // Filtre recherche
  if (searchQuery && searchQuery.trim().length > 0) {
    query = query.ilike('titre', `%${searchQuery.trim()}%`)
  }

  // Filtres supplémentaires
  if (filter === 'unanswered') {
    query = query.eq('reponse_count', 0)
  }

  // Tri selon le filtre
  if (filter === 'popular') {
    query = query.order('reponse_count', { ascending: false })
  } else {
    query = query.order('updated_at', { ascending: false })
  }

  const { data, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Erreur lors de la récupération des sujets:', error)
    return []
  }

  return (data || []) as SujetWithReactionCounts[]
}

/**
 * Récupère les sujets sans réponse (pour mentors)
 */
export async function getSujetsSansReponse(limit: number = 20): Promise<SujetWithReactionCounts[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sujets_with_reaction_counts')
    .select('*')
    .eq('reponse_count', 0)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erreur lors de la récupération des sujets sans réponse:', error)
    return []
  }

  return (data || []) as SujetWithReactionCounts[]
}

/**
 * Récupère les sujets signalés (pour admin/modération)
 */
export async function getSujetsSignales(limit: number = 20): Promise<SujetWithReactionCounts[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Vérifier si admin
  const { data: profil } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'admin') return []

  const { data, error } = await supabase
    .from('sujets_with_reaction_counts')
    .select('*')
    .eq('signale', true)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erreur lors de la récupération des sujets signalés:', error)
    return []
  }

  return (data || []) as SujetWithReactionCounts[]
}

/**
 * Annule le signalement d'un sujet (admin)
 */
export async function annulerSignalementSujet(sujetId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier si admin
  const { data: profil } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'admin') {
    return { error: 'Seuls les administrateurs peuvent annuler un signalement' }
  }

  const { error } = await supabase
    .from('sujets_forum')
    .update({ signale: false })
    .eq('id', sujetId)

  if (error) {
    console.error('Erreur lors de l\'annulation du signalement:', error)
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true }
}

/**
 * Annule le signalement d'une réponse (admin)
 */
export async function annulerSignalementReponse(reponseId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier si admin
  const { data: profil } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'admin') {
    return { error: 'Seuls les administrateurs peuvent annuler un signalement' }
  }

  const { error } = await supabase
    .from('reponses_forum')
    .update({ signale: false })
    .eq('id', reponseId)

  if (error) {
    console.error('Erreur lors de l\'annulation du signalement:', error)
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true }
}

/**
 * Récupère un sujet par ID (avec réactions)
 */
export async function getSujetById(sujetId: string): Promise<SujetWithReactionCounts | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sujets_with_reaction_counts')
    .select('*')
    .eq('id', sujetId)
    .single()

  if (error) {
    console.error('Erreur lors de la récupération du sujet:', error)
    return null
  }

  return data as SujetWithReactionCounts
}

/**
 * Crée un nouveau sujet
 */
export async function createSujet(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Validation avec Zod
  const groupeId = formData.get('groupeId') as string
  const titre = formData.get('titre') as string
  const contenu = formData.get('contenu') as string
  const tagsString = formData.get('tags') as string

  // Parser les tags depuis la string
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t.length > 0) : []

  const validationResult = createSujetSchema.safeParse({
    groupeId,
    titre,
    contenu,
    tags
  })

  if (!validationResult.success) {
    return { error: validationResult.error.errors[0].message }
  }

  // Nettoyer les tags
  const cleanedTags = (validationResult.data.tags || [])
    .map(tag => tag.toLowerCase().trim().replace(/\s+/g, '-'))
    .filter(tag => tag.length > 0)
    .slice(0, 5)

  const { data, error } = await supabase
    .from('sujets_forum')
    .insert({
      groupe_id: validationResult.data.groupeId,
      auteur_id: user.id,
      titre: validationResult.data.titre.trim(),
      contenu: contenu?.trim() || null,
      tags: cleanedTags.length > 0 ? cleanedTags : null
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la création du sujet:', error)
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true, data }
}

/**
 * Récupère les réponses d'un sujet avec pagination
 */
export async function getReponsesBySujet(
  sujetId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ReponseWithAuteur[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reponses_with_auteur')
    .select('*')
    .eq('sujet_id', sujetId)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Erreur lors de la récupération des réponses:', error)
    return []
  }

  return (data || []) as ReponseWithAuteur[]
}

/**
 * Crée une nouvelle réponse
 */
export async function createReponse(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Validation avec Zod
  const sujetId = formData.get('sujetId') as string
  const contenu = formData.get('contenu') as string

  const validationResult = createReponseSchema.safeParse({
    sujetId,
    contenu
  })

  if (!validationResult.success) {
    return { error: validationResult.error.errors[0].message }
  }

  const { data, error } = await supabase
    .from('reponses_forum')
    .insert({
      sujet_id: validationResult.data.sujetId,
      auteur_id: user.id,
      contenu: validationResult.data.contenu.trim()
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la création de la réponse:', error)
    return { error: error.message }
  }

  revalidatePath(`/forum/[groupeId]/[sujetId]`)
  return { success: true, data }
}

/**
 * Signale un sujet
 */
export async function signalerSujet(sujetId: string, motif?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .rpc('signaler_sujet', { sujet_id: sujetId, motif })

  if (error) {
    console.error('Erreur lors du signalement du sujet:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Signale une réponse
 */
export async function signalerReponse(reponseId: string, motif?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .rpc('signaler_reponse', { reponse_id: reponseId, motif })

  if (error) {
    console.error('Erreur lors du signalement de la réponse:', error)
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Supprime un sujet (auteur ou admin)
 */
export async function deleteSujet(sujetId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier que l'utilisateur est l'auteur
  const { data: sujet } = await supabase
    .from('sujets_forum')
    .select('auteur_id')
    .eq('id', sujetId)
    .single()

  if (!sujet) {
    return { error: 'Sujet non trouvé' }
  }

  if (sujet.auteur_id !== user.id) {
    return { error: 'Vous n\'avez pas les droits pour supprimer ce sujet' }
  }

  const { error } = await supabase
    .from('sujets_forum')
    .delete()
    .eq('id', sujetId)

  if (error) {
    console.error('Erreur lors de la suppression du sujet:', error)
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true }
}

/**
 * Supprime une réponse (auteur ou admin)
 */
export async function deleteReponse(reponseId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier que l'utilisateur est l'auteur
  const { data: reponse } = await supabase
    .from('reponses_forum')
    .select('auteur_id')
    .eq('id', reponseId)
    .single()

  if (!reponse) {
    return { error: 'Réponse non trouvée' }
  }

  if (reponse.auteur_id !== user.id) {
    return { error: 'Vous n\'avez pas les droits pour supprimer cette réponse' }
  }

  const { error } = await supabase
    .from('reponses_forum')
    .delete()
    .eq('id', reponseId)

  if (error) {
    console.error('Erreur lors de la suppression de la réponse:', error)
    return { error: error.message }
  }

  return { success: true }
}

// =========================================================================
// FONCTIONS ÉTENDUES POUR LE FORUM V2.0
// =========================================================================

/**
 * Bascule une réaction (ajoute si absente, retire si présente)
 */
export async function toggleReaction(
  cibleType: 'sujet' | 'reponse',
  cibleId: string,
  type: 'utile' | 'merci'
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier si la réaction existe déjà
  const { data: existingReaction } = await supabase
    .from('reactions_forum')
    .select('*')
    .eq('cible_type', cibleType)
    .eq('cible_id', cibleId)
    .eq('utilisateur_id', user.id)
    .eq('type', type)
    .single()

  if (existingReaction) {
    // Supprimer la réaction existante
    const { error } = await supabase
      .from('reactions_forum')
      .delete()
      .eq('id', existingReaction.id)

    if (error) {
      console.error('Erreur lors de la suppression de la réaction:', error)
      return { error: error.message }
    }

    revalidatePath('/forum')
    return { success: true, action: 'removed' }
  } else {
    // Ajouter la réaction
    const { error } = await supabase
      .from('reactions_forum')
      .insert({
        cible_type: cibleType,
        cible_id: cibleId,
        utilisateur_id: user.id,
        type
      })

    if (error) {
      console.error('Erreur lors de l\'ajout de la réaction:', error)
      return { error: error.message }
    }

    revalidatePath('/forum')
    return { success: true, action: 'added' }
  }
}

/**
 * Récupère les réactions d'une cible
 */
export async function getReactions(
  cibleType: 'sujet' | 'reponse',
  cibleId: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reactions_forum')
    .select('*')
    .eq('cible_type', cibleType)
    .eq('cible_id', cibleId)

  if (error) {
    console.error('Erreur lors de la récupération des réactions:', error)
    return []
  }

  return data || []
}

/**
 * Récupère les comptes de réactions pour une cible
 */
export async function getReactionCounts(
  cibleType: 'sujet' | 'reponse',
  cibleId: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reactions_forum')
    .select('type')
    .eq('cible_type', cibleType)
    .eq('cible_id', cibleId)

  if (error) {
    console.error('Erreur lors de la récupération des comptes de réactions:', error)
    return { utile: 0, merci: 0 }
  }

  const reactions = data || []
  return {
    utile: reactions.filter(r => r.type === 'utile').length,
    merci: reactions.filter(r => r.type === 'merci').length
  }
}

/**
 * Met à jour les tags d'un sujet
 */
export async function updateSujetTags(sujetId: string, tags: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier que l'utilisateur est l'auteur
  const { data: sujet } = await supabase
    .from('sujets_forum')
    .select('auteur_id')
    .eq('id', sujetId)
    .single()

  if (!sujet) {
    return { error: 'Sujet non trouvé' }
  }

  if (sujet.auteur_id !== user.id) {
    return { error: 'Vous n\'avez pas les droits pour modifier ce sujet' }
  }

  // Nettoyer les tags (minuscules, sans espaces, max 5)
  const cleanedTags = tags
    .map(tag => tag.toLowerCase().trim().replace(/\s+/g, '-'))
    .filter(tag => tag.length > 0)
    .slice(0, 5)

  const { error } = await supabase
    .from('sujets_forum')
    .update({ tags: cleanedTags })
    .eq('id', sujetId)

  if (error) {
    console.error('Erreur lors de la mise à jour des tags:', error)
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true, tags: cleanedTags }
}

/**
 * Récupère les sujets par tag
 */
export async function getSujetsByTag(
  tag: string,
  groupeId?: string,
  limit: number = 20
): Promise<SujetWithReactionCounts[]> {
  const supabase = await createClient()

  let query = supabase
    .from('sujets_with_reaction_counts')
    .select('*')
    .contains('tags', [tag.toLowerCase()])

  if (groupeId) {
    query = query.eq('groupe_id', groupeId)
  }

  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erreur lors de la récupération des sujets par tag:', error)
    return []
  }

  return (data || []) as SujetWithReactionCounts[]
}

/**
 * Récupère les tags populaires
 */
export async function getPopularTags(limit: number = 20): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags_populaires')
    .select('nom')
    .order('frequence', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erreur lors de la récupération des tags populaires:', error)
    return []
  }

  return (data || []).map(t => t.nom)
}

/**
 * Crée une réponse imbriquée
 */
export async function createReponseImbriquee(
  sujetId: string,
  contenu: string,
  parentId?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Validation
  if (!contenu || contenu.trim().length === 0) {
    return { error: 'La réponse ne peut pas être vide' }
  }

  // Si parentId, vérifier que la réponse parent existe
  if (parentId) {
    const { data: parentReponse } = await supabase
      .from('reponses_forum')
      .select('id, parent_id')
      .eq('id', parentId)
      .single()

    if (!parentReponse) {
      return { error: 'Réponse parent non trouvée' }
    }

    // Limiter à 2 niveaux : si parent a déjà un parent, refuser
    if (parentReponse.parent_id) {
      return { error: 'Impossible de répondre au-delà de 2 niveaux' }
    }
  }

  const { data, error } = await supabase
    .from('reponses_forum')
    .insert({
      sujet_id: sujetId,
      auteur_id: user.id,
      contenu: contenu.trim(),
      parent_id: parentId || null
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la création de la réponse:', error)
    return { error: error.message }
  }

  revalidatePath('/forum')
  return { success: true, data }
}

/**
 * Récupère les réponses hiérarchiques d'un sujet
 */
export async function getReponsesHierarchiques(
  sujetId: string,
  limit: number = 50
): Promise<ReponseWithAuteur[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reponses_with_auteur')
    .select('*')
    .eq('sujet_id', sujetId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Erreur lors de la récupération des réponses:', error)
    return []
  }

  return (data || []) as ReponseWithAuteur[]
}

/**
 * Récupère le nombre de contributions d'un utilisateur
 */
export async function getUserContributionCount(userId: string): Promise<number> {
  const supabase = await createClient()

  // Utiliser la fonction SQL créée dans la migration
  const { data, error } = await supabase
    .rpc('get_user_contribution_count', { user_id: userId })

  if (error) {
    console.error('Erreur lors de la récupération des contributions:', error)
    return 0
  }

  return data || 0
}

/**
 * Récupère les sujets avec comptes de réactions (remplace getSujetsByGroupe)
 */
export async function getSujetsWithReactionCounts(
  groupeId: string,
  limit: number = 20,
  offset: number = 0,
  searchQuery?: string,
  filter?: 'recent' | 'popular' | 'unanswered'
): Promise<SujetWithReactionCounts[]> {
  const supabase = await createClient()

  let query = supabase
    .from('sujets_with_reaction_counts')
    .select('*')
    .eq('groupe_id', groupeId)

  // Filtre recherche
  if (searchQuery && searchQuery.trim().length > 0) {
    query = query.ilike('titre', `%${searchQuery.trim()}%`)
  }

  // Filtres supplémentaires
  if (filter === 'unanswered') {
    query = query.eq('reponse_count', 0)
  }

  // Tri selon le filtre
  if (filter === 'popular') {
    // Popularité = réponses + réactions
    query = query.order('reponse_count', { ascending: false })
  } else {
    query = query.order('updated_at', { ascending: false })
  }

  const { data, error } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Erreur lors de la récupération des sujets:', error)
    return []
  }

  return (data || []) as SujetWithReactionCounts[]
}
