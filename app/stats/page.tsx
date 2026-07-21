import React from 'react'
import Container from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getMatchingStats } from '@/lib/actions/demandes.actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MatchingStatsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Vérifier si l'utilisateur est admin
    if (!user) {
        redirect('/login')
    }

    const { data: profil } = await supabase
        .from('profils')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profil?.role !== 'admin') {
        redirect('/')
    }

    const stats = await getMatchingStats()

    const progressPercentage = stats?.taux_couverture_systeme_pourcentage || 0
    const isObjectiveMet = (progressPercentage || 0) >= 70

    return (
        <main className="flex-1 py-12 pb-24 md:pb-12 animate-slide-up">
            <Container className="flex flex-col gap-8 max-w-4xl">
                {/* En-tête */}
                <div className="flex flex-col gap-4">
                    <Badge variant="filiere" className="w-max bg-indigo-nuit/10 text-indigo-nuit border-indigo-nuit/20">
                        📊 Tableau de bord
                    </Badge>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-indigo-nuit">
                        Suivi du matching
                    </h1>
                    <p className="text-sm text-brume">
                        Visualisez les performances du système de mise en relation et le taux de couverture des demandes d&apos;aide.
                    </p>
                </div>

                {/* Métriques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Métrique 1: Total des demandes */}
                    <Card className="p-6 flex flex-col gap-4 bg-gradient-to-br from-indigo-nuit/5 to-attaya/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-brume">TOTAL DEMANDES</span>
                            <span className="text-3xl font-display font-bold text-indigo-nuit">
                                {stats?.total_demandes || 0}
                            </span>
                        </div>
                        <p className="text-xs text-brume">
                            Nombre total de demandes d&apos;aide publiées sur la plateforme
                        </p>
                    </Card>

                    {/* Métrique 2: Demandes avec propositions réelles */}
                    <Card className="p-6 flex flex-col gap-4 bg-gradient-to-br from-pousse/5 to-bone/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-brume">AVEC PROPOSITIONS</span>
                            <span className="text-3xl font-display font-bold text-pousse">
                                {stats?.demandes_avec_propositions_reelles || 0}
                            </span>
                        </div>
                        <p className="text-xs text-brume">
                            Demandes ayant reçu au moins une proposition d&apos;aide réelle
                        </p>
                    </Card>
                </div>

                {/* Taux de couverture du système */}
                <Card className="p-8 flex flex-col gap-6 border-l-4 border-l-indigo-nuit bg-gradient-to-br from-indigo-nuit/5 to-transparent">
                    <div>
                        <h3 className="font-display text-lg font-bold text-indigo-nuit mb-2">
                            Couverture du système de matching
                        </h3>
                        <p className="text-xs text-brume mb-4">
                            Pourcentage de demandes pour lesquelles au moins un mentor pertinent a été identifié par l&apos;algorithme
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-display font-bold text-indigo-nuit">
                                {(progressPercentage || 0).toFixed(2)}%
                            </span>
                            <span className="text-xs font-mono text-brume">
                                {stats?.demandes_avec_matchs_systeme || 0} / {stats?.total_demandes || 0} demandes
                            </span>
                        </div>

                        {/* Barre de progression */}
                        <div className="w-full bg-indigo-nuit/10 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${isObjectiveMet ? 'bg-pousse' : 'bg-attaya'
                                    }`}
                                style={{ width: `${Math.min(progressPercentage || 0, 100)}%` }}
                            />
                        </div>

                        {/* Indicateur d'objectif */}
                        <div className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${isObjectiveMet ? 'bg-pousse' : 'bg-attaya'}`} />
                            <span className="font-mono text-brume">
                                Objectif: <span className="font-bold">70%</span>
                                {isObjectiveMet && ' ✓ ATTEINT'}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Taux de propositions réelles */}
                <Card className="p-8 flex flex-col gap-6 border-l-4 border-l-terre bg-gradient-to-br from-terre/5 to-transparent">
                    <div>
                        <h3 className="font-display text-lg font-bold text-indigo-nuit mb-2">
                            Taux de propositions réelles
                        </h3>
                        <p className="text-xs text-brume mb-4">
                            Pourcentage de demandes ayant reçu au moins une proposition d&apos;aide concrète d&apos;un mentor
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-display font-bold text-terre">
                                {(stats?.taux_propositions_reelles_pourcentage || 0).toFixed(2)}%
                            </span>
                            <span className="text-xs font-mono text-brume">
                                {stats?.demandes_avec_propositions_reelles || 0} / {stats?.total_demandes || 0} demandes
                            </span>
                        </div>

                        {/* Barre de progression */}
                        <div className="w-full bg-terre/10 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-terre transition-all duration-500"
                                style={{ width: `${Math.min(stats?.taux_propositions_reelles_pourcentage || 0, 100)}%` }}
                            />
                        </div>

                        <p className="text-xs text-brume">
                            💡 Cet indicateur mesure l&apos;engagement réel des mentors sur la plateforme
                        </p>
                    </div>
                </Card>

                {/* Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-bone/30">
                        <h4 className="font-display font-bold text-sm text-indigo-nuit mb-3">
                            🎯 Interprétation
                        </h4>
                        <ul className="text-xs text-encre space-y-2 leading-relaxed">
                            <li>
                                • <span className="font-mono">Couverture système</span> = qualité de l&apos;algorithme de matching
                            </li>
                            <li>
                                • <span className="font-mono">Propositions réelles</span> = engagement des mentors
                            </li>
                            <li>
                                • Un écart entre les deux indique un problème d&apos;engagement, pas d&apos;algorithme
                            </li>
                        </ul>
                    </Card>

                    <Card className="p-6 bg-pousse/10 border border-pousse/20">
                        <h4 className="font-display font-bold text-sm text-pousse mb-3">
                            ✓ Objectif métier
                        </h4>
                        <ul className="text-xs text-encre space-y-2 leading-relaxed">
                            <li>
                                • Atteindre <span className="font-bold">70% de couverture système</span>
                            </li>
                            <li>
                                • Cet objectif signifie: pour 7 demandes sur 10, au moins 1 mentor est recommandé
                            </li>
                            <li>
                                • Révisable via les prompts de matching (filière, mots-clés)
                            </li>
                        </ul>
                    </Card>
                </div>

                {/* Note technique */}
                <Card className="p-4 bg-indigo-nuit/5 border border-indigo-nuit/10">
                    <p className="text-xs text-brume font-mono leading-relaxed">
                        📌 <span className="font-bold">Note:</span> Ces statistiques sont calculées en temps réel à partir de la vue `matching_stats`
                        de la base de données Supabase. L&apos;algorithme considère la filière exacte (+2 points) et les mots-clés des centres d&apos;intérêt
                        (+1 point chacun) pour déterminer la pertinence d&apos;un mentor.
                    </p>
                </Card>
            </Container>
        </main>
    )
}
