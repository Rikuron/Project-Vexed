import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Menu, Bookmark, CirclePlus, FileText,
  TrendingUp, Target, Settings, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useSidebar } from '../lib/sidebar'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)   // mobile slide-in
  const { collapsed, toggle } = useSidebar()    // desktop collapse
  const { user } = useAuth()

  const sidebarWidth = collapsed ? 'w-16' : 'w-[230px]'

  return (
    <>
      {/* Mobile hamburger (hidden on desktop) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full ${sidebarWidth} bg-vexed-bg1 border-r border-vexed-accent2 text-white z-50
          flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-8'} py-2 border-b border-slate-800`}>
          <Link to="/" className="flex items-center gap-1.5" onClick={() => setIsOpen(false)}>
            {collapsed ? (
              <img src="/logo512.png" alt="V" className="h-8 w-8" />
            ) : (
              <img src="/wordmark.png" alt="Vexed" className="h-11 w-auto" />
            )}
          </Link>
        </div>

        {/* New Vexation CTA */}
        <div className={collapsed ? 'px-2 pt-4 pb-3' : 'px-4 pt-4 pb-3'}>
          <Link
            to="/submit"
            search={{ prefill: '' }}
            onClick={() => setIsOpen(false)}
            className={`flex items-center justify-center gap-2 w-full rounded-lg bg-vexed-accent3/70 hover:bg-vexed-accent3 px-4 py-2.5 text-sm font-semibold text-white transition-colors ${collapsed ? 'px-0!' : ''}`}
            title={collapsed ? 'New Vexation' : ''}
          >
            <CirclePlus size={16} />
            {!collapsed && 'New Vexation'}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 pb-4 overflow-y-auto space-y-5">
          <div>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Personal
              </p>
            )}
            <NavLink to="/my-vexations" icon={<FileText size={16} />} label="My Vexations" collapsed={collapsed} onClick={() => setIsOpen(false)} />
            <NavLink to="/my/saved" icon={<Bookmark size={16} />} label="Saved" collapsed={collapsed} onClick={() => setIsOpen(false)} />
          </div>
          <div>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Discover
              </p>
            )}
            <NavLink to="/browse" icon={<TrendingUp size={16} />} label="Trending Problems" collapsed={collapsed} onClick={() => setIsOpen(false)} />
            <NavLink to="/browse" icon={<Target size={16} />} label="Top Developers" collapsed={collapsed} onClick={() => setIsOpen(false)} />
          </div>
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="hidden lg:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-10 h-8 w-8 rounded-lg border border-slate-700 bg-vexed-bg1 text-gray-500 hover:text-vexed-primary hover:border-vexed-primary cursor-pointer transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>

        {/* User info */}
        {user && (
          <div className={`p-4 border-t border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3`}>
            {collapsed ? (
              /* Collapsed: avatar only */
              user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName ?? 'User'} className="h-8 w-8 rounded-full shrink-0" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {user.displayName?.charAt(0) ?? '?'}
                </div>
              )
            ) : (
              /* Expanded: avatar + name + settings */
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
                    <p className="text-xs text-gray-500 truncate">Poster</p>
                  </div>
                </div>
                <button className="p-1.5 text-gray-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0" aria-label="Settings">
                  <Settings size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  )
}

// NavLink helper — supports collapsed mode (icon-only with tooltip)
function NavLink({ to, icon, label, collapsed, onClick }: {
  to: string; icon: React.ReactNode; label: string; collapsed: boolean; onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
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
