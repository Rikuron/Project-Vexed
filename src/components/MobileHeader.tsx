import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { UserCog, LogOut } from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'

export default function MobileHeader() {
  const { user, signOut } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node))
        setSettingsOpen(false)
    }
    if (settingsOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [settingsOpen])

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-vexed-bg1 border-b border-vexed-accent2 flex items-center justify-between px-4 z-40 lg:hidden">
      <Link to="/">
        <img src="/wordmark.png" alt="Vexed" className="h-8 w-auto" />
      </Link>

      {user ? (
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-1 rounded-full cursor-pointer"
            aria-label="User menu"
          >
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
          </button>

          {settingsOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1825] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
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
      ) : (
        <Link
          to="/signIn"
          className="text-sm font-bold text-vexed-primary hover:text-vexed-highlight2 transition-colors"
        >
          Sign In
        </Link>
      )}
    </header>
  )
}