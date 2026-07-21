'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DemandeAideAvecAuteur, MentorMatch, PropositionAideAvecMentor } from '@/types/database.types'

/**
 * Récupère les demandes d'aide ouvertes
 */
export async function getDemandes(filiere?: string): Promise<DemandeAideAvecAuteur[]> {
  const supabase = await createClient()

  let query = supabase
    .from('demandes_aide')
    .select('*, auteur:profils(*)')
    .eq('statut', 'ouverte')
    .order('created_at', { ascending: false })

  if (filiere && filiere !== '') {
    query = query.eq('filiere', filiere)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erreur lors de la récupération des demandes d\'aide:', error)
    return []
  }

  return (data || []) as unknown as DemandeAideAvecAuteur[]
}

/**
 * Récupère une demande d'aide par son ID
 */
export async function getDemandeById(id: string): Promise<DemandeAideAvecAuteur | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('demandes_aide')
    .select('*, auteur:profils(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Erreur lors de la récupération de la demande ${id}:`, error)
    return null
  }

  return data as unknown as DemandeAideAvecAuteur
}

/**
 * Crée une nouvelle demande d'aide
 */
export async function createDemande(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const titre = formData.get('titre') as string
  const filiere = formData.get('filiere') as string
  const niveau_requis = formData.get('niveau_requis') as string
  const description = formData.get('description') as string

  if (!titre || !filiere || !niveau_requis) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' }
  }

  const { data, error } = await supabase
    .from('demandes_aide')
    .insert({
      auteur_id: user.id,
      titre,
      filiere,
      description,
      niveau_requis,
      statut: 'ouverte'
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur lors de la création de la demande:', error)
    return { error: error.message }
  }

  revalidatePath('/demandes')
  return { success: true, id: data.id }
}

/**
 * Récupère les mentors suggérés par le matching algorithmique pour une demande
 */
export async function getMatchingMentors(demandeId: string): Promise<MentorMatch[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('match_mentors_for_demande', { demande_uuid: demandeId })

  if (error) {
    console.error('Erreur lors du matching des mentors:', error)
    return []
  }

  return data as MentorMatch[]
}

/**
 * Permet à un mentor de proposer son aide pour une demande
 */
export async function proposerAide(demandeId: string, message?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('propositions_aide')
    .insert({
      demande_id: demandeId,
      mentor_id: user.id,
      message: message || null,
      statut: 'en_attente'
    })

  if (error) {
    console.error('Erreur lors de la proposition d\'aide:', error)
    return { error: error.message }
  }

  revalidatePath(`/demandes/${demandeId}`)
  return { success: true }
}

/**
 * Récupère les propositions d'aide reçues pour une demande
 */
export async function getPropositions(demandeId: string): Promise<PropositionAideAvecMentor[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('propositions_aide')
    .select('*, mentor:profils(*)')
    .eq('demande_id', demandeId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des propositions:', error)
    return []
  }

  return (data || []) as unknown as PropositionAideAvecMentor[]
}

/**
 * Accepte une proposition d'aide
 */
export async function accepterProposition(propositionId: string, demandeId: string) {
  const supabase = await createClient()

  // 1. Accepter la proposition sélectionnée
  const { error: acceptError } = await supabase
    .from('propositions_aide')
    .update({ statut: 'acceptee' })
    .eq('id', propositionId)

  if (acceptError) {
    console.error('Erreur lors de l\'acceptation de la proposition:', acceptError)
    return { error: acceptError.message }
  }

  // 2. Refuser les autres propositions en attente pour cette demande
  await supabase
    .from('propositions_aide')
    .update({ statut: 'refusee' })
    .eq('demande_id', demandeId)
    .neq('id', propositionId)
    .eq('statut', 'en_attente')

  // 3. Mettre à jour le statut de la demande d'aide à 'en_cours'
  await supabase
    .from('demandes_aide')
    .update({ statut: 'en_cours' })
    .eq('id', demandeId)

  revalidatePath(`/demandes/${demandeId}`)
  revalidatePath('/demandes')
  return { success: true }
}

/**
 * Récupère les demandes ouvertes les plus pertinentes pour le profil actuel (mentor)
 */
export async function getMatchingDemands(filiere?: string): Promise<DemandeAideAvecAuteur[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Récupérer le profil de l'utilisateur connecté
  const { data: profil } = await supabase
    .from('profils')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profil) return []

  // Récupérer les demandes avec scoring de pertinence
  let query = supabase
    .from('demandes_aide')
    .select('*, auteur:profils(*)')
    .eq('statut', 'ouverte')
    .neq('auteur_id', user.id) // Exclure les demandes de l'utilisateur lui-même

  if (filiere && filiere !== '') {
    query = query.eq('filiere', filiere)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur lors de la récupération des demandes pertinentes:', error)
    return []
  }

  // Score de pertinence simple en JavaScript
  const scored = (data || []).map((demande) => ({
    ...demande,
    _score:
      // +2 points si même filière
      (profil.filiere === demande.filiere ? 2 : 0) +
      // +1 point par mot-clé trouvé
      (profil.centres_interet || []).filter(keyword =>
        (demande.titre + ' ' + (demande.description || '')).toLowerCase().includes(keyword.toLowerCase())
      ).length
  }))

  // Trier par score décroissant
  return scored
    .sort((a, b) => (b._score || 0) - (a._score || 0))
    .map(({ _score, ...d }) => d)
}

/**
 * Récupère les statistiques du système de matching
 */
export async function getMatchingStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('matching_stats')
    .select('*')
    .single()

  if (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return null
  }

  return data
}
