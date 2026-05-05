import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatRelativeDate(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 30) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export function truncateHash(hash: string, chars = 8): string {
  if (!hash || hash.length <= chars * 2 + 2) return hash
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`
}

export function parseTags(tagsJson: string): string[] {
  try {
    const parsed = JSON.parse(tagsJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
}

const MIME_LABELS: Record<string, string> = {
  'text/csv': 'CSV',
  'application/json': 'JSON',
  'application/zip': 'ZIP',
  'application/x-tar': 'TAR',
  'application/gzip': 'GZIP',
  'text/plain': 'TXT',
  'application/parquet': 'PARQUET',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'application/octet-stream': 'BIN',
}

export function getMimeLabel(mimeType: string | null): string {
  if (!mimeType) return 'FILE'
  return MIME_LABELS[mimeType] ?? mimeType.split('/')[1]?.toUpperCase() ?? 'FILE'
}

const MIME_COLORS: Record<string, string> = {
  'text/csv': 'bg-green-500/15 text-green-400 border-green-500/30',
  'application/json': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'application/zip': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'application/x-tar': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'text/plain': 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  'application/parquet': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'image/png': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'image/jpeg': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
}

export function getMimeColors(mimeType: string | null): string {
  if (!mimeType) return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  return MIME_COLORS[mimeType] ?? 'bg-slate-500/15 text-slate-400 border-slate-500/30'
}
