'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createReponseImbriquee } from '@/lib/actions/forum.actions'
import { Button } from '@/components/ui/Button'
import { MarkdownEditor } from '@/components/ui/MarkdownEditor'

interface ReplyFormProps {
  sujetId: string
  parentId?: string
  onCancel?: () => void
  placeholder?: string
}

export const ReplyForm: React.FC<ReplyFormProps> = ({ 
  sujetId, 
  parentId,
  onCancel,
  placeholder = "Partagez votre réponse ou votre point de vue..."
}) => {
  const router = useRouter()
  const [contenu, setContenu] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createReponseImbriquee(sujetId, contenu, parentId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setContenu('')
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <MarkdownEditor
        label={parentId ? "Votre réponse" : undefined}
        placeholder={placeholder}
        value={contenu}
        onChange={setContenu}
        rows={parentId ? 3 : 4}
      />

      {error && (
        <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-xs rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={loading || contenu.trim().length === 0}
          className="flex-1"
        >
          {loading ? 'Envoi en cours...' : '📤 Publier'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
        )}
      </div>
    </form>
  )
}
