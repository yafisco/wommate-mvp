'use client'

import React, { useState, useRef } from 'react'

export interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  label?: string
  error?: string
  className?: string
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Écrivez votre message...',
  rows = 4,
  label,
  error,
  className = ''
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fonctions pour insérer du markdown
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = value
    const selectedText = text.substring(start, end)

    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
    onChange(newText)

    // Remettre le focus
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const handleBold = () => insertMarkdown('**', '**')
  const handleItalic = () => insertMarkdown('*', '*')
  const handleLink = () => insertMarkdown('[', '](url)')
  const handleCode = () => insertMarkdown('`', '`')
  const handleCodeBlock = () => insertMarkdown('\n```\n', '\n```\n')
  const handleMention = () => insertMarkdown('@', '')

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-encre">
          {label}
        </label>
      )}

      {/* Barre d'outils */}
      <div className="flex items-center gap-1 p-2 bg-bone/30 border border-indigo-nuit/15 rounded-t-lg">
        <button
          type="button"
          onClick={handleBold}
          className="p-1.5 rounded hover:bg-indigo-nuit/10 text-indigo-nuit transition-colors"
          title="Gras (Ctrl+B)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 014 4 4 4 0 01-4 4H6v-8z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-1.5 rounded hover:bg-indigo-nuit/10 text-indigo-nuit transition-colors"
          title="Italique (Ctrl+I)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m-2 0v16m-4 0h8" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-1.5 rounded hover:bg-indigo-nuit/10 text-indigo-nuit transition-colors"
          title="Lien"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleCode}
          className="p-1.5 rounded hover:bg-indigo-nuit/10 text-indigo-nuit transition-colors"
          title="Code inline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleCodeBlock}
          className="p-1.5 rounded hover:bg-indigo-nuit/10 text-indigo-nuit transition-colors"
          title="Bloc de code"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="w-px h-6 bg-indigo-nuit/10 mx-1" />
        <button
          type="button"
          onClick={handleMention}
          className="p-1.5 rounded hover:bg-indigo-nuit/10 text-attaya transition-colors"
          title="Mentionner @utilisateur"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-2 bg-bone/30 border ${
          error ? 'border-terre' : 'border-indigo-nuit/15 hover:border-indigo-nuit/30'
        } rounded-b-lg text-sm text-encre placeholder-brume/50 transition-colors duration-200 focus:outline-none focus:border-attaya focus:bg-white focus:ring-1 focus:ring-attaya min-h-[100px] resize-y font-mono`}
      />

      {error && (
        <span className="text-xs text-terre font-medium">{error}</span>
      )}

      {/* Légende */}
      <div className="text-[10px] text-brume">
        Markdown supporté : **gras**, *italique*, [lien](url), `code`, ```bloc```, @mention
      </div>
    </div>
  )
}
