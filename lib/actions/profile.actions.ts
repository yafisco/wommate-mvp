'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { becomeMentorSchema } from '@/lib/validations/schemas'
import { Profil } from '@/types/database.types'

export async function getProfile() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profils')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    // Si la ligne n'existe pas en base de données, on renvoie un profil temporaire/par défaut
    // pour éviter la boucle de redirection infinie de l'onboarding
    if (error.code === 'PGRST116') {
      return {
        id: user.id,
        nom_complet: user.user_metadata?.nom_complet || user.user_metadata?.full_name || '',
        role: 'etudiant',
        filiere: null,
        niveau: null,
        centres_interet: [],
        bio: null,
      }
    }
    return null
  }

  return data
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const filiere = formData.get('filiere') as string
  const niveau = formData.get('niveau') as string
  const bio = formData.get('bio') as string
  const centres_interet = (formData.get('centres_interet') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
  const nom_complet = formData.get('nom_complet') as string
  const photo_url = formData.get('photo_url') as string

  const profileData = {
    id: user.id,
    filiere,
    niveau,
    bio,
    centres_interet,
    nom_complet: nom_complet || user.user_metadata?.nom_complet || user.user_metadata?.full_name || '',
    photo_url: photo_url || null
  }

  // Upsert garantit la création du profil lors de l'onboarding,
  // même si le trigger on_auth_user_created n'a pas créé la ligne
  const { error } = await supabase
    .from('profils')
    .upsert(profileData, { onConflict: 'id' })

  if (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/profil')
  revalidatePath('/onboarding')
  return { success: true }
}

/**
 * Permet à un utilisateur de devenir mentor
 */
export async function becomeMentor(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier que l'utilisateur a accepté les règles
  const rulesAccepted = formData.get('rules_accepted') === 'true'
  if (!rulesAccepted) {
    return { error: 'Vous devez accepter les règles de mentorat pour continuer.' }
  }

  // Validation avec Zod
  const filiere = formData.get('filiere') as string
  const niveau = formData.get('niveau') as string
  const bio = formData.get('bio') as string
  const centres_interet = (formData.get('centres_interet') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []

  const validationResult = becomeMentorSchema.safeParse({
    filiere,
    niveau,
    bio,
    centres_interet
  })

  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message }
  }

  // Vérifier le niveau minimum (L3 ou équivalent)
  const niveauLower = validationResult.data.niveau.toLowerCase()
  const niveauxAutorises = ['l3', 'm1', 'm2', 'master1', 'master2', 'doctorat', 'phd']
  if (!niveauxAutorises.some(n => niveauLower.includes(n))) {
    return { error: 'Le niveau minimum requis pour devenir mentor est L3 (Licence 3) ou équivalent.' }
  }

  // Mettre à jour le profil avec le rôle mentor
  const { error } = await supabase
    .from('profils')
    .update({
      role: 'mentor',
      filiere: validationResult.data.filiere,
      niveau: validationResult.data.niveau,
      bio: validationResult.data.bio,
      centres_interet: validationResult.data.centres_interet,
      mentor_rules_accepted: true,
      mentor_rules_accepted_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error('Erreur lors de l\'inscription mentor:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  revalidatePath('/profil')
  revalidatePath('/mentors')
  return { success: true }
}

/**
 * Récupère les règles de mentorat
 */
export async function getMentorRules() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mentor_rules')
    .select('*')
    .order('ordre', { ascending: true })

  if (error) {
    console.error('Erreur lors de la récupération des règles:', error)
    return []
  }

  return data || []
}

/**
 * Récupère tous les profils utilisateurs
 */
export async function getAllUsers(
  search?: string,
  role?: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ users: Profil[], total: number }> {
  const supabase = await createClient()

  let query = supabase
    .from('profils')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search && search.trim() !== '') {
    query = query.or(`nom_complet.ilike.%${search}%,bio.ilike.%${search}%`)
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
 * Upload une photo de profil
 */
export async function uploadProfilePhoto(file: File): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Vérifier le type de fichier
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.' }
  }

  // Vérifier la taille (5MB max)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { error: 'La photo ne doit pas dépasser 5MB.' }
  }

  // Générer un nom de fichier unique
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  // Upload du fichier
  const { data, error } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      upsert: true
    })

  if (error) {
    console.error('Erreur lors de l\'upload:', error)
    return { error: error.message }
  }

  // Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filePath)

  // Mettre à jour le profil avec l'URL de la photo
  const { error: updateError } = await supabase
    .from('profils')
    .update({ photo_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('Erreur lors de la mise à jour du profil:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/profil')
  revalidatePath('/utilisateurs')
  revalidatePath('/mentors')

  return { url: publicUrl }
}
