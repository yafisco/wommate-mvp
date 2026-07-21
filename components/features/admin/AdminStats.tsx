'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getAdminStats } from '@/lib/actions/admin.actions'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalDemandes: number
  resolvedDemandes: number
  tauxMiseEnRelation: string
  totalSignales: number
}

export const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      const data = await getAdminStats()
      setStats(data)
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-indigo-nuit/10 rounded w-1/2 mb-2" />
            <div className="h-8 bg-indigo-nuit/10 rounded w-1/3" />
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-brume">Impossible de charger les statistiques.</p>
      </Card>
    )
  }

  const statCards = [
    {
      label: 'Total utilisateurs',
      value: stats.totalUsers,
      color: 'bg-pousse/10 text-pousse'
    },
    {
      label: 'Utilisateurs actifs (30j)',
      value: stats.activeUsers,
      color: 'bg-attaya/10 text-attaya'
    },
    {
      label: 'Total demandes',
      value: stats.totalDemandes,
      color: 'bg-indigo-nuit/10 text-indigo-nuit'
    },
    {
      label: 'Demandes résolues',
      value: stats.resolvedDemandes,
      color: 'bg-pousse/10 text-pousse'
    },
    {
      label: 'Taux de mise en relation',
      value: `${stats.tauxMiseEnRelation}%`,
      color: 'bg-attaya/10 text-attaya'
    },
    {
      label: 'Contenus signalés',
      value: stats.totalSignales,
      color: 'bg-terre/10 text-terre'
    }
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête avec bouton de rafraîchissement */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-indigo-nuit">Statistiques</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadStats}
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Rafraîchir'}
        </Button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6">
            <p className="text-xs font-medium text-brume mb-2">{stat.label}</p>
            <p className={`text-3xl font-display font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
