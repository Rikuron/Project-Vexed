import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu, X, Home, Compass, FileText, Bookmark, Plus, Zap } from 'lucide-react'
import AuthButton from './auth/AuthButton'
import { useAuth } from '../lib/auth'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  return (
    <>
      {/* ── Top header bar ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <Zap size={22} className="text-indigo-400" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">VE</span>
              <span className="text-indigo-400">X</span>
              <span className="text-white">ED</span>
            </span>
          </Link>
        </div>
        <AuthButton />
      </header>

      {/* ── Backdrop overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 text-white z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-indigo-400" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-white">VE</span>
              <span className="text-indigo-400">X</span>
              <span className="text-white">ED</span>
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Vexation CTA */}
        <div className="p-4">
          <Link
            to="/submit"
            search={{ prefill: '' }}
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            <Plus size={18} />
            New Vexation
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-6">
          {/* Personal section */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Personal
            </p>
            <NavLink to="/" icon={<Home size={18} />} label="Home" onClick={() => setIsOpen(false)} />
            <NavLink to="/my-vexations" icon={<FileText size={18} />} label="My Vexations" onClick={() => setIsOpen(false)} />
            <NavLink to="/my/saved" icon={<Bookmark size={18} />} label="Saved" onClick={() => setIsOpen(false)} />
          </div>

          {/* Discover section */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
              Discover
            </p>
            <NavLink to="/browse" icon={<Compass size={18} />} label="Browse Problems" onClick={() => setIsOpen(false)} />
          </div>
        </nav>

        {/* User info at bottom */}
        {user && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? 'User'}
                  className="h-8 w-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                  {user.displayName?.charAt(0) ?? '?'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.displayName ?? 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">Poster</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

// ── Reusable nav link component ──
function NavLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors"
      activeProps={{
        className:
          'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600/10 text-indigo-400 font-medium',
      }}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  )
}
