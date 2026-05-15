import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import {
  Bookmark, CirclePlus, FileText, TrendingUp,
  Settings, ChevronsLeft, ChevronsRight, LayoutGrid,
  Compass, Zap, Briefcase, LogOut, UserCog
} from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'
import { useSidebar } from '../lib/sidebar'

export default function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { collapsed, toggle } = useSidebar()
  const { user, userProfile, signOut } = useAuth()

  const settingsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) setSettingsOpen(false)
    }
    if (settingsOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [settingsOpen])

  const sidebarWidth = collapsed ? 'w-16' : 'w-[230px]'
  const isSolver = userProfile?.role === 'Solver'

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full ${sidebarWidth} bg-vexed-bg1 border-r border-vexed-accent2 text-white z-50
        hidden lg:flex flex-col transition-all duration-300 ease-in-out
      `}
    >
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-8'} py-2 border-b border-slate-800`}>
        <Link to="/" className="flex items-center gap-1.5">
          {collapsed ? (
            <img src="/logo512.png" alt="V" className="h-8 w-8" />
          ) : (
            <img src="/wordmark.png" alt="Vexed" className="h-11 w-auto" />
          )}
        </Link>
      </div>

      {/* New Vexation CTA */}
      {!isSolver && (
        <div className={collapsed ? 'px-2 pt-4 pb-3' : 'px-4 pt-4 pb-3'}>
          <Link
            to="/submit"
            search={{ prefill: '' }}
            className={`flex items-center justify-center gap-2 w-full rounded-lg bg-vexed-accent3/70 hover:bg-vexed-accent3 px-4 py-2.5 text-sm font-semibold text-white transition-colors ${collapsed ? 'px-0!' : ''}`}
            title={collapsed ? 'New Vexation' : ''}
          >
            <CirclePlus size={16} />
            {!collapsed && 'New Vexation'}
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 mt-4 pb-4 overflow-y-auto space-y-5">
        {isSolver ? (
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Workspace
              </p>
            )}
            <NavLink to="/" icon={<LayoutGrid size={16} />} label="Dashboard" collapsed={collapsed} />
            <NavLink to="/browse" icon={<Compass size={16} />} label="Browse" collapsed={collapsed} />
            <NavLink to="/my/claimed" icon={<Zap size={16} />} label="My Claims" collapsed={collapsed} />
            <NavLink to="/portfolio" icon={<Briefcase size={16} />} label="Portfolio" collapsed={collapsed} />
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Personal
                </p>
              )}
              <NavLink to="/my/vexations" icon={<FileText size={16} />} label="My Vexations" collapsed={collapsed} />
              <NavLink to="/my/saved" icon={<Bookmark size={16} />} label="Saved" collapsed={collapsed} />
            </div>
            <div className="space-y-1">
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Discover
                </p>
              )}
              <NavLink to="/browse" icon={<TrendingUp size={16} />} label="Trending Problems" collapsed={collapsed} />
            </div>
          </>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-10 h-8 w-8 rounded-lg border border-slate-700 bg-vexed-bg1 text-gray-500 hover:text-vexed-primary hover:border-vexed-primary cursor-pointer transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>

      {/* User info */}
      {user ? (
        <div className={`p-4 border-t border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3`}>
          {collapsed ? (
            user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName ?? 'User'} className="h-8 w-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {user.displayName?.charAt(0) ?? '?'}
              </div>
            )
          ) : (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName ?? 'User'} className="h-8 w-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {user.displayName?.charAt(0) ?? '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.displayName ?? 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{userProfile?.role ?? 'Poster'}</p>
                </div>
              </div>

              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="p-1.5 text-gray-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
                  aria-label="Settings"
                >
                  <Settings size={16} />
                </button>

                {settingsOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1A1825] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        setSettingsOpen(false)
                        navigate({ to: '/settings' })
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <UserCog size={14} /> User Settings
                    </button>

                    <div className="border-t border-white/5" />
                    <button
                      onClick={async () => {
                        setSettingsOpen(false)
                        await signOut()
                        navigate({ to: '/signIn' })
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={`p-4 border-t border-slate-800 ${collapsed ? 'flex justify-center' : ''}`}>
          <Link
            to="/signIn"
            className={`flex items-center justify-center gap-2 w-full rounded-lg bg-vexed-primary/10 border border-vexed-primary/20 px-4 py-2.5 text-sm font-bold text-vexed-primary hover:bg-vexed-primary/20 transition-colors ${collapsed ? 'px-2!' : ''}`}
            title={collapsed ? 'Sign In' : ''}
          >
            {collapsed ? <LogOut size={16} className="rotate-180" /> : 'Sign In'}
          </Link>
        </div>
      )}
    </aside>
  )
}

function NavLink({ to, icon, label, collapsed }: {
  to: string; icon: React.ReactNode; label: string; collapsed: boolean
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors ${
        collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
      }`}
      activeProps={{
        className: `flex items-center gap-2.5 rounded-lg bg-indigo-600/10 text-indigo-400 font-medium ${
          collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
        }`,
      }}
      title={collapsed ? label : ''}
    >
      {icon}
      {!collapsed && <span className="text-sm">{label}</span>}
    </Link>
  )
}