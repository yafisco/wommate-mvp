'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDemande } from '@/lib/actions/demandes.actions'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export const DemandeForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const filieresOptions = [
    { value: '', label: 'Sélectionnez une filière' },
    { value: 'Informatique', label: 'Informatique' },
    { value: 'Mathématiques', label: 'Mathématiques' },
    { value: 'Médecine', label: 'Médecine' },
    { value: 'Droit', label: 'Droit' },
    { value: 'Économie', label: 'Économie' },
    { value: 'Lettres', label: 'Lettres' },
    { value: 'Autre', label: 'Autre' },
  ]

  const niveauxOptions = [
    { value: '', label: 'Sélectionnez le niveau requis' },
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' },
    { value: 'M1', label: 'Master 1' },
    { value: 'M2', label: 'Master 2' },
    { value: 'Doctorat', label: 'Doctorat' },
    { value: 'Tous', label: 'Tous niveaux bienvenus' },
  ]

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createDemande(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/demandes/${result.id}`)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-display text-indigo-nuit font-bold mb-2">
          Publier une demande d&apos;aide
        </h2>
        <p className="text-brume text-sm">
          Décrivez vos besoins académiques pour trouver le mentor ou l&apos;étudiant idéal.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <Input
          label="Titre de la demande *"
          name="titre"
          id="titre"
          type="text"
          required
          placeholder="Ex: Aide pour comprendre les arbres binaires de recherche"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Filière concernée *"
            name="filiere"
            id="filiere"
            required
            options={filieresOptions}
          />

          <Select
            label="Niveau d'études requis *"
            name="niveau_requis"
            id="niveau_requis"
            required
            options={niveauxOptions}
          />
        </div>

        <Textarea
          label="Description détaillée de vos besoins *"
          name="description"
          id="description"
          required
          placeholder="Détaillez ici votre problème. Par exemple : les concepts bloquants, le chapitre du cours concerné, vos disponibilités..."
        />

        {error && (
          <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-indigo-nuit/10 gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/demandes')}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Publication...' : 'Publier la demande'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
export default DemandeForm
