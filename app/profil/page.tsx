import { getProfile } from '@/lib/actions/profile.actions'
import { logout } from '@/lib/actions/auth.actions'
import ProfileForm from '@/components/features/profile/ProfileForm'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mon Profil | Wommate',
  description: 'Gérez vos informations personnelles sur Wommate.',
}

export default async function ProfilPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-8">
      {/* En-tête du profil (lecture) */}
      <Card className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8">
        <Avatar 
          src={profile.photo_url} 
          name={profile.nom_complet || 'Utilisateur'} 
          size="lg" 
        />
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-indigo-nuit">
            {profile.nom_complet || 'Utilisateur'}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={`role-${profile.role}` as any}>{profile.role}</Badge>
            {profile.filiere && (
              <span className="text-brume text-sm font-mono bg-bone px-2 py-1 rounded-md">
                {profile.filiere} • {profile.niveau}
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="mt-4 text-encre text-sm max-w-2xl">{profile.bio}</p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          {profile.role !== 'mentor' && (
            <Link href="/devenir-mentor">
              <Button variant="primary">
                Devenir mentor
              </Button>
            </Link>
          )}
          <form action={logout}>
            <Button type="submit" variant="secondary" className="text-terre border-terre/20 hover:bg-terre/5 hover:border-terre/50">
              Se déconnecter
            </Button>
          </form>
        </div>
      </Card>

      {/* Section d'édition */}
      <div>
        <h2 className="text-xl font-display font-bold text-indigo-nuit mb-4 pl-2">
          Paramètres du profil
        </h2>
        <ProfileForm initialData={profile} isOnboarding={false} />
      </div>
    </div>
  )
}
