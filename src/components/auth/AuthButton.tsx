import { Link } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/AuthContext'
import LoadingScreen from '../LoadingScreen'

export default function AuthButton() {
  const { user, userProfile, loading, signOut } = useAuth()

  if (loading) {
    return (
      <LoadingScreen />
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {userProfile?.role === 'Solver' && (
          <span className="hidden text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20 sm:inline">
            Developer
          </span>
        )}
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
        <span className="hidden text-sm font-medium text-gray-200 sm:inline">
          {user.displayName}
        </span>
        <button
          onClick={signOut}
          className="ml-2 rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-gray-400 transition-colors cursor-pointer hover:border-red-500/50 hover:text-red-400"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <Link
      to="/signIn"
      className="flex items-center gap-1.5 rounded-lg bg-vexed-primary/10 border border-vexed-primary/20 px-6 py-2 text-sm font-bold tracking-wide text-vexed-primary hover:bg-vexed-primary/20 transition-colors"
    >
      Sign In
    </Link>
  )
}
