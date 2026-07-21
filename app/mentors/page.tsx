import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { getMentors, getAvailableFilieres } from '@/lib/actions/mentors.actions'
import { MessageButton } from '@/components/features/messages/MessageButton'
import { MentorsFilters } from '@/components/features/mentors/MentorsFilters'

interface PageProps {
  searchParams: Promise<{ search?: string; filiere?: string; page?: string }>
}

export default async function MentorsPage({ searchParams }: PageProps) {
  const { search, filiere, page } = await searchParams
  const currentPage = parseInt(page || '1', 10)
  const pageSize = 12
  const offset = (currentPage - 1) * pageSize

  const { mentors, total } = await getMentors(search, filiere, pageSize, offset)
  const filieres = await getAvailableFilieres()

  const totalPages = Math.ceil(total / pageSize)

  return (
    <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
      <Container className="flex flex-col gap-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <Badge variant="filiere" className="w-max">Mentors</Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Découvrez nos mentors
          </h1>
          <p className="text-sm text-brume">
            Des étudiants expérimentés prêts à vous accompagner dans votre parcours académique.
          </p>
        </div>

        {/* Filtres */}
        <MentorsFilters filieres={filieres} />

        {/* Liste des mentors */}
        {mentors.length === 0 ? (
          <Card className="p-12 text-center flex flex-col gap-4 items-center justify-center border-dashed border-2 border-indigo-nuit/15 bg-white/50 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md shadow-sm">
            <div className="w-12 h-12 rounded-full bg-attaya/10 text-attaya flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-indigo-nuit">Aucun mentor trouvé</h3>
            <p className="text-xs text-brume max-w-md">
              Aucun mentor ne correspond à votre recherche pour le moment.
            </p>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} hoverable className="p-6 flex flex-col gap-4">
                  {/* En-tête */}
                  <div className="flex items-start gap-4">
                    <Avatar name={mentor.nom_complet || 'Mentor'} size="md" />
                    <div className="flex-1">
                      <Link href={`/profil/${mentor.id}`}>
                        <h3 className="font-display font-bold text-indigo-nuit hover:text-attaya transition-colors">
                          {mentor.nom_complet || 'Mentor'}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="role-mentor" className="text-xs">Mentor</Badge>
                        {mentor.filiere && (
                          <span className="text-xs text-brume font-mono">
                            {mentor.filiere}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {mentor.bio && (
                    <p className="text-xs text-brume leading-relaxed line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}

                  {/* Centres d'intérêt */}
                  {mentor.centres_interet && mentor.centres_interet.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {mentor.centres_interet.slice(0, 3).map((ci) => (
                        <span key={ci} className="text-[10px] bg-indigo-nuit/5 text-indigo-nuit px-2 py-0.5 rounded font-mono">
                          #{ci}
                        </span>
                      ))}
                      {mentor.centres_interet.length > 3 && (
                        <span className="text-[10px] text-brume">+{mentor.centres_interet.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-indigo-nuit/5 mt-auto">
                    <Link href={`/profil/${mentor.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        Voir profil
                      </Button>
                    </Link>
                    <MessageButton
                      userId={mentor.id}
                      userName={mentor.nom_complet || 'Ce mentor'}
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
                  {total} mentor{total > 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/mentors?search=${search || ''}&filiere=${filiere || 'all'}&page=${Math.max(1, currentPage - 1)}`}
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
                    href={`/mentors?search=${search || ''}&filiere=${filiere || 'all'}&page=${Math.min(totalPages, currentPage + 1)}`}
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
