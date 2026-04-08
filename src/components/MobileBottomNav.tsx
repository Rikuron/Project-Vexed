import { Link } from '@tanstack/react-router'
import {
  FileText, Bookmark, TrendingUp, CirclePlus,
  LayoutGrid, Compass, Zap, Briefcase
} from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'

export default function MobileBottomNav() {
  const { user, userProfile } = useAuth()
  const isSolver = userProfile?.role === 'Solver'

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-vexed-bg1 border-t border-vexed-accent2 flex items-center justify-around z-40 lg:hidden">
      {isSolver ? (
        <>
          <BottomNavLink to="/" icon={<LayoutGrid size={20} />} label="Home" />
          <BottomNavLink to="/browse" icon={<Compass size={20} />} label="Browse" />
          <BottomNavLink to="/my/claimed" icon={<Zap size={20} />} label="Claims" />
          <BottomNavLink to="/portfolio" icon={<Briefcase size={20} />} label="Portfolio" />
        </>
      ) : (
        <>
          <BottomNavLink to="/my-vexations" icon={<FileText size={20} />} label="Vexations" />
          <BottomNavLink to="/my/saved" icon={<Bookmark size={20} />} label="Saved" />
          <BottomNavLink to="/browse" icon={<TrendingUp size={20} />} label="Trending" />
          <BottomNavLink to="/submit" icon={<CirclePlus size={20} />} label="New" search={{ prefill: '' }} />
        </>
      )}
    </nav>
  )
}

function BottomNavLink({ to, icon, label, search }: {
  to: string; icon: React.ReactNode; label: string; search?: Record<string, string>
}) {
  return (
    <Link
      to={to}
      search={search as any}
      className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-gray-500 transition-colors min-w-[64px]"
      activeProps={{
        className: 'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-indigo-400 min-w-[64px]',
      }}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}