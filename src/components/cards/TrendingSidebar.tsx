const TRENDING_SECTORS = [
  { name: 'Generative AI', change: '+12%' },
  { name: 'Green Logistics', change: '+8%' },
  { name: 'DeFi Security', change: '+5%' },
]

const RECENTLY_RESOLVED = [
  { title: 'Cold-chain IoT Sync', detail: "Resolved by 'ArcticFlow' team with 99.9% uptime." },
  { title: 'KYC Automation', detail: 'SDK launched for automated ID verification.' },
]

export default function TrendingSidebar() {
  return (
    <div className="flex flex-col justify-between h-full pt-8 pb-8">
      {/* Top content */}
      <div className="space-y-6">
        {/* Trending Sectors */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#553CFF] mb-3">
            Trending Sectors
          </h3>
          <div className="space-y-2">
            {TRENDING_SECTORS.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-white">{s.name}</span>
                <span className="text-[13px] font-bold text-emerald-400">{s.change}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Resolved */}
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#553CFF] mb-3">
            Recently Resolved
          </h3>
          <div className="space-y-2">
            {RECENTLY_RESOLVED.map((r) => (
              <div key={r.title} className="bg-[#1A1825] border border-white/5 rounded-lg p-3">
                <p className="text-[13px] font-semibold text-white mb-0.5">{r.title}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Build for the Market — pinned to bottom */}
      <div className="bg-linear-to-br from-[#1E1145] to-[#0D0C15] border border-[#553CFF]/20 rounded-xl p-5">
        <h4 className="text-[#553CFF] text-[13px] font-bold mb-1.5">Build for the Market</h4>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
          Vexed maps 10,000+ real-world pain points to help you find your next startup idea.
        </p>
        <button className="w-full py-2 bg-[#553CFF] hover:bg-[#4A34DF] text-white text-[13px] font-bold rounded-lg transition-colors cursor-pointer">
          View Playbooks
        </button>
      </div>
    </div>
  )
}