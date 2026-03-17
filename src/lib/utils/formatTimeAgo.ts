// Formats a Firestore Timestamp into a relative time string (e.g., "5m ago").
export function formatTimeAgo(timestamp: any): string {
  if (!timestamp?.toDate) return ''
  const now = Date.now()
  const then = timestamp.toDate().getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}
