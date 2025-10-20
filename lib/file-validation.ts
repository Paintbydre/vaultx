// lib/file-validation.ts

export interface FileValidationResult {
  valid: boolean
  error?: string
}

// Common file extensions and their MIME types
const MIME_TYPES: Record<string, string[]> = {
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  'application/x-tar': ['.tar'],
  'application/gzip': ['.gz'],
  
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  
  // Videos
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/webm': ['.webm'],
  
  // Audio
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  
  // Text
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  'text/markdown': ['.md'],
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSize: number = 100 * 1024 * 1024 // 100MB default
): FileValidationResult {
  if (size <= 0) {
    return { valid: false, error: 'File is empty' }
  }
  
  if (size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024)
    return { 
      valid: false, 
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB` 
    }
  }
  
  return { valid: true }
}

/**
 * Validate file type
 */
export function validateFileType(
  fileName: string,
  mimeType: string,
  allowedTypes: string[] = ['*'] // ['*'] means all types allowed
): FileValidationResult {
  // If all types are allowed
  if (allowedTypes.includes('*')) {
    return { valid: true }
  }
  
  const extension = '.' + fileName.split('.').pop()?.toLowerCase()
  
  // Check if extension is in allowed list
  if (allowedTypes.includes(extension)) {
    return { valid: true }
  }
  
  // Check if MIME type is in allowed list
  if (allowedTypes.includes(mimeType)) {
    return { valid: true }
  }
  
  return { 
    valid: false, 
    error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
  }
}

/**
 * Validate filename (no malicious characters)
 */
export function validateFileName(fileName: string): FileValidationResult {
  // Check for empty filename
  if (!fileName || fileName.trim().length === 0) {
    return { valid: false, error: 'Filename is empty' }
  }
  
  // Check for malicious characters
  const dangerousChars = /[<>:"|?*\x00-\x1f]/
  if (dangerousChars.test(fileName)) {
    return { valid: false, error: 'Filename contains invalid characters' }
  }
  
  // Check for path traversal attempts
  if (fileName.includes('../') || fileName.includes('..\\')) {
    return { valid: false, error: 'Filename contains invalid path' }
  }
  
  // Check filename length
  if (fileName.length > 255) {
    return { valid: false, error: 'Filename is too long (max 255 characters)' }
  }
  
  return { valid: true }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : ''
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Complete file validation
 */
export function validateFile(
  fileName: string,
  fileSize: number,
  mimeType: string,
  options?: {
    maxSize?: number
    allowedTypes?: string[]
  }
): FileValidationResult {
  // Validate filename
  const nameValidation = validateFileName(fileName)
  if (!nameValidation.valid) return nameValidation
  
  // Validate file size
  const sizeValidation = validateFileSize(fileSize, options?.maxSize)
  if (!sizeValidation.valid) return sizeValidation
  
  // Validate file type
  const typeValidation = validateFileType(
    fileName,
    mimeType,
    options?.allowedTypes
  )
  if (!typeValidation.valid) return typeValidation
  
  return { valid: true }
}

