import React from 'react'

// --- Input Component ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-encre">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-3 py-2 bg-bone/30 border ${
            error ? 'border-terre' : 'border-indigo-nuit/15 hover:border-indigo-nuit/30'
          } rounded-lg text-sm text-encre placeholder-brume/50 transition-colors duration-200 focus:outline-none focus:border-attaya focus:bg-white focus:ring-1 focus:ring-attaya ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-terre font-medium">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// --- Textarea Component ---
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-encre">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`w-full px-3 py-2 bg-bone/30 border ${
            error ? 'border-terre' : 'border-indigo-nuit/15 hover:border-indigo-nuit/30'
          } rounded-lg text-sm text-encre placeholder-brume/50 transition-colors duration-200 focus:outline-none focus:border-attaya focus:bg-white focus:ring-1 focus:ring-attaya min-h-[100px] resize-y ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-terre font-medium">{error}</span>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// --- Select Component ---
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options?: { value: string; label: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options = [], children, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-encre">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full px-3 py-2 bg-bone/30 border ${
            error ? 'border-terre' : 'border-indigo-nuit/15 hover:border-indigo-nuit/30'
          } rounded-lg text-sm text-encre transition-colors duration-200 focus:outline-none focus:border-attaya focus:bg-white focus:ring-1 focus:ring-attaya cursor-pointer ${className}`}
          {...props}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
        {error && <span className="text-xs text-terre font-medium">{error}</span>}
      </div>
    )
  }
)
Select.displayName = 'Select'
