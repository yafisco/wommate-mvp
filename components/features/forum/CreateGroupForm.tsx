'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGroupeThematique } from '@/lib/actions/forum.actions'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export const CreateGroupForm: React.FC = () => {
  const router = useRouter()
  const [nom, setNom] = useState('')
  const [filiere, setFiliere] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('nom', nom)
    formData.append('filiere', filiere)
    formData.append('description', description)

    const result = await createGroupeThematique(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setNom('')
      setFiliere('')
      setDescription('')
      setLoading(false)
      setIsOpen(false)
      router.refresh()
    }
  }

  if (!isOpen) {
    return (
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        className="w-full md:w-auto"
      >
        + Nouveau groupe thématique
      </Button>
    )
  }

  return (
    <Card className="p-6 border-2 border-dashed border-indigo-nuit/20 bg-white/50">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-indigo-nuit">
            Créer un groupe thématique
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Annuler
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom du groupe *"
            placeholder="Ex: Informatique, Mathématiques..."
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
          />

          <Select
            label="Filière (optionnel)"
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
          >
            <option value="">Sélectionner une filière...</option>
            <option value="Informatique">Informatique</option>
            <option value="Mathématiques">Mathématiques</option>
            <option value="Médecine">Médecine</option>
            <option value="Droit">Droit</option>
            <option value="Économie">Économie</option>
            <option value="Lettres">Lettres</option>
            <option value="Génie">Génie</option>
            <option value="Sciences">Sciences</option>
          </Select>

          <Textarea
            label="Description (optionnel)"
            placeholder="Décrivez le sujet de ce groupe thématique..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          {error && (
            <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-xs rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || nom.trim().length === 0}
              className="flex-1"
            >
              {loading ? 'Création...' : 'Créer le groupe'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
