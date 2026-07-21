'use client'

import React, { useState } from 'react'
import { AdminStats } from './AdminStats'
import { UserList } from './UserList'
import { ReportedContentList } from './ReportedContentList'

type Tab = 'stats' | 'users' | 'reported'

export const AdminTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('stats')

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation par onglets */}
      <div className="flex border-b border-indigo-nuit/10">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'stats'
              ? 'border-attaya text-attaya'
              : 'border-transparent text-brume hover:text-indigo-nuit'
          }`}
        >
          Statistiques
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'users'
              ? 'border-attaya text-attaya'
              : 'border-transparent text-brume hover:text-indigo-nuit'
          }`}
        >
          Utilisateurs
        </button>
        <button
          onClick={() => setActiveTab('reported')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'reported'
              ? 'border-attaya text-attaya'
              : 'border-transparent text-brume hover:text-indigo-nuit'
          }`}
        >
          Contenus signalés
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'stats' && <AdminStats />}
      {activeTab === 'users' && <UserList />}
      {activeTab === 'reported' && <ReportedContentList />}
    </div>
  )
}
