import React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { MessageButton } from '@/components/features/messages/MessageButton'
import { DemandeAideAvecAuteur } from '@/types/database.types'

interface DemandeCardProps {
  demande: DemandeAideAvecAuteur
}

export const DemandeCard: React.FC<DemandeCardProps> = ({ demande }) => {
  const dateFormatted = new Date(demande.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  // Limite la description à 150 caractères
  const truncatedDescription = demande.description
    ? demande.description.length > 150
      ? `${demande.description.substring(0, 150)}...`
      : demande.description
    : "Aucune description fournie."

  return (
    <Card hoverable className="h-full flex flex-col justify-between p-6">
      <div className="flex flex-col gap-4">
        {/* En-tête : Badge filière et niveau */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {demande.filiere && (
            <Badge variant="filiere">{demande.filiere}</Badge>
          )}
          {demande.niveau_requis && (
            <span className="text-xs font-mono text-brume bg-bone px-2 py-0.5 rounded">
              Niveau: {demande.niveau_requis}
            </span>
          )}
        </div>

        {/* Titre & Description */}
        <div className="flex flex-col gap-2">
          <Link href={`/demandes/${demande.id}`}>
            <h3 className="font-display text-lg font-bold text-indigo-nuit hover:text-attaya transition-colors duration-200 line-clamp-2">
              {demande.titre}
            </h3>
          </Link>
          <p className="text-xs text-brume leading-relaxed line-clamp-3">
            {truncatedDescription}
          </p>
        </div>
      </div>

      {/* Pied de carte : Auteur et date */}
      <div className="flex items-center justify-between border-t border-indigo-nuit/5 pt-4 mt-6">
        <div className="flex items-center gap-2">
          <Avatar
            name={demande.auteur?.nom_complet || 'Utilisateur'}
            size="sm"
          />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-encre">
              {demande.auteur?.nom_complet || 'Étudiant'}
            </span>
            <span className="text-[10px] text-brume">
              {demande.auteur?.role === 'mentor' ? 'Mentor' : 'Étudiant'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-brume">
            {dateFormatted}
          </span>
          {demande.auteur_id && (
            <MessageButton
              userId={demande.auteur_id}
              userName={demande.auteur?.nom_complet || 'Cet utilisateur'}
              variant="secondary"
              size="sm"
            />
          )}
        </div>
      </div>
    </Card>
  )
}
export default DemandeCard
