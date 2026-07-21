'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getReportedContent, ignoreReport, deleteReportedContent, warnUser } from '@/lib/actions/admin.actions'

interface ReportedItem {
  id: string
  type: 'sujet' | 'reponse' | 'ressource'
  titre?: string
  contenu?: string
  auteur?: { nom_complet: string | null; id: string }
  groupe?: { nom: string }
  sujet?: { titre: string }
  created_at: string
}

export const ReportedContentList: React.FC = () => {
  const [reported, setReported] = useState<{
    sujets: ReportedItem[]
    reponses: ReportedItem[]
    ressources: ReportedItem[]
  }>({ sujets: [], reponses: [], ressources: [] })
  const [loading, setLoading] = useState(true)
  const [warningMessage, setWarningMessage] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'sujet' | 'reponse' | 'ressource'>('all')

  useEffect(() => {
    loadReportedContent()
  }, [])

  async function loadReportedContent() {
    setLoading(true)
    try {
      const data = await getReportedContent()
      setReported(data)
    } catch (error) {
      console.error('Erreur lors du chargement des contenus signalés:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleIgnore(type: 'sujet' | 'reponse' | 'ressource', id: string) {
    try {
      await ignoreReport(type, id)
      await loadReportedContent()
    } catch (error) {
      console.error('Erreur lors de l\'ignor du signalement:', error)
    }
  }

  async function handleDelete(type: 'sujet' | 'reponse' | 'ressource', id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return
    
    try {
      await deleteReportedContent(type, id)
      await loadReportedContent()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  async function handleWarn(userId: string) {
    if (!warningMessage.trim()) {
      alert('Veuillez entrer un message d\'avertissement')
      return
    }

    try {
      await warnUser(userId, warningMessage)
      alert('Avertissement envoyé avec succès')
      setWarningMessage('')
      setSelectedUserId(null)
    } catch (error) {
      console.error('Erreur lors de l\'avertissement:', error)
      alert('Erreur lors de l\'envoi de l\'avertissement')
    }
  }

  const allItems = [
    ...reported.sujets.map(item => ({ ...item, type: 'sujet' as const })),
    ...reported.reponses.map(item => ({ ...item, type: 'reponse' as const })),
    ...reported.ressources.map(item => ({ ...item, type: 'ressource' as const }))
  ]

  const filteredItems = typeFilter === 'all' 
    ? allItems 
    : allItems.filter(item => item.type === typeFilter)

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-indigo-nuit/10 rounded w-1/3 mb-2" />
            <div className="h-3 bg-indigo-nuit/10 rounded w-1/2" />
          </Card>
        ))}
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-pousse/10 text-pousse flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-brume">
          {allItems.length === 0 ? 'Aucun contenu signalé pour le moment.' : 'Aucun contenu correspondant au filtre.'}
        </p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filtre par type */}
      <div className="flex gap-2">
        <Button
          variant={typeFilter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTypeFilter('all')}
        >
          Tous
        </Button>
        <Button
          variant={typeFilter === 'sujet' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTypeFilter('sujet')}
        >
          Sujets
        </Button>
        <Button
          variant={typeFilter === 'reponse' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTypeFilter('reponse')}
        >
          Réponses
        </Button>
        <Button
          variant={typeFilter === 'ressource' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTypeFilter('ressource')}
        >
          Ressources
        </Button>
      </div>

      {/* Liste filtrée */}
      {filteredItems.map((item) => (
        <Card key={`${item.type}-${item.id}`} className="p-4">
          <div className="flex flex-col gap-3">
            {/* En-tête */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="filiere" className="text-xs">
                    {item.type === 'sujet' ? 'Sujet' : item.type === 'reponse' ? 'Réponse' : 'Ressource'}
                  </Badge>
                  {item.groupe && (
                    <Badge variant="secondary" className="text-xs">
                      {item.groupe.nom}
                    </Badge>
                  )}
                </div>
                <p className="font-medium text-indigo-nuit truncate">
                  {item.titre || item.contenu?.substring(0, 100)}
                </p>
                {item.sujet && (
                  <p className="text-xs text-brume mt-1">
                    Réponse au sujet : {item.sujet.titre}
                  </p>
                )}
                <p className="text-xs text-brume mt-1">
                  Par {item.auteur?.nom_complet || 'Utilisateur inconnu'} • {new Date(item.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleIgnore(item.type, item.id)}
              >
                Ignorer
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedUserId(item.auteur?.id || null)
                  setWarningMessage('')
                }}
              >
                Avertir
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDelete(item.type, item.id)}
                className="text-terre border-terre hover:bg-terre/10"
              >
                Supprimer
              </Button>
            </div>

            {/* Formulaire d'avertissement */}
            {selectedUserId === item.auteur?.id && (
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Message d'avertissement..."
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleWarn(item.auteur?.id || '')}
                >
                  Envoyer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedUserId(null)
                    setWarningMessage('')
                  }}
                >
                  Annuler
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
