'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateConversation } from '@/lib/actions/messages.actions'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'

interface TestConversationFormProps {
  users: Array<{ id: string; nom_complet: string | null; email: string | null }>
}

export const TestConversationForm: React.FC<TestConversationFormProps> = ({ users }) => {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUserId) return

    setLoading(true)
    setError(null)

    try {
      const conversationId = await getOrCreateConversation(selectedUserId)
      router.push(`/messages/${conversationId}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la création de la conversation'
      setError(errorMsg)
      setLoading(false)
    }
  }

  if (users.length === 0) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs">
      <Select
        value={selectedUserId}
        onChange={(e) => setSelectedUserId(e.target.value)}
        required
      >
        <option value="">Sélectionner un utilisateur...</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.nom_complet || user.email || 'Utilisateur'}
          </option>
        ))}
      </Select>

      {error && (
        <div className="p-2 bg-terre/10 border border-terre/20 text-terre text-xs rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={loading || !selectedUserId}
        size="sm"
      >
        {loading ? 'Création...' : '💬 Démarrer une conversation'}
      </Button>
    </form>
  )
}
