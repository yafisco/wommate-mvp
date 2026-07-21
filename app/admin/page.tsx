import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { AdminTabs } from '@/components/features/admin/AdminTabs'

// Protection serveur : vérifier que l'utilisateur est admin
async function checkAdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profil } = await supabase
    .from('profils')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profil || profil.role !== 'admin') {
    redirect('/')
  }

  return user
}

export default async function AdminPage() {
  await checkAdminAccess()

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">
            Administration
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Panneau d'administration
          </h1>
          <p className="text-sm text-brume">
            Gérez les utilisateurs, modérez les contenus et consultez les statistiques.
          </p>
        </div>

        {/* Onglets de navigation */}
        <AdminTabs />
      </Container>
    </main>
  )
}
