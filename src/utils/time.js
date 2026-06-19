/**
 * Relative time in Indonesian, e.g. "baru saja", "3m lalu", "2j lalu", "kemarin"
 */
export function formatRelative(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 30)  return 'baru saja'
  if (diff < 60)  return `${Math.floor(diff)}d lalu`
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`
  if (diff < 172800) return 'kemarin'
  return `${Math.floor(diff / 86400)}hr lalu`
}

/**
 * Compact: "19 Jun 14:05"
 */
export function formatDateTime(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

/**
 * Date only: "19 Jun 2026"
 */
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/**
 * Time only: "14:05"
 */
export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  })
}
