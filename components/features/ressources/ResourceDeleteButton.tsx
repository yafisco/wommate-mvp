'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRessource } from '@/lib/actions/ressources.actions'
import { Button } from '@/components/ui/Button'

interface ResourceDeleteButtonProps {
    ressourceId: string
}

export const ResourceDeleteButton: React.FC<ResourceDeleteButtonProps> = ({ ressourceId }) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [confirmed, setConfirmed] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        if (!confirmed) {
            setConfirmed(true)
            return
        }

        setLoading(true)
        setError(null)

        const result = await deleteRessource(ressourceId)

        if (result.error) {
            setError(result.error)
            setLoading(false)
            setConfirmed(false)
        } else {
            router.push('/ressources')
            router.refresh()
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {confirmed ? (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmed(false)}
                        disabled={loading}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-terre hover:bg-terre/90"
                    >
                        {loading ? 'Suppression...' : 'Confirmer'}
                    </Button>
                </div>
            ) : (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDelete}
                    className="text-terre border-terre/30"
                >
                    🗑️ Supprimer
                </Button>
            )}

            {confirmed && !loading && (
                <p className="text-xs text-terre font-medium">
                    Êtes-vous sûr ? Cette action est irréversible.
                </p>
            )}

            {error && (
                <div className="p-2 bg-terre/10 border border-terre/20 text-terre text-xs rounded">
                    {error}
                </div>
            )}
        </div>
    )
}
