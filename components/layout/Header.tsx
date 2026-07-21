'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Container from './Container'
import { NotificationIcon } from '@/components/features/notifications/NotificationIcon'

export const Header: React.FC = () => {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/forum', label: 'Forum' },
    { href: '/demandes', label: "Demandes d'aide" },
    { href: '/mentors', label: 'Mentors' },
    { href: '/utilisateurs', label: 'Utilisateurs' },
    { href: '/ressources', label: 'Ressources' },
    { href: '/messages', label: 'Messages' },
    { href: '/profil', label: 'Mon profil' }
  ]

  const isAdmin = user?.role === 'admin'
  const isMentor = user?.role === 'mentor'

  // Ajouter le lien Stats uniquement pour les admins
  const allNavLinks = isAdmin ? [
    ...navLinks,
    { href: '/stats', label: 'Stats' }
  ] : navLinks

  // Ajouter le lien Découvrir uniquement pour les mentors
  const finalNavLinks = isMentor ? [
    ...allNavLinks,
    { href: '/demandes/decouvrir', label: 'Découvrir demandes' }
  ] : allNavLinks

  return (
    <header className="hidden md:block w-full sticky top-0 z-50 bg-indigo-nuit text-bone border-b border-indigo-nuit/20 shadow-md">
      <Container className="h-16 flex items-center justify-between">
        {/* Logo / Nom du projet */}
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-white hover:text-attaya transition-colors duration-200">
          <span className="bg-attaya text-encre rounded-lg w-8 h-8 flex items-center justify-center font-display font-black">W</span>
          Wommate
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-6">
          {finalNavLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-200 relative py-1.5 px-1 hover:text-white ${isActive ? 'text-attaya' : 'text-bone/80'
                  }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-attaya rounded-full" />
                )}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-all duration-200 relative py-1.5 px-1 hover:text-white ${pathname === '/admin' ? 'text-attaya' : 'text-bone/80'
                }`}
            >
              Admin
              {pathname === '/admin' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-attaya rounded-full" />
              )}
            </Link>
          )}
        </nav>

        {/* Connexion / Action */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <NotificationIcon />
              <Link href="/profil" className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-white/5 transition-colors">
                <span className="w-2.5 h-2.5 rounded-full bg-pousse animate-pulse"></span>
                <span className="text-sm font-medium text-bone/90">{user?.nom_complet || user?.email?.split('@')[0]}</span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-attaya hover:bg-[#d4932c] text-encre rounded-lg shadow transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>
      </Container>
    </header>
  )
}
export default Header
