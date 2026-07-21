'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadProgress {
    loaded: number
    total: number
    percentage: number
    speed: string // en Mo/s
    eta: string // temps estimé
}

interface UseFileUploadReturn {
    uploadFile: (file: File, path: string) => Promise<{ success: boolean; error?: string; path?: string }>
    progress: UploadProgress | null
    loading: boolean
}

export function useFileUpload(): UseFileUploadReturn {
    const [progress, setProgress] = useState<UploadProgress | null>(null)
    const [loading, setLoading] = useState(false)
    const startTimeRef = useRef<number>(0)

    const uploadFile = useCallback(async (file: File, path: string) => {
        setLoading(true)
        setProgress({ loaded: 0, total: file.size, percentage: 0, speed: '0 Mo/s', eta: 'Calcul...' })
        startTimeRef.current = Date.now()

        try {
            const supabase = createClient()

            // Upload sans suivi de progression (Supabase ne supporte pas onUploadProgress)
            const { data, error } = await supabase.storage
                .from('ressources-pedagogiques')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                throw error
            }

            setProgress({ loaded: file.size, total: file.size, percentage: 100, speed: 'Terminé', eta: 'Terminé' })

            setTimeout(() => {
                setProgress(null)
                setLoading(false)
            }, 1000)

            return { success: true, path: data?.path }
        } catch (error) {
            setProgress(null)
            setLoading(false)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de l\'upload'
            }
        }
    }, [])

    return { uploadFile, progress, loading }
}
