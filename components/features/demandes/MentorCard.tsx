'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { MessageButton } from '@/components/features/messages/MessageButton'
import { MentorMatch } from '@/types/database.types'
import { proposerAide } from '@/lib/actions/demandes.actions'

interface MentorCardProps {
  mentor: MentorMatch
  demandeId: string
  onSuccess?: () => void
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, demandeId, onSuccess }) => {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handlePropose(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await proposerAide(demandeId, message)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    }
  }

  return (
    <Card className="p-6 border-2 border-pousse/10 hover:border-pousse/30 transition-all duration-300">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
        {/* Infos Mentor */}
        <div className="flex gap-4 items-center">
          <Avatar name={mentor.nom_complet || 'Utilisateur'} size="md" />
          <div>
            <h4 className="font-display font-bold text-indigo-nuit">{mentor.nom_complet || 'Étudiant'}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="role-mentor">Mentor</Badge>
              {mentor.filiere && (
                <span className="text-xs text-brume font-mono">
                  {mentor.filiere} • {mentor.niveau}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score de pertinence */}
        <div className="flex flex-col items-end">
          <Badge variant="filiere" className="bg-pousse/10 text-pousse border-pousse/20">
            Pertinence: {mentor.score}
          </Badge>
          <span className="text-[10px] text-brume mt-1">Algorithme du Grin</span>
        </div>
      </div>

      {mentor.bio && (
        <p className="text-xs text-brume leading-relaxed mb-4 pl-1">
          {mentor.bio}
        </p>
      )}

      {mentor.centres_interet && mentor.centres_interet.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {mentor.centres_interet.map((ci) => (
            <span key={ci} className="text-[10px] bg-indigo-nuit/5 text-indigo-nuit px-2 py-0.5 rounded font-mono">
              #{ci}
            </span>
          ))}
        </div>
      )}

      {success ? (
        <div className="p-3 bg-pousse/10 border border-pousse/20 text-pousse text-xs font-semibold rounded-xl text-center">
          ✓ Proposition d&apos;aide envoyée avec succès !
        </div>
      ) : showForm ? (
        <form onSubmit={handlePropose} className="space-y-4 pt-4 border-t border-indigo-nuit/5 animate-fade-in">
          <Textarea
            label="Votre message d'accompagnement (optionnel)"
            placeholder="Expliquez brièvement comment vous pouvez aider..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
          
          {error && (
            <div className="text-xs text-terre font-medium">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={loading}
            >
              {loading ? 'Envoi...' : 'Confirmer la proposition'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end gap-2 pt-2 border-t border-indigo-nuit/5">
          <MessageButton
            userId={mentor.id}
            userName={mentor.nom_complet || 'Ce mentor'}
            variant="secondary"
            size="sm"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Proposer mon aide
          </Button>
        </div>
      )}
    </Card>
  )
}
export default MentorCard
