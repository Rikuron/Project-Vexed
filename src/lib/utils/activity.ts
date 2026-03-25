import type { Vexation, Solution } from '../../types'

export interface ActivityItem {
  id: string
  color: 'indigo' | 'emerald' | 'sky' | 'slate' | 'amber'
  highlight: string
  text: string
  time: Date
}

export function generateActivities(
  vexations: Vexation[],
  solutions: Solution[]
): ActivityItem[] {
  const activities: ActivityItem[] = []

  // Add Claimed Vexations
  vexations.forEach(v => {
    if (v.updatedAt) activities.push({
      id: `claim-${v.id}`,
      color: 'indigo',
      highlight: 'You claimed',
      text: v.title,
      time: v.updatedAt.toDate()
    })
  })

  // Add Submitted Solutions
  solutions.forEach(s => {
    if (s.dateSubmitted) activities.push({
      id: `submit-${s.id}`,
      color: 'emerald',
      highlight: 'Solution submitted',
      text: s.title,
      time: s.dateSubmitted.toDate()
    })
  })

  return activities.sort((a, b) => b.time.getTime() - a.time.getTime())
}

// Helper function to format time
export function formatTimeAgo(date: Date): string {
  const seconds =  Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' years ago'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'

  interval = seconds / 86400
  if (interval > 1) {
    const days = Math.floor(interval)
    if (days === 1) return 'Yesterday'
    return days + ' days ago'
  }

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'

  return 'Just now'
}