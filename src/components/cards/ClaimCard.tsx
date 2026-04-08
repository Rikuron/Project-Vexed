import { ArrowRight } from 'lucide-react'
import type { Vexation } from '../../types'

interface ClaimCardProps {
  vexation: Vexation
  variant: 'claimed' | 'bookmarked'
}

function formatTimeAgo(timestamp: any): string {
  if (!timestamp?.toDate) return 'Just now'
  const diffHrs = Math.floor((Date.now() - timestamp.toDate().getTime()) / 3600000)
  if (diffHrs < 24) return `Updated ${diffHrs}h ago`
  return `Updated ${Math.floor(diffHrs / 24)}d ago`
}

export default function ClaimCard({ vexation, variant }: ClaimCardProps) {
  const isClaimed = variant === 'claimed'

  return (
    <div className="bg-[#1A1825] border border-white/5 hover:border-white/10 transition-colors rounded-xl p-6 flex flex-col group h-full">
      {/* Top row: Status and Time */}
      <div className="flex items-center justify-between mb-4 mt-1">
        <div className={`flex items-center gap-2 text-[10px] font-bold tracking-widest ${isClaimed ? 'text-[#D4B853]' : 'text-emerald-400'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isClaimed ? 'bg-[#D4B853]' : 'bg-emerald-400'}`} />
          {isClaimed ? 'IN PROGRESS' : 'SAVED'}
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          {formatTimeAgo(vexation.updatedAt || vexation.createdAt)}
        </span>
      </div>

      {/* Title and Description */}
      <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-indigo-200 transition-colors line-clamp-2">
        {vexation.title}
      </h3>
      <p className="text-[13px] text-slate-400 mb-6 flex-1 line-clamp-3 leading-relaxed pr-4">
        {vexation.description}
      </p>

      {/* Poster + Date info */}
      <div className="flex items-center gap-3 mb-5 text-[12px] text-slate-500">
        <span>Posted by <span className="text-slate-300 font-medium">{vexation.authorDisplayName || 'Anonymous'}</span></span>
        <span>•</span>
        <span>
          {vexation.createdAt?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {' at '}
          {vexation.createdAt?.toDate?.().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      {/* Bottom row: Tags and Button */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-white/10 px-2.5 py-1 rounded text-[9px] font-bold text-slate-400 tracking-widest uppercase">
            {vexation.sector}
          </span>
          <span className="border border-white/10 px-2.5 py-1 rounded text-[9px] font-bold text-slate-400 tracking-widest uppercase">
            {vexation.severity}
          </span>
        </div>
        <span className="bg-[#553CFF] hover:bg-[#4A34DF] text-white px-4 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(85,60,255,0.2)] hover:shadow-[0_0_20px_rgba(85,60,255,0.4)]">
          {isClaimed ? 'Continue' : 'View'} <ArrowRight size={14} />
        </span>
      </div>
    </div>
  )
}