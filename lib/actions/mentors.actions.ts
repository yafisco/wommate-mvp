'use server'

import { createClient } from '@/lib/supabase/server'
import { Profil } from '@/types/database.types'

/**
 * Récupère la liste des mentors avec filtres
 */
export async function getMentors(
  search?: string,
  filiere?: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ mentors: Profil[], total: number }> {
  const supabase = await createClient()

  let query = supabase
    .from('profils')
    .select('*', { count: 'exact' })
    .eq('role', 'mentor')
    .order('created_at', { ascending: false })

  if (search && search.trim() !== '') {
    query = query.or(`nom_complet.ilike.%${search}%,bio.ilike.%${search}%`)
  }

  if (filiere && filiere !== 'all') {
    query = query.eq('filiere', filiere)
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Erreur lors de la récupération des mentors:', error)
    return { mentors: [], total: 0 }
  }

  return { mentors: (data || []) as Profil[], total: count || 0 }
}

/**
 * Récupère un mentor par ID
 */
export async function getMentorById(id: string): Promise<Profil | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profils')
    .select('*')
    .eq('id', id)
    .eq('role', 'mentor')
    .single()

  if (error) {
    console.error('Erreur lors de la récupération du mentor:', error)
    return null
  }

  return data as Profil
}

/**
 * Récupère les filières disponibles
 */
export async function getAvailableFilieres(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profils')
    .select('filiere')
    .eq('role', 'mentor')
    .not('filiere', 'is', null)
    .order('filiere')

  if (error) {
    console.error('Erreur lors de la récupération des filières:', error)
    return []
  }

  const filieres = [...new Set(data?.map(p => p.filiere).filter(Boolean))]
  return filieres as string[]
}
