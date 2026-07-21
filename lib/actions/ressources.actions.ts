'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { RessourceAvecAuteur, Ressource } from '@/types/database.types'
import { validateFile, generateStoragePath, getFileExtension, FILE_SIZE_LIMIT } from '@/lib/utils/fileValidation'

/**
 * Récupère les ressources avec filtres optionnels
 */
export async function getRessources(
    filiere?: string,
    search?: string,
    limit: number = 50,
    offset: number = 0
): Promise<RessourceAvecAuteur[]> {
    const supabase = await createClient()

    let query = supabase
        .from('ressources_with_author')
        .select('*')
        .order('created_at', { ascending: false })

    if (filiere && filiere !== '') {
        query = query.eq('filiere', filiere)
    }

    if (search && search.trim() !== '') {
        const searchTerm = `%${search.trim()}%`
        query = query.or(`titre.ilike.${searchTerm},description.ilike.${searchTerm}`)
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
        console.error('Erreur lors de la récupération des ressources:', error)
        return []
    }

    return (data || []) as RessourceAvecAuteur[]
}

/**
 * Récupère une ressource par ID
 */
export async function getRessourceById(id: string): Promise<RessourceAvecAuteur | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('ressources_with_author')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error(`Erreur lors de la récupération de la ressource ${id}:`, error)
        return null
    }

    return data as RessourceAvecAuteur
}

/**
 * Upload une ressource (fichier)
 */
export async function uploadRessource(formData: FormData, existingStoragePath?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const file = formData.get('file') as File
    const titre = formData.get('titre') as string
    const description = formData.get('description') as string
    const filiere = formData.get('filiere') as string

    // Validation côté serveur
    if (!file && !existingStoragePath) {
        return { error: 'Aucun fichier sélectionné' }
    }

    if (!titre || titre.trim().length === 0) {
        return { error: 'Le titre est obligatoire' }
    }

    if (!filiere || filiere === '') {
        return { error: 'La filière est obligatoire' }
    }

    let storagePath = existingStoragePath

    // Si le fichier n'a pas été uploadé via le hook, le faire ici
    if (file && !storagePath) {
        // Valider le fichier
        const validation = validateFile(file)
        if (!validation.valid) {
            return { error: validation.error }
        }

        // Générer le chemin de stockage
        storagePath = generateStoragePath(user.id, file.name)

        // Upload dans Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ressources-pedagogiques')
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Erreur lors de l\'upload du fichier:', uploadError)
            return { error: 'Erreur lors de l\'upload du fichier: ' + uploadError.message }
        }
    }

    // Enregistrer la ressource en base de données
    const { data, error: dbError } = await supabase
        .from('ressources')
        .insert({
            auteur_id: user.id,
            titre: titre.trim(),
            description: description?.trim() || null,
            filiere,
            type: 'fichier',
            url: storagePath,
            storage_path: storagePath,
            taille_octets: file?.size
        })
        .select()
        .single()

    if (dbError) {
        console.error('Erreur lors de l\'enregistrement de la ressource:', dbError)
        // Supprimer le fichier uploadé si l'enregistrement échoue
        if (storagePath) {
            await supabase.storage.from('ressources-pedagogiques').remove([storagePath])
        }
        return { error: 'Erreur lors de l\'enregistrement de la ressource' }
    }

    revalidatePath('/ressources')
    return { success: true, data }
}

/**
 * Crée une ressource lien (sans fichier)
 */
export async function createLinkRessource(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const titre = formData.get('titre') as string
    const description = formData.get('description') as string
    const filiere = formData.get('filiere') as string
    const url = formData.get('url') as string

    if (!titre || titre.trim().length === 0) {
        return { error: 'Le titre est obligatoire' }
    }

    if (!filiere || filiere === '') {
        return { error: 'La filière est obligatoire' }
    }

    if (!url || !url.match(/^https?:\/\/.+/)) {
        return { error: 'URL invalide' }
    }

    const { data, error } = await supabase
        .from('ressources')
        .insert({
            auteur_id: user.id,
            titre: titre.trim(),
            description: description?.trim() || null,
            filiere,
            type: 'lien',
            url: url.trim()
        })
        .select()
        .single()

    if (error) {
        console.error('Erreur lors de la création du lien:', error)
        return { error: error.message }
    }

    revalidatePath('/ressources')
    return { success: true, data }
}

/**
 * Génère une URL signée pour télécharger un fichier (10 secondes)
 */
export async function getDownloadUrl(ressourceId: string) {
    const supabase = await createClient()

    // Récupérer la ressource avec cache si possible
    const { data: ressource, error: ressError } = await supabase
        .from('ressources')
        .select('storage_path, type')
        .eq('id', ressourceId)
        .single()

    if (ressError || !ressource || ressource.type !== 'fichier' || !ressource.storage_path) {
        return { error: 'Ressource non trouvée ou pas de fichier' }
    }

    // Générer l'URL signée avec expiration 10 secondes
    // Optimisation: utilise le CDN de Supabase automatiquement
    const { data, error } = await supabase.storage
        .from('ressources-pedagogiques')
        .createSignedUrl(ressource.storage_path, 10, {
            // Optimisation du téléchargement
            download: true
        })

    if (error) {
        console.error('Erreur lors de la génération de l\'URL:', error)
        return { error: 'Erreur lors de la génération de l\'URL de téléchargement' }
    }

    // Incrémenter le compteur de téléchargements en arrière-plan (non-bloquant)
    supabase.rpc('increment_download_count', { resource_id: ressourceId }).catch(err => {
        console.warn('Erreur lors de l\'incrémentation du compteur:', err)
    })

    return { success: true, url: data.signedUrl }
}

/**
 * Supprime une ressource
 */
export async function deleteRessource(ressourceId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    // Récupérer la ressource pour vérifier l'auteur et obtenir le path
    const { data: ressource, error: fetchError } = await supabase
        .from('ressources')
        .select('auteur_id, storage_path, type')
        .eq('id', ressourceId)
        .single()

    if (fetchError || !ressource) {
        return { error: 'Ressource non trouvée' }
    }

    if (ressource.auteur_id !== user.id) {
        return { error: 'Vous n\'avez pas les droits pour supprimer cette ressource' }
    }

    // Supprimer le fichier du storage si c'est un fichier
    if (ressource.type === 'fichier' && ressource.storage_path) {
        await supabase.storage.from('ressources-pedagogiques').remove([ressource.storage_path])
    }

    // Supprimer la ressource de la base de données
    const { error: deleteError } = await supabase
        .from('ressources')
        .delete()
        .eq('id', ressourceId)

    if (deleteError) {
        console.error('Erreur lors de la suppression:', deleteError)
        return { error: error.message }
    }

    revalidatePath('/ressources')
    return { success: true }
}

/**
 * Récupère les ressources de l'utilisateur connecté
 */
export async function getMyRessources(): Promise<RessourceAvecAuteur[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('ressources_with_author')
        .select('*')
        .eq('auteur_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Erreur lors de la récupération des ressources:', error)
        return []
    }

    return (data || []) as RessourceAvecAuteur[]
}
