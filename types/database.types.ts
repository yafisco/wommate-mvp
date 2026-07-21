export type RoleUtilisateur = 'etudiant' | 'mentor' | 'enseignant' | 'admin'

export interface Profil {
  id: string
  nom_complet: string | null
  role: RoleUtilisateur
  filiere: string | null
  niveau: string | null
  centres_interet: string[]
  bio: string | null
  photo_url: string | null
  created_at: string
}

export type StatutDemande = 'ouverte' | 'en_cours' | 'resolue'

export interface DemandeAide {
  id: string
  auteur_id: string
  titre: string
  filiere: string | null
  description: string | null
  niveau_requis: string | null
  statut: StatutDemande
  created_at: string
}

export type TypeRessource = 'fichier' | 'lien'

export interface Ressource {
  id: string
  auteur_id: string
  titre: string
  description: string | null
  filiere: string | null
  type: TypeRessource
  url: string
  taille_octets: number | null
  storage_path: string | null
  download_count: number
  created_at: string
}

export interface RessourceAvecAuteur extends Ressource {
  auteur_nom: string | null
  auteur_filiere: string | null
  auteur_niveau: string | null
}

export interface Message {
  id: string
  conversation_id: string
  expediteur_id: string
  destinataire_id: string
  contenu: string
  lu: boolean
  created_at: string
}

export interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  created_at: string
  updated_at: string
}

export interface ConversationWithLastMessage extends Conversation {
  last_message_id: string | null
  last_message_content: string | null
  last_message_sender_id: string | null
  last_message_at: string | null
  last_message_read: boolean | null
  unread_count: number
}

export interface MessageAvecAuteur extends Message {
  auteur: Profil
}

export interface ConversationAvecProfil extends Conversation {
  other_participant: Profil
}

export interface GroupeThematique {
  id: string
  nom: string
  filiere: string | null
  description: string | null
}

export interface SujetForum {
  id: string
  groupe_id: string
  auteur_id: string
  titre: string
  contenu: string | null
  signale: boolean
  created_at: string
  updated_at: string
  tags?: string[]
}

export interface ReponseForum {
  id: string
  sujet_id: string
  auteur_id: string
  contenu: string
  signale: boolean
  created_at: string
  parent_id?: string | null
  updated_at?: string
}

export interface ReactionForum {
  id: string
  cible_type: 'sujet' | 'reponse'
  cible_id: string
  utilisateur_id: string
  type: 'utile' | 'merci'
  created_at: string
}

export interface SujetForumWithReactionCounts extends SujetForum {
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
}

export interface ReponseForumWithDetails extends ReponseForum {
  auteur_nom: string | null
  auteur_filiere: string | null
  auteur_niveau: string | null
  auteur_role: string
  utile_count?: number
  merci_count?: number
}

export interface Notification {
  id: string
  destinataire_id: string
  type: string
  contenu: string
  lien: string | null
  lu: boolean
  created_at: string
}

export interface PropositionAide {
  id: string
  demande_id: string
  mentor_id: string
  message: string
  statut: 'en_attente' | 'acceptee' | 'refusee'
  created_at: string
}

export interface DemandeAideAvecAuteur extends DemandeAide {
  auteur: Profil
}

export interface MentorMatch extends Profil {
  score: number
}

export interface PropositionAideAvecMentor extends PropositionAide {
  mentor: Profil
}

