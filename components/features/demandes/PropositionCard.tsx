'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { PropositionAideAvecMentor } from '@/types/database.types'
import { accepterProposition } from '@/lib/actions/demandes.actions'
import { MessageButton } from '@/components/features/messages/MessageButton'

interface PropositionCardProps {
  proposition: PropositionAideAvecMentor
  demandeId: string
  isAuteurDemande: boolean
  onSuccess?: () => void
}

export const PropositionCard: React.FC<PropositionCardProps> = ({
  proposition,
  demandeId,
  isAuteurDemande,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dateFormatted = new Date(proposition.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  async function handleAccept() {
    setLoading(true)
    setError(null)
    const result = await accepterProposition(proposition.id, demandeId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      if (onSuccess) {
        onSuccess()
      }
    }
  }

  const badgeVariants = {
    en_attente: 'statut-en-cours',
    acceptee: 'role-mentor', // Utilisera la couleur verte pousse
    refusee: 'statut-resolue' // Gris
  } as const

  const statusLabels = {
    en_attente: 'En attente',
    acceptee: 'Acceptée',
    refusee: 'Déclinée'
  }

  return (
    <Card className={`p-6 border-l-4 ${proposition.statut === 'acceptee'
        ? 'border-l-pousse bg-pousse/5'
        : proposition.statut === 'refusee'
          ? 'border-l-indigo-nuit/20 bg-bone/30'
          : 'border-l-attaya bg-white'
      }`}>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
        {/* Infos Mentor */}
        <div className="flex gap-3 items-center">
          <Avatar name={proposition.mentor?.nom_complet || 'Utilisateur'} size="md" />
          <div>
            <h4 className="font-display font-bold text-indigo-nuit">
              {proposition.mentor?.nom_complet || 'Mentor'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-brume font-mono">
                {proposition.mentor?.filiere} • {proposition.mentor?.niveau}
              </span>
            </div>
          </div>
        </div>

        {/* Statut et Date */}
        <div className="flex flex-col items-end">
          <Badge variant={badgeVariants[proposition.statut]}>
            {statusLabels[proposition.statut]}
          </Badge>
          <span className="text-[10px] text-brume mt-1 font-mono">{dateFormatted}</span>
        </div>
      </div>

      {proposition.message && (
        <div className="bg-bone/50 p-4 rounded-xl text-xs text-encre leading-relaxed italic border border-indigo-nuit/5 mb-4">
          &ldquo;{proposition.message}&rdquo;
        </div>
      )}

      {error && (
        <div className="text-xs text-terre font-medium mb-3">{error}</div>
      )}

      {/* Bouton d'action si c'est l'auteur de la demande et que le statut est en attente */}
      {isAuteurDemande && proposition.statut === 'en_attente' && (
        <div className="flex justify-end gap-2 pt-2 border-t border-indigo-nuit/5">
          <MessageButton
            userId={proposition.mentor_id}
            userName={proposition.mentor?.nom_complet}
            variant="secondary"
            className="px-3 py-2 text-sm"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? 'Acceptation...' : 'Accepter l\'accompagnement'}
          </Button>
        </div>
      )}
    </Card>
  )
}
export default PropositionCard
