interface ActivityItem {
  color: string
  text: string
  highlight: string
  time: string
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  { color: 'indigo', highlight: 'You claimed', text: 'Optimize Redux Store', time: '2 hours ago' },
  { color: 'emerald', highlight: 'User @dev_jane upvoted', text: 'your solution to Async Auth Flow', time: '5 hours ago' },
  { color: 'sky', highlight: 'Solution merged:', text: 'GraphQL Query Optimizer', time: 'Yesterday at 4:30 PM' },
  { color: 'slate', highlight: 'Profile updated:', text: 'New badge "Speed Demon" earned', time: '2 days ago' }
]

const colorMap: Record<string, {
  dot: string; 
  ring: string; 
  textColor: string;
}> = {
  indigo: {
    dot: 'bg-indigo-400',
    ring: 'border-indigo-500 bg-indigo-500/20',
    textColor: 'text-indigo-400'
  },
  emerald: {
    dot: 'bg-emerald-400',
    ring: 'border-emerald-500 bg-emerald-500/20',
    textColor: 'text-emerald-400'
  },
  sky: {
    dot: 'bg-sky-400',
    ring: 'border-sky-500 bg-sky-500/20',
    textColor: 'text-sky-400'
  },
  slate: {
    dot: 'bg-slate-400',
    ring: 'border-slate-500 bg-slate-500/20',
    textColor: 'text-slate-400'
  }
}

export default function ActivityFeed() {
  return (
    <div className="bg-[#1A1825] border border-white/5 rounded-2xl p-6">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-6">
        <span className="text-amber-400">📡</span> Activity Feed
      </h3>
      <div className="space-y-6 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {MOCK_ACTIVITIES.map((item, i) => {
          const colors = colorMap[item.color] || colorMap.slate
          return (
            <div key={i} className="relative flex items-start gap-4">
              <div className={`w-5 h-5 rounded-full ${colors.ring} border flex items-center justify-center shrink-0 z-10 mt-0.5`}>
                <div className={`w-1.5 h-1.5 ${colors.dot} rounded-full`} />
              </div>
              <div>
                <p className="text-sm text-white mb-0.5">
                  <span className={colors.textColor}>{item.highlight}</span>{' '}
                  <span className="font-semibold">{item.text}</span>
                </p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>
            </div>
          )
        })}
      </div>
      <button className="w-full mt-6 py-2.5 text-xs font-bold text-slate-400 border border-white/5 rounded-lg hover:bg-white/5 transition-colors">
        VIEW FULL HISTORY
      </button>
    </div>
  )
}