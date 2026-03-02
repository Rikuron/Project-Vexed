import { Link } from '@tanstack/react-router'
import { ThumbsUp, MessageSquare } from 'lucide-react'
import type { Vexation } from '../../lib/types'

// Badge colour based on AI-assigned category label
const CATEGORY_STYLES: Record<string, string> = {
  bug: 'border-red-800 text-red-400 bg-red-900/20',
  feature: 'border-blue-700 text-blue-400 bg-blue-900/20',
  'ux friction': 'border-orange-700 text-orange-400 bg-orange-900/20',
  performance: 'border-yellow-700 text-yellow-400 bg-yellow-900/20',
}

function getCategoryStyle(category: string): string {
  const key = (category ?? '').toLowerCase()
  for (const [match, style] of Object.entries(CATEGORY_STYLES)) {
    if (key.includes(match)) return style
  }
  return 'border-indigo-700 text-indigo-400 bg-indigo-900/20'
}

export default function RecentVexationCard({ vexation: vex }: { vexation: Vexation }) {
  return (
    <Link
      to="/vexation/$id"
      params={{ id: vex.id }}
      className="group rounded-xl border border-vexed-accent2 bg-vexed-bg1 p-5 hover:border-vexed-highlight3/40 hover:bg-vexed-bg1/80 transition-all duration-200"
    >
      {/* Category badge + time */}
      <div className="flex items-center justify-between mb-3">
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${getCategoryStyle(vex.category)}`}>
          {vex.category || vex.sector}
        </span>
        <span className="text-xs text-gray-500">{formatTimeAgo(vex.createdAt)}</span>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-sm mb-1.5 group-hover:text-vexed-highlight2 transition-colors line-clamp-2">
        {vex.title}
      </h3>

      {/* Summary */}
      <p className="text-xs text-vexed-dim mb-4 line-clamp-2 leading-relaxed">
        {vex.summary}
      </p>

      {/* Footer stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <ThumbsUp size={11} /> {vex.upvotes}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare size={11} /> {vex.commentCount}
        </span>
      </div>
    </Link>
  )
}

function formatTimeAgo(timestamp: any): string {
  if (!timestamp?.toDate) return ''
  const diffMins = Math.floor((Date.now() - timestamp.toDate().getTime()) / 60_000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}
