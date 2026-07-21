'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadRessource, createLinkRessource } from '@/lib/actions/ressources.actions'
import { validateFile, generateStoragePath } from '@/lib/utils/fileValidation'
import { useFileUpload } from '@/hooks/useFileUpload'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface ResourceUploadFormProps {
    onSuccess?: () => void
}

export const ResourceUploadForm: React.FC<ResourceUploadFormProps> = ({ onSuccess }) => {
    const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file')
    const [file, setFile] = useState<File | null>(null)
    const [titre, setTitre] = useState('')
    const [description, setDescription] = useState('')
    const [filiere, setFiliere] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const { uploadFile, progress: uploadProgress, loading: uploadLoading } = useFileUpload()

    const filieresOptions = [
        { value: '', label: 'Sélectionnez une filière' },
        { value: 'Informatique', label: 'Informatique' },
        { value: 'Mathématiques', label: 'Mathématiques' },
        { value: 'Médecine', label: 'Médecine' },
        { value: 'Droit', label: 'Droit' },
        { value: 'Économie', label: 'Économie' },
        { value: 'Lettres', label: 'Lettres' },
        { value: 'Autre', label: 'Autre' }
    ]

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        const validation = validateFile(selectedFile)
        if (!validation.valid) {
            setError(validation.error || 'Fichier invalide')
            setFile(null)
            return
        }

        setFile(selectedFile)
        setError(null)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        let result

        if (uploadMode === 'file') {
            if (!file) {
                setError('Veuillez sélectionner un fichier')
                setLoading(false)
                return
            }

            const { data: { user } } = await createClient().auth.getUser()
            if (!user) {
                setError('Non authentifié')
                setLoading(false)
                return
            }

            const storagePath = generateStoragePath(user.id, file.name)

            // Upload avec progression réelle
            const uploadResult = await uploadFile(file, storagePath)

            if (!uploadResult.success) {
                setError(uploadResult.error || 'Erreur lors de l\'upload')
                setLoading(false)
                return
            }

            // Enregistrer en base de données (sans ré-uploader le fichier)
            const formData = new FormData()
            formData.append('titre', titre)
            formData.append('description', description)
            formData.append('filiere', filiere)
            formData.append('file', file) // Passer le fichier pour les métadonnées

            result = await uploadRessource(formData, storagePath)
        } else {
            if (!url) {
                setError('Veuillez entrer une URL')
                setLoading(false)
                return
            }

            const formData = new FormData()
            formData.append('titre', titre)
            formData.append('description', description)
            formData.append('filiere', filiere)
            formData.append('url', url)

            result = await createLinkRessource(formData)
        }

        if (result.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            setTitre('')
            setDescription('')
            setFiliere('')
            setUrl('')
            setFile(null)
            setLoading(false)

            setTimeout(() => {
                setSuccess(false)
                if (onSuccess) onSuccess()
                router.refresh()
            }, 2000)
        }
    }

    return (
        <Card className="p-6 md:p-8 flex flex-col gap-6 border-2 border-dashed border-indigo-nuit/20 bg-white/50">
            <div className="flex flex-col gap-2">
                <h3 className="font-display text-lg font-bold text-indigo-nuit">
                    Partager une ressource
                </h3>
                <p className="text-xs text-brume">
                    Max 5 Mo par fichier. Acceptés: PDF, DOCX, XLSX, PPTX, TXT, MP4, PNG, JPG, ZIP
                </p>
            </div>

            {/* Toggle Mode */}
            <div className="flex gap-2 bg-bone/50 p-1 rounded-lg w-max">
                <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${uploadMode === 'file'
                            ? 'bg-indigo-nuit text-bone'
                            : 'text-indigo-nuit hover:bg-white/50'
                        }`}
                >
                    📁 Fichier
                </button>
                <button
                    type="button"
                    onClick={() => setUploadMode('link')}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${uploadMode === 'link'
                            ? 'bg-indigo-nuit text-bone'
                            : 'text-indigo-nuit hover:bg-white/50'
                        }`}
                >
                    🔗 Lien
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload ou URL Input */}
                {uploadMode === 'file' ? (
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-indigo-nuit">Fichier *</label>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file ? 'border-indigo-nuit/50 bg-indigo-nuit/5' : 'border-indigo-nuit/30 hover:border-indigo-nuit/50 hover:bg-indigo-nuit/5'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.csv,.zip,.mp4,.jpg,.jpeg,.png,.gif"
                            />
                            {file ? (
                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-3xl">📦</span>
                                    <p className="font-semibold text-indigo-nuit">{file.name}</p>
                                    <p className="text-xs text-brume">
                                        {(file.size / 1024 / 1024).toFixed(2)} Mo
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFile(null)
                                        }}
                                        className="text-xs text-attaya hover:underline mt-2"
                                    >
                                        Changer le fichier
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 items-center">
                                    <span className="text-3xl">📎</span>
                                    <p className="text-sm font-semibold text-indigo-nuit">
                                        Cliquez pour télécharger ou glissez-déposez
                                    </p>
                                    <p className="text-xs text-brume">Max 5 Mo</p>
                                </div>
                            )}
                        </div>

                        {/* Barre de progression d'upload */}
                        {uploadProgress && (
                            <div className="flex flex-col gap-2 bg-indigo-nuit/5 p-3 rounded-lg">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-indigo-nuit font-semibold">Upload en cours...</span>
                                    <span className="text-brume font-mono">{uploadProgress.percentage}%</span>
                                </div>
                                <div className="w-full bg-indigo-nuit/10 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-nuit transition-all duration-200 ease-out"
                                        style={{ width: `${uploadProgress.percentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs text-brume">
                                    <span className="font-mono">⚡ {uploadProgress.speed}</span>
                                    <span className="font-mono">⏱️ {uploadProgress.eta}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Input
                        label="URL du lien *"
                        name="url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://exemple.com/ressource"
                        required
                    />
                )}

                {/* Titre */}
                <Input
                    label="Titre de la ressource *"
                    name="titre"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    placeholder="Ex: Fiche de révision Mathématiques L2"
                    required
                />

                {/* Filière */}
                <Select
                    label="Filière concernée *"
                    name="filiere"
                    value={filiere}
                    onChange={(e) => setFiliere(e.target.value)}
                    options={filieresOptions}
                    required
                />

                {/* Description */}
                <Textarea
                    label="Description (optionnel)"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez brièvement le contenu, le niveau, et le chapitre concerné..."
                    rows={3}
                />



                {/* Messages d'erreur et succès */}
                {error && (
                    <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-pousse/10 border border-pousse/20 text-pousse text-sm rounded-lg">
                        ✓ Ressource partagée avec succès !
                    </div>
                )}

                {/* Boutton submit */}
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || uploadLoading || !titre || !filiere || (uploadMode === 'file' && !file) || (uploadMode === 'link' && !url)}
                    className="w-full"
                >
                    {loading || uploadLoading ? 'Partage en cours...' : 'Partager la ressource'}
                </Button>
            </form>
        </Card>
    )
}
