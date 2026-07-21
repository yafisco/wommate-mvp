import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { getAllUsers } from '@/lib/actions/profile.actions'
import { MessageButton } from '@/components/features/messages/MessageButton'

interface PageProps {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>
}

export default async function UsersPage({ searchParams }: PageProps) {
  const { search, role, page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const pageSize = 12
  const offset = (currentPage - 1) * pageSize

  const { users, total } = await getAllUsers(search, role, pageSize, offset)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">Utilisateurs</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Découvrez la communauté
          </h1>
          <p className="text-sm text-brume">
            Connectez-vous avec d'autres étudiants et mentors de la plateforme.
          </p>
        </div>

        {/* Liste des utilisateurs */}
        {users.length === 0 ? (
          <Card className="p-12 text-center flex flex-col gap-4 items-center justify-center border-dashed border-2 border-indigo-nuit/15 bg-white/50 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-sm">
            <div className="w-12 h-12 rounded-full bg-attaya/10 text-attaya flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-indigo-nuit">Aucun utilisateur trouvé</h3>
            <p className="text-xs text-brume max-w-md">
              Aucun utilisateur ne correspond à votre recherche pour le moment.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id} hoverable className="p-6 flex flex-col gap-4">
                  {/* En-tête */}
                  <div className="flex items-start gap-4">
                    <Avatar 
                      src={user.photo_url} 
                      name={user.nom_complet || 'Utilisateur'} 
                      size="md" 
                    />
                    <div className="flex-1">
                      <Link href={`/profil/${user.id}`}>
                        <h3 className="font-display font-bold text-indigo-nuit hover:text-attaya transition-colors">
                          {user.nom_complet || 'Utilisateur'}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={`role-${user.role}`} className="text-xs">{user.role}</Badge>
                        {user.filiere && (
                          <span className="text-xs text-brume font-mono">
                            {user.filiere}
                          </span>
                        )}
                      </div>
                      {user.niveau && (
                        <span className="text-xs text-brume font-mono block mt-1">
                          {user.niveau}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-xs text-brume leading-relaxed line-clamp-3">
                      {user.bio}
                    </p>
                  )}

                  {/* Centres d'intérêt */}
                  {user.centres_interet && user.centres_interet.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {user.centres_interet.slice(0, 3).map((ci) => (
                        <span key={ci} className="text-[10px] bg-indigo-nuit/5 text-indigo-nuit px-2 py-0.5 rounded font-mono">
                          #{ci}
                        </span>
                      ))}
                      {user.centres_interet.length > 3 && (
                        <span className="text-[10px] text-brume">+{user.centres_interet.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-indigo-nuit/5 mt-auto">
                    <Link href={`/profil/${user.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        Voir profil
                      </Button>
                    </Link>
                    <MessageButton
                      userId={user.id}
                      userName={user.nom_complet || 'Cet utilisateur'}
                      variant="primary"
                      size="sm"
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-brume">
                  {total} utilisateur{total > 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/utilisateurs?search=${search || ''}&role=${role || 'all'}&page=${Math.max(1, currentPage - 1)}`}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                  </Link>
                  <Link
                    href={`/utilisateurs?search=${search || ''}&role=${role || 'all'}&page=${Math.min(totalPages, currentPage + 1)}`}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage >= totalPages}
                    >
                      Suivant
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </Container>
    </main>
  )
}
