'use client'

import React, { useState, useRef } from 'react'
import { getDownloadUrl } from '@/lib/actions/ressources.actions'
import { Button } from '@/components/ui/Button'

interface ResourceDownloadButtonProps {
    ressourceId: string
    titre: string
}

export const ResourceDownloadButton: React.FC<ResourceDownloadButtonProps> = ({ ressourceId, titre }) => {
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [speed, setSpeed] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const startTimeRef = useRef<number>(0)

    async function handleDownload() {
        setLoading(true)
        setError(null)
        setProgress(0)
        setSpeed('')
        startTimeRef.current = Date.now()

        try {
            // Générer l'URL signée
            setProgress(20)
            const result = await getDownloadUrl(ressourceId)

            if (result.error) {
                setError(result.error)
                setLoading(false)
                return
            }

            setProgress(50)

            // Créer un lien de téléchargement et déclencher le téléchargement
            const link = document.createElement('a')
            link.href = result.url!
            link.download = titre
            document.body.appendChild(link)

            setProgress(80)
            link.click()
            document.body.removeChild(link)

            // Simuler la progression finale
            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current
                const estimatedSpeed = (80 / (elapsed / 1000)).toFixed(1) // % par seconde
                setSpeed(`${estimatedSpeed}x`)

                if (progress >= 95) {
                    clearInterval(progressInterval)
                    setProgress(100)
                    setTimeout(() => {
                        setLoading(false)
                        setProgress(0)
                        setSpeed('')
                    }, 500)
                } else {
                    setProgress(prev => Math.min(prev + 5, 95))
                }
            }, 100)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement')
            setLoading(false)
            setProgress(0)
            setSpeed('')
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Button
                variant="primary"
                onClick={handleDownload}
                disabled={loading}
                className="w-full"
            >
                {loading ? `Téléchargement... ${progress}%` : '⬇️ Télécharger le fichier'}
            </Button>

            {loading && progress > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="w-full bg-indigo-nuit/10 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-indigo-nuit transition-all duration-100 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs text-brume">
                        <span>{progress}% téléchargé</span>
                        {speed && <span className="font-mono">⚡ {speed}</span>}
                    </div>
                </div>
            )}

            {error && (
                <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-xs rounded-lg">
                    {error}
                </div>
            )}
        </div>
    )
}
