import { Link } from '@tanstack/react-router'
import { ThumbsUp, Eye } from 'lucide-react'
import type { Vexation } from '../../types'

const sectorColors: Record<string, string> = {
  health:       'bg-emerald-500/15 text-emerald-400',
  finance:      'bg-amber-500/15 text-amber-400',
  logistics:    'bg-cyan-500/15 text-cyan-400',
  'ai/ml':      'bg-rose-500/15 text-rose-400',
  technology:   'bg-indigo-500/15 text-indigo-400',
  education:    'bg-violet-500/15 text-violet-400',
  environment:  'bg-teal-500/15 text-teal-400',
  productivity: 'bg-sky-500/15 text-sky-400',
  agriculture:  'bg-lime-500/15 text-lime-400',
  social:       'bg-pink-500/15 text-pink-400',
}

const painColors: Record<string, string> = {
  Low:      'bg-emerald-500',
  Medium:   'bg-indigo-500',
  High:     'bg-amber-500',
  Critical: 'bg-rose-500',
}

const painIntensity: Record<string, number> = {
  Low: 25, Medium: 55, High: 75, Critical: 95,
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function formatDate(timestamp: any): string {
  if (!timestamp?.toDate) return ''
  const date = timestamp.toDate()
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BrowseCard({ vexation }: { vexation: Vexation }) {
  const sectorKey = vexation.sector.toLowerCase()
  const sectorStyle = sectorColors[sectorKey] || 'bg-slate-500/15 text-slate-400'
  const barColor = painColors[vexation.severity] || 'bg-slate-500'
  const intensity = painIntensity[vexation.severity] || 50

  return (
    <Link to="/vexation/$id" params={{ id: vexation.id }} className="block">
      <div className="bg-vexed-bg1/50 border border-white/5 hover:border-vexed-highlight1/20 rounded-xl p-5 transition-all group h-full flex flex-col">
        {/* Sector badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${sectorStyle}`}>
            {vexation.sector}
          </span>
        </div>

        {/* Title + Description */}
        <h3 className="text-base font-bold text-white mb-1.5 leading-tight group-hover:text-vexed-highlight2 transition-colors line-clamp-2">
          {vexation.title}
        </h3>
        <p className="text-[13px] text-slate-400 line-clamp-2 leading-relaxed mb-4 flex-1">
          {vexation.description}
        </p>

        {/* Poster + Date */}
        <p className="text-[11px] text-slate-500 mb-4">
          By <span className="text-slate-300 font-medium">{vexation.authorDisplayName || 'Anonymous'}</span>
          {' · '}
          {formatDate(vexation.createdAt)}
        </p>

        {/* Pain Level bar — compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-medium">Pain Level: {vexation.severity}</span>
            <span className="text-[10px] text-slate-500 font-medium">{intensity}%</span>
          </div>
          <div className="w-full bg-vexed-accent2 h-1 rounded-full overflow-hidden">
            <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${intensity}%` }} />
          </div>
        </div>

        {/* Footer: stats + complexity */}
        <div className="border-t border-white/5 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ThumbsUp size={11} /> {formatCount(vexation.upvotes)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={11} /> {formatCount(vexation.viewCount)}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            {vexation.technicalComplexity || 'Unknown'}
          </span>
        </div>
      </div>
    </Link>
  )
}