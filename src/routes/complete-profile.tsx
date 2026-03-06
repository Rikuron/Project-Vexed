import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'
import { createUserProfile } from '../lib/db'
import { Timestamp } from 'firebase/firestore'
import type { UserRole } from '../types'
import { updateProfile } from 'firebase/auth'

export const Route = createFileRoute('/complete-profile')({
  component: CompleteProfilePage,
})

function CompleteProfilePage() {
  const navigate = useNavigate()
  const { user, userProfile, loading: authLoading } = useAuth()

  const [role, setRole] = useState<UserRole>('Poster')
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill display name if provided by provider
  useEffect(() => {
    if (user?.displayName && !displayName) setDisplayName(user.displayName)
  }, [user])

  // Redirect if account already exists OR not logged in at all
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate({ to: '/signIn', replace: true })
      } else if (userProfile) {
        navigate({ to: '/', replace: true })
      }
    }
  }, [user, userProfile, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || isSubmitting) return
    if (!displayName.trim()) {
      setError("Display Name is required")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // 1. Update Firebase Auth profile
      await updateProfile(user, { displayName: displayName.trim() })

      // 2. Create Vexed User Profile in Firestore
      await createUserProfile(user.uid, {
        email: user.email || '',
        displayName: displayName.trim(),
        photoURL: user.photoURL,
        role: role,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // 3. Force reload window
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message || "Failed to create profile")
      setIsSubmitting(false)
    }
  }

  if (authLoading || (!user && !userProfile)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_66.95%_132.18%_at_65.31%_21.14%,#1E1933_0%,#0D0C15_100%)] px-6">
      <div className="w-full max-w-md bg-vexed-bg4/70 rounded-2xl border border-vexed-accent4 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Complete your profile</h1>
          <p className="text-sm text-slate-400">
            Just a few more details before you can join the Vexed community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {error && (
            <div className="p-3 text-xs text-red-400 bg-red-900/10 border border-red-500/20 rounded-lg">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              I am joining as a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Poster')}
                className={`px-4 py-3 rounded-xl border text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'Poster' 
                    ? 'bg-[#553CFF]/10 border-[#553CFF] text-white shadow-[0_0_15px_rgba(85,60,255,0.2)]' 
                    : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/20 cursor-pointer'
                }`}
              >
                <span className="font-bold">Poster</span>
                <span className="text-[10px] opacity-70">I have problems</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('Solver')}
                className={`px-4 py-3 rounded-xl border text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                  role === 'Solver' 
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/20 cursor-pointer'
                }`}
              >
                <span className="font-bold">Developer</span>
                <span className="text-[10px] opacity-70">I build solutions</span>
              </button>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              Display Name
            </label>
            <input 
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#553CFF] focus:ring-1 focus:ring-[#553CFF] transition-all text-white placeholder:text-slate-600"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#553CFF] cursor-pointer hover:bg-[#4A34DF] text-white font-semibold rounded-lg py-3 mt-2 transition-all shadow-[0_0_15px_rgba(85,60,255,0.3)] hover:shadow-[0_0_20px_rgba(85,60,255,0.5)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Complete Setup'}
          </button>
        </form>

      </div>
    </div>
  )
}
