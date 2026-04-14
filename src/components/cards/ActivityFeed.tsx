import { useMemo } from 'react'
import { formatTimeAgo } from '../../lib/utils/activity'
import type { Activity } from '../../types'

type GroupedActivity = Activity & {
  groupedActors: { id: string; name: string; }[]
}

// Map the DB Event Type to UI styling
function getActivityStyle(item: GroupedActivity) {
  switch (item.type) {
    case 'CLAIM_VEXATION': return { highlight: 'You claimed', dot: 'bg-indigo-400', ring: 'border-indigo-500 bg-indigo-500/20', text: 'text-indigo-400' }
    case 'SUBMIT_SOLUTION': return { highlight: 'Solution submitted:', dot: 'bg-emerald-400', ring: 'border-emerald-500 bg-emerald-500/20', text: 'text-emerald-400' }
    case 'UPVOTE_SOLUTION':
    case 'UPVOTE_VEXATION': return { highlight: 'You upvoted', dot: 'bg-sky-400', ring: 'border-sky-500 bg-sky-500/20', text: 'text-sky-400' }
    case 'SOLUTION_UPVOTED': {
      const count = item.groupedActors.length

      if (count > 1) {
        const tooltipNames = item.groupedActors.map(a => a.name).join(', ')
        return {
          highlight: (
            <>
              <span 
                title={tooltipNames}
                className="underline decoration-dotted cursor-help text-amber-400"
              >
                {count} users
              </span>
              {' '}
              <span className="text-amber-400">
                upvoted your solution:
              </span>
            </>
          ),
          dot: 'bg-amber-400',
          ring: 'border-amber-500 bg-amber-500/20'
        }
      }

      return {
        highlight: <span className="text-amber-400">{item.actorName} upvoted your solution:</span>,
        dot: 'bg-amber-400',
        ring: 'border-amber-500 bg-amber-500/20'
      }
    }
    case 'UPDATE_SOLUTION': return { highlight: 'You updated', dot: 'bg-teal-400', ring: 'border-teal-500/20', text: 'text-teal-400' }
    case 'APPROVE_SOLUTION': return { highlight: 'Your solution was approved:', dot: 'bg-emerald-400', ring: 'border-emerald-500 bg-emerald-500/20', text: 'text-emerald-400' }
    case 'CLOSE_VEXATION': return { highlight: 'A vexation you claimed was closed:', dot: 'bg-slate-400', ring: 'border-slate-500 bg-slate-500/20', text: 'text-slate-400' }
    default: return { highlight: 'Activity', dot: 'bg-slate-400', ring: 'border-slate-500 bg-slate-500/20', text: 'text-slate-400' }
  }
}

export default function ActivityFeed({ activities }: { activities: Activity[] }) {
  const groupedActivities = useMemo(() => {
    const grouped: GroupedActivity[] = []

    activities.forEach((act) => {
      const last = grouped[grouped.length - 1]

      if (last && last.type === act.type && last.targetId === act.targetId) {
        if (!last.groupedActors.some(a => a.id === act.actorId)) {
          last.groupedActors.push({
            id: act.actorId,
            name: act.actorName
          })
        }
      } else {
        grouped.push({
          ...act,
          groupedActors: [{ 
            id: act.actorId,
            name: act.actorName
           }]
        })
      }
    })

    return grouped
  }, [activities])

  return (
    <div className="bg-[#1A1825] border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-6">
        <span className="text-amber-400">📡</span> Activity Feed
      </h3>
      
      {groupedActivities.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {groupedActivities.map((item) => {
            const style = getActivityStyle(item)
            return (
              <div key={item.id} className="relative flex items-start gap-4">
                <div className={`w-5 h-5 rounded-full ${style.ring} border flex items-center justify-center shrink-0 z-10 mt-0.5`}>
                   <div className={`w-1.5 h-1.5 ${style.dot} rounded-full`} />
                </div>
                <div>
                  <p className="text-sm text-white mb-0.5">
                    <span className={style.text}>{style.highlight}</span>{' '}
                    <span className="font-semibold">{item.targetTitle}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.createdAt ? formatTimeAgo(item.createdAt.toDate()) : 'Just now'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <button className="w-full mt-6 py-2.5 text-xs font-bold text-slate-400 border border-white/5 rounded-lg hover:bg-white/5 transition-colors">
        VIEW FULL HISTORY
      </button>
    </div>
  )
}