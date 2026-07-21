'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { getUsers, updateUserRole } from '@/lib/actions/admin.actions'
import { Profil } from '@/types/database.types'

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<Profil[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(0)
  const pageSize = 20

  useEffect(() => {
    loadUsers()
  }, [search, roleFilter, page])

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await getUsers(search, roleFilter, pageSize, page * pageSize)
      setUsers(data.users)
      setTotal(data.total)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await updateUserRole(userId, newRole)
      await loadUsers()
    } catch (error) {
      console.error('Erreur lors de la modification du rôle:', error)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col gap-4">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className="flex-1"
        />
        <Select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value)
            setPage(0)
          }}
          options={[
            { value: 'all', label: 'Tous les rôles' },
            { value: 'etudiant', label: 'Étudiants' },
            { value: 'mentor', label: 'Mentors' },
            { value: 'enseignant', label: 'Enseignants' },
            { value: 'admin', label: 'Administrateurs' }
          ]}
        />
      </div>

      {/* Liste des utilisateurs */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-indigo-nuit/10 rounded w-1/3 mb-2" />
              <div className="h-3 bg-indigo-nuit/10 rounded w-1/4" />
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-brume">Aucun utilisateur trouvé.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-indigo-nuit truncate">
                    {user.nom_complet || 'Utilisateur sans nom'}
                  </p>
                  <p className="text-xs text-brume">
                    {user.filiere} • {user.niveau}
                  </p>
                </div>
                <Badge variant="filiere">{user.role}</Badge>
                <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  options={[
                    { value: 'etudiant', label: 'Étudiant' },
                    { value: 'mentor', label: 'Mentor' },
                    { value: 'enseignant', label: 'Enseignant' },
                    { value: 'admin', label: 'Admin' }
                  ]}
                  className="w-32"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-brume">
            {total} utilisateur{total > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Précédent
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
