'use client'

import React from 'react'

export const GrinHero: React.FC = () => {
  // Liste fictive d'étudiants pour notre "grin"
  const members = [
    { name: 'Fatou Diop', role: 'Mentor', filière: 'Médecine', cx: 200, cy: 60, color: '#E8A63D' },
    { name: 'Alioune Sall', role: 'Étudiant', filière: 'Informatique', cx: 320, cy: 120, color: '#3F8F63' },
    { name: 'Mariama Ba', role: 'Mentor', filière: 'Lettres', cx: 320, cy: 260, color: '#232752' },
    { name: 'Ousmane Cisse', role: 'Étudiant', filière: 'Économie', cx: 200, cy: 320, color: '#C1502E' },
    { name: 'Khady Ndiaye', role: 'Étudiant', filière: 'Droit', cx: 80, cy: 260, color: '#E8A63D' },
    { name: 'Moussa Diallo', role: 'Mentor', filière: 'Maths', cx: 80, cy: 120, color: '#3F8F63' },
  ]

  // Définir les liens entre les membres pour l'effet réseau
  const connections = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 0 },
    { from: 0, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 5 },
  ]

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square flex items-center justify-center select-none">
      {/* SVG pour dessiner le réseau de lignes animées */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lignes pulsantes représentant les flux d'entraide */}
        {connections.map((conn, index) => {
          const fromMember = members[conn.from]
          const toMember = members[conn.to]
          return (
            <line
              key={index}
              x1={fromMember.cx}
              y1={fromMember.cy}
              x2={toMember.cx}
              y2={toMember.cy}
              stroke="url(#lineGradient)"
              strokeWidth="1.5"
              className="animate-pulse-grin"
              style={{
                animationDelay: `${index * 0.3}s`
              }}
            />
          )
        })}

        {/* Définitions des dégradés */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8A63D" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#232752" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3F8F63" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Cercle central symbolisant le grin d'Attaya */}
      <div className="absolute w-24 h-24 rounded-full bg-bone border-4 border-attaya/45 shadow-inner flex flex-col items-center justify-center text-center p-2 z-10 animate-pulse" style={{ animationDuration: '4s' }}>
        <span className="text-[10px] font-mono uppercase tracking-wider text-brume">Le Grin</span>
        <span className="text-sm font-display font-bold text-indigo-nuit">Attaya</span>
      </div>

      {/* Noeuds d'étudiants (Avatars) */}
      {members.map((member, index) => {
        const initials = member.name.split(' ').map(n => n[0]).join('')
        return (
          <div
            key={index}
            className="absolute z-20 group transition-all duration-300 hover:scale-110"
            style={{
              left: `${member.cx - 24}px`,
              top: `${member.cy - 24}px`,
              width: '48px',
              height: '48px'
            }}
          >
            {/* Rond de l'avatar */}
            <div
              className="w-full h-full rounded-full border-2 border-bone shadow-md flex items-center justify-center text-xs font-mono font-bold select-none cursor-pointer"
              style={{
                backgroundColor: member.color,
                color: member.color === '#E8A63D' ? '#1B1B29' : '#F7F4EC'
              }}
            >
              {initials}
            </div>

            {/* Bulle d'info au survol (Tooltip) */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] bg-indigo-nuit text-bone text-[10px] p-2 rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-30 text-center">
              <p className="font-semibold text-white">{member.name}</p>
              <p className="text-attaya font-mono text-[9px] uppercase mt-0.5">{member.role}</p>
              <p className="text-brume text-[9px]">{member.filière}</p>
              {/* Flèche du tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-indigo-nuit"></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
