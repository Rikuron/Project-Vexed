import type { Vexation, Solution } from '../../types'

function calculateCurrentStreak(dates: (Date | undefined)[]): number {
  const validDates = dates.filter((d): d is Date => d !== undefined)
  if (validDates.length === 0) return 0

  const normalizedDates = validDates
    .map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime())
    .sort((a, b) => b - a)

  const uniqueDates = [...new Set(normalizedDates)]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()
  const ONE_DAY = 86400000

  // If last activity isn't today or yesterday, streak is broken
  if (uniqueDates[0] !== todayTime && uniqueDates[0] !== todayTime - ONE_DAY) return 0

  let streak = 0
  let expectedDate = uniqueDates[0]

  for (const dateTime of uniqueDates) {
    if (dateTime === expectedDate) {
      streak++
      expectedDate -= ONE_DAY
    } else {
      break
    }
  }

  return streak
}

export function getStreakFromData(
  vexations: Vexation[], 
  solutions: Solution[]
): number {
  const activityDates = [
    ...vexations.map(v => v.updatedAt?.toDate()),
    ...solutions.map(s => s.dateStarted?.toDate()),
    ...solutions.map(s => s.dateSubmitted?.toDate())
  ]
  return calculateCurrentStreak(activityDates)
}