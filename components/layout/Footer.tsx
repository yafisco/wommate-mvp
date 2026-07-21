import React from 'react'
import Link from 'next/link'
import Container from './Container'

export const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block w-full bg-indigo-nuit text-bone border-t border-indigo-nuit/20 py-10 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Section 1: Logo & description */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="font-display text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="bg-attaya text-encre rounded-lg w-6 h-6 flex items-center justify-center font-display font-black text-sm">W</span>
              Wommate
            </Link>
            <p className="text-xs text-brume leading-relaxed">
              La plateforme communautaire d&apos;entraide étudiante sénégalaise. Rejoignez le grin numérique pour partager des connaissances, trouver un mentor, et grandir ensemble.
            </p>
          </div>

          {/* Section 2: Liens rapides */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Liens utiles</h4>
            <div className="flex flex-col gap-1 text-xs text-brume">
              <Link href="/demandes" className="hover:text-attaya transition-colors">Demandes d&apos;aide</Link>
              <Link href="/ressources" className="hover:text-attaya transition-colors">Ressources pédagogiques</Link>
              <Link href="/messages" className="hover:text-attaya transition-colors">Messagerie</Link>
            </div>
          </div>

          {/* Section 3: Mentions légales */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Légal</h4>
            <div className="flex flex-col gap-1 text-xs text-brume">
              <p>Protection des données personnelles (Conformité CDP Sénégal)</p>
              <p className="mt-2 text-[10px] text-brume/75">
                © {new Date().getFullYear()} Wommate. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
export default Footer
