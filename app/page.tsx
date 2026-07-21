import React from 'react'
import Link from 'next/link'
import Container from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GrinHero } from '@/components/GrinHero'

export default function Home() {
  return (
    <main className="flex-1 animate-fade-in">
      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden pt-12 pb-16 md:py-24 bg-gradient-to-b from-indigo-nuit/5 to-transparent">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            {/* Colonne Gauche : Pitch & CTA */}
            <div className="md:col-span-7 flex flex-col gap-6 text-center md:text-left">
              <div className="inline-flex justify-center md:justify-start">
                <Badge variant="filiere">Le Grin numérique d&apos;entraide</Badge>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-indigo-nuit tracking-tight leading-tight">
                L&apos;entraide étudiante <br />
                <span className="text-attaya">à portée de main</span>
              </h1>
              <p className="text-base md:text-lg text-brume leading-relaxed max-w-2xl">
                Rejoignez le grin numérique sénégalais. Partagez vos ressources pédagogiques, trouvez un mentor expérimenté ou posez vos questions dans un esprit de solidarité traditionnelle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-2">
                <Link href="/login">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Rejoindre la communauté
                  </Button>
                </Link>
                <Link href="/demandes">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Voir les demandes
                  </Button>
                </Link>
              </div>
            </div>

            {/* Colonne Droite : Animation Signature Le Grin */}
            <div className="md:col-span-5 flex justify-center">
              <GrinHero />
            </div>
          </div>
        </Container>
      </section>

      {/* --- Section "Comment ça marche" --- */}
      <section className="py-16 bg-bone/50 border-t border-indigo-nuit/5">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12 flex flex-col gap-3">
            <h2 className="font-display text-3xl font-bold text-indigo-nuit">
              Comment fonctionne la plateforme ?
            </h2>
            <p className="text-sm text-brume">
              Trois piliers incontournables pour briser l&apos;isolement académique et collaborer efficacement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Carte 1 : Mentorat */}
            <Card hoverable className="p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-attaya/15 flex items-center justify-center text-attaya">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-indigo-nuit">Mise en relation & Mentorat</h3>
              <p className="text-xs text-brume leading-relaxed">
                Bénéficiez de l&apos;appui d&apos;un tuteur ou d&apos;un étudiant d&apos;année supérieure. Notre matching intelligent vous aide à trouver le mentor idéal selon vos besoins.
              </p>
            </Card>

            {/* Carte 2 : Ressources */}
            <Card hoverable className="p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-pousse/15 flex items-center justify-center text-pousse">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-indigo-nuit">Partage de Ressources</h3>
              <p className="text-xs text-brume leading-relaxed">
                Retrouvez des annales d&apos;examens, des fiches de synthèse ou des polycopiés. Téléchargez des documents partagés ou proposez vos propres liens utiles.
              </p>
            </Card>

            {/* Carte 3 : Messagerie */}
            <Card hoverable className="p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-nuit/10 flex items-center justify-center text-indigo-nuit">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-bold text-indigo-nuit">Messagerie privée</h3>
              <p className="text-xs text-brume leading-relaxed">
                Discutez de manière fluide avec vos tuteurs ou filleuls d&apos;études en privé. Idéal pour éclaircir des notions ou planifier vos séances d&apos;aide en direct.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* --- Section Chiffres clés --- */}
      <section className="py-16 bg-indigo-nuit text-bone border-t border-b border-indigo-nuit/10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-4xl md:text-5xl font-bold text-attaya">+ 250</span>
              <span className="text-xs text-brume font-medium uppercase tracking-wider">Étudiants inscrits</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-4xl md:text-5xl font-bold text-attaya">+ 120</span>
              <span className="text-xs text-brume font-medium uppercase tracking-wider">Ressources partagées</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-4xl md:text-5xl font-bold text-attaya">70%</span>
              <span className="text-xs text-brume font-medium uppercase tracking-wider">Taux de matching</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-4xl md:text-5xl font-bold text-attaya">95%</span>
              <span className="text-xs text-brume font-medium uppercase tracking-wider">Taux de satisfaction</span>
            </div>
          </div>
        </Container>
      </section>

      {/* --- Call to Action (CTA) Final --- */}
      <section className="py-20 text-center bg-bone">
        <Container className="flex flex-col gap-6 items-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
            Intégrez le grin numérique dès aujourd&apos;hui
          </h2>
          <p className="text-sm text-brume max-w-xl leading-relaxed">
            Rejoignez une communauté solidaire d&apos;étudiants sénégalais. Que vous ayez besoin d&apos;aide ou que vous souhaitiez partager vos connaissances, vous avez votre place parmi nous.
          </p>
          <div className="mt-4">
            <Link href="/login">
              <Button variant="primary" size="lg">
                Rejoindre la communauté
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  )
}
