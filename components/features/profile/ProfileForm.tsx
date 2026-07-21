'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, uploadProfilePhoto } from '@/lib/actions/profile.actions'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Profil } from '@/types/database.types'
import { Avatar } from '@/components/ui/Avatar'

interface ProfileFormProps {
  initialData?: Partial<Profil> | null
  isOnboarding?: boolean
}

export default function ProfileForm({ initialData, isOnboarding = false }: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null)
  const router = useRouter()

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    setError(null)

    try {
      const result = await uploadProfilePhoto(file)
      if ('error' in result) {
        setError(result.error)
      } else {
        setPhotoPreview(result.url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload de la photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
      router.push(isOnboarding ? '/' : '/profil')
      if (!isOnboarding) {
        setLoading(false)
      }
    }
  }

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
    { value: '', label: 'Sélectionnez un niveau' },
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' },
    { value: 'M1', label: 'Master 1' },
    { value: 'M2', label: 'Master 2' },
    { value: 'Doctorat', label: 'Doctorat' },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-display text-indigo-nuit font-bold mb-2">
          {isOnboarding ? 'Complétez votre profil' : 'Mon Profil'}
        </h1>
        <p className="text-brume text-sm">
          {isOnboarding 
            ? 'Ces informations permettront de mieux vous orienter au sein du Grin.' 
            : 'Mettez à jour vos informations personnelles.'}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Upload photo de profil */}
        <div>
          <label className="block text-sm font-medium text-indigo-nuit mb-3">
            Photo de profil
          </label>
          <div className="flex items-center gap-4">
            <Avatar 
              src={photoPreview} 
              name={initialData?.nom_complet || 'Utilisateur'} 
              size="lg" 
            />
            <div className="flex-1">
              <input
                type="file"
                id="photo_upload"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
              <label
                htmlFor="photo_upload"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-nuit bg-indigo-nuit/5 hover:bg-indigo-nuit/10 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingPhoto ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Choisir une photo
                  </>
                )}
              </label>
              <p className="text-xs text-brume mt-2">
                JPG, PNG, WebP ou GIF (max 5MB)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom complet"
            name="nom_complet"
            id="nom_complet"
            type="text"
            defaultValue={initialData?.nom_complet || ''}
            placeholder="Aïssatou Diallo"
          />
          
          <Select
            label="Filière"
            name="filiere"
            id="filiere"
            required
            defaultValue={initialData?.filiere || ''}
            options={filieresOptions}
          />

          <Select
            label="Niveau d'études"
            name="niveau"
            id="niveau"
            required
            defaultValue={initialData?.niveau || ''}
            options={niveauxOptions}
          />

          <Input
            label="Centres d'intérêt (séparés par des virgules)"
            name="centres_interet"
            id="centres_interet"
            type="text"
            defaultValue={initialData?.centres_interet?.join(', ') || ''}
            placeholder="JavaScript, UX Design, IA..."
          />
        </div>
        
        <Textarea
          label="Courte biographie"
          name="bio"
          id="bio"
          defaultValue={initialData?.bio || ''}
          placeholder="Dites-nous en plus sur vous, vos objectifs..."
        />

        {error && (
          <div className="p-3 bg-terre/10 border border-terre/20 text-terre text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-indigo-nuit/10">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : isOnboarding ? 'Terminer et rejoindre' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
