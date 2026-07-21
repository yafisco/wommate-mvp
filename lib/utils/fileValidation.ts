/**
 * Utilitaires pour validation et formattage des fichiers
 */

// Types de fichiers acceptés
export const ALLOWED_FILE_TYPES = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    txt: 'text/plain',
    csv: 'text/csv',
    zip: 'application/zip',
    mp4: 'video/mp4',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif'
}

// Extensions acceptées
export const ALLOWED_EXTENSIONS = Object.keys(ALLOWED_FILE_TYPES)

// Limites de taille
export const FILE_SIZE_LIMIT = 5 * 1024 * 1024 // 5 Mo
export const FILE_SIZE_LIMIT_MB = 5

// Icônes par type de fichier
export const FILE_ICONS: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    doc: '📝',
    xlsx: '📊',
    xls: '📊',
    pptx: '🎬',
    ppt: '🎬',
    txt: '📋',
    csv: '📊',
    zip: '📦',
    mp4: '🎥',
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️'
}

/**
 * Valide le type de fichier
 */
export function validateFileType(file: File): { valid: boolean; error?: string } {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: `Type de fichier non supporté. Acceptés: ${ALLOWED_EXTENSIONS.join(', ')}`
        }
    }

    // Vérifier le MIME type
    const mimeType = ALLOWED_FILE_TYPES[ext as keyof typeof ALLOWED_FILE_TYPES]
    if (file.type && file.type !== mimeType && !file.type.includes(ext)) {
        return {
            valid: false,
            error: `Type MIME invalide pour ${ext}`
        }
    }

    return { valid: true }
}

/**
 * Valide la taille du fichier
 */
export function validateFileSize(file: File): { valid: boolean; error?: string } {
    if (file.size > FILE_SIZE_LIMIT) {
        return {
            valid: false,
            error: `La taille du fichier dépasse ${FILE_SIZE_LIMIT_MB} Mo. Taille actuelle: ${formatFileSize(file.size)}`
        }
    }

    return { valid: true }
}

/**
 * Valide complètement un fichier (type + taille)
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    const typeValidation = validateFileType(file)
    if (!typeValidation.valid) {
        return typeValidation
    }

    const sizeValidation = validateFileSize(file)
    if (!sizeValidation.valid) {
        return sizeValidation
    }

    return { valid: true }
}

/**
 * Formate la taille de fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Obtient l'extension du fichier
 */
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Obtient l'icône correspondant au type de fichier
 */
export function getFileIcon(filename: string): string {
    const ext = getFileExtension(filename)
    return FILE_ICONS[ext] || '📎'
}

/**
 * Génère un chemin de stockage unique pour un fichier
 */
export function generateStoragePath(userId: string, filename: string): string {
    const timestamp = Date.now()
    const ext = getFileExtension(filename)
    const safeName = filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\s+/g, '_')
        .split('.')
        .slice(0, -1)
        .join('.')

    return `ressources/${userId}/${timestamp}_${safeName}.${ext}`
}

/**
 * Détecte le type de fichier basé sur l'extension
 */
export function detectFileType(filename: string): 'fichier' | 'lien' {
    // Pour MVP : tout fichier local est un fichier, pas un lien
    return 'fichier'
}
