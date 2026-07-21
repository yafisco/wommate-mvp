'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSujet, getPopularTags } from '@/lib/actions/forum.actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'
import { TagChip } from '@/components/ui/TagChip'
import { Card } from '@/components/ui/Card'

interface CreateTopicFormProps {
  groupeId: string
  groupeNom: string
}

export const CreateTopicForm: React.FC<CreateTopicFormProps> = ({ 
  groupeId, 
  groupeNom
}) => {
  const router = useRouter()
  const [titre, setTitre] = useState('')
  const [contenu, setContenu] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger les tags populaires au montage
  useEffect(() => {
    getPopularTags(10).then(setPopularTags)
  }, [])

  const addTag = (tag: string) => {
    const cleanedTag = tag.toLowerCase().trim().replace(/\s+/g, '-')
    if (cleanedTag && !tags.includes(cleanedTag) && tags.length < 5) {
      setTags([...tags, cleanedTag])
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('groupeId', groupeId)
    formData.append('titre', titre)
    formData.append('contenu', contenu)
    formData.append('tags', tags.join(','))

    const result = await createSujet(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setTitre('')
      setContenu('')
      setTags([])
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <Card className="p-6 border-2 border-dashed border-indigo-nuit/20 bg-white/50">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg font-bold text-indigo-nuit">
            Nouveau sujet
          </h3>
          <p className="text-xs text-brume">
            Dans : <span className="font-semibold text-indigo-nuit">{groupeNom}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Titre du sujet *"
            placeholder="Votre question ou sujet de discussion..."
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />

          <MarkdownEditor
            label="Contenu (optionnel)"
            placeholder="Développez votre question ou partagez votre point de vue..."
            value={contenu}
            onChange={setContenu}
            rows={4}
          />

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-encre">
              Tags (max 5)
            </label>
            
            {/* Tags sélectionnés */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <TagChip 
                    key={tag} 
                    tag={tag} 
                    variant="removable" 
                    onRemove={() => removeTag(tag)}
                    size="sm"
                  />
                ))}
              </div>
            )}

            {/* Input pour ajouter un tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => tagInput && addTag(tagInput)}
                disabled={!tagInput.trim() || tags.length >= 5}
              >
                Ajouter
              </Button>
            </div>

            {/* Tags populaires suggérés */}
            {popularTags.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-brume">Tags populaires :</p>
                <div className="flex flex-wrap gap-1">
                  {popularTags.map((tag) => (
                    <TagChip
                      key={tag}
                      tag={tag}
                      variant="filterable"
                      active={tags.includes(tag)}
                      size="sm"
                      onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-xs rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={loading || titre.trim().length === 0}
            className="w-full"
          >
            {loading ? 'Création en cours...' : '📝 Créer le sujet'}
          </Button>
        </form>
      </div>
    </Card>
  )
}
