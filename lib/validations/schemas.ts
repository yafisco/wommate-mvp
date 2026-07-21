import { z } from 'zod'

// Schémas de validation pour le forum
export const createGroupeThematiqueSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  filiere: z.string().optional(),
  description: z.string().max(500).optional()
})

export const createSujetSchema = z.object({
  groupeId: z.string().uuid('ID de groupe invalide'),
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  contenu: z.string().max(5000).optional(),
  tags: z.array(z.string()).max(5).optional()
})

export const createReponseSchema = z.object({
  sujetId: z.string().uuid('ID de sujet invalide'),
  contenu: z.string().min(1, 'La réponse ne peut pas être vide').max(5000),
  parentId: z.string().uuid().optional()
})

// Schémas de validation pour les demandes d'aide
export const createDemandeSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  filiere: z.string().optional(),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000),
  niveau_requis: z.string().optional()
})

export const createPropositionSchema = z.object({
  demandeId: z.string().uuid('ID de demande invalide'),
  message: z.string().min(5, 'Le message doit contenir au moins 5 caractères').max(1000)
})

// Schémas de validation pour les ressources
export const createRessourceSchema = z.object({
  titre: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  description: z.string().max(2000).optional(),
  filiere: z.string().optional(),
  type: z.enum(['fichier', 'lien']),
  url: z.string().url('URL invalide'),
  taille_octets: z.number().optional()
})

// Schémas de validation pour le profil
export const updateProfilSchema = z.object({
  nom_complet: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  filiere: z.string().optional(),
  niveau: z.string().optional(),
  bio: z.string().max(500).optional(),
  centres_interet: z.array(z.string()).optional()
})

// Schémas de validation pour l'inscription mentor
export const becomeMentorSchema = z.object({
  filiere: z.string().min(2, 'La filière doit contenir au moins 2 caractères').max(100),
  niveau: z.string().min(2, 'Le niveau doit contenir au moins 2 caractères').max(50),
  bio: z.string().min(20, 'La bio doit contenir au moins 20 caractères').max(500, 'La bio ne peut pas dépasser 500 caractères'),
  centres_interet: z.array(z.string()).min(1, 'Au moins un centre d\'intérêt est requis').max(10, 'Maximum 10 centres d\'intérêt')
})

// Schémas de validation pour les messages
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid('ID de conversation invalide'),
  contenu: z.string().min(1, 'Le message ne peut pas être vide').max(5000)
})

// Types inférés des schémas
export type CreateGroupeThematiqueInput = z.infer<typeof createGroupeThematiqueSchema>
export type CreateSujetInput = z.infer<typeof createSujetSchema>
export type CreateReponseInput = z.infer<typeof createReponseSchema>
export type CreateDemandeInput = z.infer<typeof createDemandeSchema>
export type CreatePropositionInput = z.infer<typeof createPropositionSchema>
export type CreateRessourceInput = z.infer<typeof createRessourceSchema>
export type UpdateProfilInput = z.infer<typeof updateProfilSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type BecomeMentorInput = z.infer<typeof becomeMentorSchema>

// Schéma de validation pour les réactions
export const toggleReactionSchema = z.object({
  cibleType: z.enum(['sujet', 'reponse']),
  cibleId: z.string().uuid(),
  type: z.enum(['utile', 'merci'])
})

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>
