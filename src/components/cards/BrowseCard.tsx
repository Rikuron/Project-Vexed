import { Link } from '@tanstack/react-router'
import { ThumbsUp, Eye, ChevronRight } from 'lucide-react'
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

const severityColors: Record<string, string> = {
  Low:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium:   'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  High:     'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
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

interface BrowseCardProps {
  vexation: Vexation
  variant?: 'grid' | 'list'
}

export default function BrowseCard({ vexation, variant = 'grid' }: BrowseCardProps) {
  const sectorKey = vexation.sector.toLowerCase()
  const sectorStyle = sectorColors[sectorKey] || 'bg-slate-500/15 text-slate-400'

  if (variant === 'list') return <ListRow vexation={vexation} sectorStyle={sectorStyle} />
  return <GridCard vexation={vexation} sectorStyle={sectorStyle} />
}

/* Grid Card (vertical, full detail) */
function GridCard({ vexation, sectorStyle }: { vexation: Vexation; sectorStyle: string }) {
  const barColor = painColors[vexation.severity] || 'bg-slate-500'
  const intensity = painIntensity[vexation.severity] || 50

  return (
    <Link to="/vexation/$id" params={{ id: vexation.id }} className="block h-full">
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

        {/* Pain Level bar */}
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

/* List Row (horizontal, compact) */
function ListRow({ vexation, sectorStyle }: { vexation: Vexation; sectorStyle: string }) {
  const sevStyle = severityColors[vexation.severity] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'

  return (
    <Link to="/vexation/$id" params={{ id: vexation.id }} className="block">
      <div className="bg-vexed-bg1/50 border border-white/5 hover:border-vexed-highlight1/20 rounded-xl p-4 sm:p-5 transition-all group">
        {/* Mobile: stacked layout / Desktop: horizontal row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

          {/* Title + sector (takes up remaining space) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 sm:mb-0.5">
              <h3 className="text-[15px] font-semibold text-white group-hover:text-vexed-highlight2 transition-colors truncate">
                {vexation.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase ${sectorStyle}`}>
                {vexation.sector}
              </span>
              <span className="text-[11px] text-slate-500">
                by {vexation.authorDisplayName || 'Anonymous'}
              </span>
            </div>
          </div>

          {/* Meta badges + stats (right side on desktop, bottom row on mobile) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Severity badge */}
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${sevStyle}`}>
              {vexation.severity}
            </span>

            {/* Stats */}
            <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <ThumbsUp size={11} /> {formatCount(vexation.upvotes)}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={11} /> {formatCount(vexation.viewCount)}
              </span>
            </div>

            {/* Date */}
            <span className="text-[11px] text-slate-600 hidden sm:inline">
              {formatDate(vexation.createdAt)}
            </span>

            {/* Chevron */}
            <ChevronRight size={16} className="text-slate-600 group-hover:text-vexed-highlight2 transition-colors hidden sm:block" />
          </div>
        </div>
      </div>
    </Link>
  )
}