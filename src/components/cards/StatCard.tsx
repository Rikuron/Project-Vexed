import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  changePercent: string
  icon: ReactNode
  variant?: 'default' | 'accent'
}

export default function StatCard({ label, value, changePercent, icon, variant = 'default' }: StatCardProps) {
  const isAccent = variant === 'accent'

  return (
    <div className={`relative rounded-xl p-6 flex flex-col justify-between overflow-hidden ${
      isAccent 
        ? 'bg-linear-to-br from-vexed-accent3 to-vexed-bg4 border border-vexed-highlight1/30'
        : 'bg-vexed-bg4 border border-white/5'
    }`}>
      {/* Background Overlay */}

      {/* Top row: label + icon */}
      <div className="flex items-center justify-between mb-4">
        <p className={`text-xs font-bold tracking-wider uppercase ${isAccent ? 'text-vexed-highlight2' : 'text-vexed-dim'}`}>
          {label}
        </p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isAccent ? 'bg-vexed-highlight1/20 text-vexed-highlight2' : 'bg-white/5 text-vexed-dim'
        }`}>
          {icon}
        </div>
      </div>

      {/* Bottom row: value + change */}
      <div className="flex items-end gap-4">
        <h3 className="text-3xl font-black text-white leading-none">{value}</h3>
        <span className={`text-sm font-semibold mb-0.5 flex items-center gap-1 ${changePercent === "No Streak" ? "text-vexed-dim" : "text-emerald-400"}`}>
          {changePercent !== "No Streak" && "📈"} {changePercent}
        </span>

        {/* Glow for accent */}
        {isAccent && (
          <div className="absolute top-0 right-0 w-24 h-24 bg-vexed-highlight1/20 blur-2xl rounded-full -translate-y-1/2 translate-x-1/4" />
        )}
      </div>
    </div>
  )
}