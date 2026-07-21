'use client'

import React, { useState } from 'react'
import { signalerSujet, signalerReponse } from '@/lib/actions/forum.actions'
import { Button } from '@/components/ui/Button'

interface ReportButtonProps {
  type: 'sujet' | 'reponse'
  id: string
  onSuccess?: () => void
}

export const ReportButton: React.FC<ReportButtonProps> = ({ type, id, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleReport() {
    setLoading(true)
    setError(null)

    const result = type === 'sujet' 
      ? await signalerSujet(id)
      : await signalerReponse(id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      setShowConfirm(false)
    } else {
      setLoading(false)
      setShowConfirm(false)
      if (onSuccess) onSuccess()
    }
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-terre/10 border border-terre/20 rounded-lg">
        <p className="text-xs text-encre">
          Êtes-vous sûr de vouloir signaler ce {type === 'sujet' ? 'sujet' : 'message'} ?
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleReport}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Signalement...' : 'Confirmer'}
          </Button>
        </div>
        {error && (
          <p className="text-xs text-terre">{error}</p>
        )}
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="text-xs text-brume hover:text-attaya hover:bg-attaya/5"
    >
      ⚠️ Signaler
    </Button>
  )
}
