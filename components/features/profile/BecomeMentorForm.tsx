'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { becomeMentor, getMentorRules } from '@/lib/actions/profile.actions'

interface MentorRule {
  id: string
  titre: string
  description: string
  ordre: number
}

export const BecomeMentorForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [filiere, setFiliere] = useState('')
  const [niveau, setNiveau] = useState('')
  const [bio, setBio] = useState('')
  const [centresInteret, setCentresInteret] = useState('')
  const [centresInteretList, setCentresInteretList] = useState<string[]>([])
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [rules, setRules] = useState<MentorRule[]>([])
  const [loadingRules, setLoadingRules] = useState(true)

  useEffect(() => {
    loadRules()
  }, [])

  async function loadRules() {
    setLoadingRules(true)
    try {
      const data = await getMentorRules()
      setRules(data)
    } catch (error) {
      console.error('Erreur lors du chargement des règles:', error)
    } finally {
      setLoadingRules(false)
    }
  }

  const handleAddCentre = () => {
    const newCentre = centresInteret.trim()
    if (newCentre && !centresInteretList.includes(newCentre)) {
      setCentresInteretList([...centresInteretList, newCentre])
      setCentresInteret('')
    }
  }

  const handleRemoveCentre = (centre: string) => {
    setCentresInteretList(centresInteretList.filter(c => c !== centre))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('filiere', filiere)
    formData.append('niveau', niveau)
    formData.append('bio', bio)
    formData.append('centres_interet', centresInteretList.join(','))
    formData.append('rules_accepted', rulesAccepted.toString())

    const result = await becomeMentor(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-pousse/20 text-pousse flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-bold text-indigo-nuit mb-2">
          Bienvenue parmi les mentors !
        </h3>
        <p className="text-sm text-brume mb-6">
          Félicitations pour votre inscription ! Vous faites désormais partie de notre communauté de mentors. Merci de votre engagement à aider les étudiants dans leur parcours académique.
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Retour à l'accueil
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-indigo-nuit mb-2">
          Devenir mentor
        </h2>
        <p className="text-sm text-brume">
          Complétez votre profil pour devenir mentor et aider les étudiants dans leur parcours académique.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-sm rounded-xl">
            {error}
          </div>
        )}

        <Input
          label="Filière *"
          placeholder="Ex: Informatique, Médecine, Droit..."
          value={filiere}
          onChange={(e) => setFiliere(e.target.value)}
          required
        />

        <Input
          label="Niveau d'études *"
          placeholder="Ex: L3, M1, M2, Doctorat..."
          value={niveau}
          onChange={(e) => setNiveau(e.target.value)}
          required
        />

        {/* Règles de mentorat */}
        <div>
          <label className="block text-sm font-medium text-indigo-nuit mb-3">
            Règles de mentorat *
          </label>
          {loadingRules ? (
            <div className="text-sm text-brume">Chargement des règles...</div>
          ) : (
            <div className="bg-indigo-nuit/5 border border-indigo-nuit/10 rounded-xl p-4 space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-attaya/20 text-attaya flex items-center justify-center text-xs font-bold">
                    {rule.ordre}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-indigo-nuit">{rule.titre}</h4>
                    <p className="text-xs text-brume mt-1">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-brume mt-2">
            Le niveau minimum requis pour devenir mentor est L3 (Licence 3) ou équivalent.
          </p>
        </div>

        <Textarea
          label="Bio *"
          placeholder="Décrivez votre parcours, vos compétences et pourquoi vous souhaitez aider..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          minLength={20}
          maxLength={500}
          required
          rows={4}
        />

        <div>
          <label className="block text-sm font-medium text-indigo-nuit mb-2">
            Centres d'intérêt * (min. 1, max. 10)
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Ajouter un centre d'intérêt..."
              value={centresInteret}
              onChange={(e) => setCentresInteret(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCentre()
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddCentre}
              disabled={centresInteretList.length >= 10}
            >
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {centresInteretList.map((centre) => (
              <Badge
                key={centre}
                variant="filiere"
                className="cursor-pointer"
                onClick={() => handleRemoveCentre(centre)}
              >
                {centre} ×
              </Badge>
            ))}
          </div>
          {centresInteretList.length === 0 && (
            <p className="text-xs text-brume mt-2">
              Ajoutez au moins un centre d'intérêt (ex: Mathématiques, Physique, Programmation...)
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading || centresInteretList.length === 0 || !rulesAccepted}
        >
          {loading ? 'Inscription en cours...' : 'Devenir mentor'}
        </Button>

        {/* Case à cocher acceptation règles */}
        <div className="flex items-start gap-3 pt-4 border-t border-indigo-nuit/5">
          <input
            type="checkbox"
            id="rules_accepted"
            checked={rulesAccepted}
            onChange={(e) => setRulesAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-indigo-nuit/20 text-attaya focus:ring-attaya"
          />
          <label htmlFor="rules_accepted" className="text-sm text-brume cursor-pointer">
            J'ai lu et j'accepte les règles de mentorat ci-dessus. Je comprends que le non-respect de ces règles peut entraîner la suspension de mon statut de mentor.
          </label>
        </div>
      </form>
    </Card>
  )
}
