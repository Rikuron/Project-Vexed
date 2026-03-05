import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../lib/auth/AuthContext'
import type { UserRole } from '../types'

// Your freshly separated UI components!
import { BrandSide } from '../components/auth/BrandSide'
import { SocialAuthGrid } from '../components/auth/SocialAuthGrid'

export const Route = createFileRoute('/signIn')({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { signInWithProvider, signUpWithEmail, signInWithEmail } = useAuth()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [role, setRole] = useState<UserRole>('Poster')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleProviderLogin = async (provider: 'google' | 'github' | 'twitter' | 'microsoft' | 'linkedin') => {
    try {
      setError(null)
      await signInWithProvider(provider, isSignUp ? role : undefined)
      if (window.history.length > 2) {
         router.history.back()
      } else {
         navigate({ to: '/' })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.')
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password || (isSignUp && !displayName)) {
       setError("Please fill in all required fields.")
       return
    }

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName, role)
      } else {
        await signInWithEmail(email, password)
      }
      
      if (window.history.length > 2) {
         router.history.back()
      } else {
         navigate({ to: '/' })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.')
    }
  }


  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_66.95%_132.18%_at_65.31%_21.14%,#1E1933_0%,#0D0C15_100%)] overflow-hidden text-white">
      
      {/* 1. Injected Left Column */}
      <BrandSide />

      {/* Right Column (Form) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 mr-16 relative w-full">
        
        <div className="w-full flex flex-col items-center max-w-[440px]">
          
          {/* Anonymous Tip */}
          <div className="flex justify-center mb-4">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#553CFF]/10 border border-[#553CFF]/20 rounded-full text-xs font-medium text-indigo-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              You can still post anonymously without an account.
            </div>
          </div>

          <div className="w-full bg-vexed-bg4/70 rounded-2xl border border-vexed-accent4 p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-[26px] font-bold mb-1 tracking-tight">
                {isSignUp ? 'Create an account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-slate-400">
                {isSignUp ? 'Join the community' : 'Sign in to your account to continue'}
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">  
              {isSignUp && (
                <div className="mb-4 space-y-2.5">
                  <label className="text-[10px] font-bold tracking-wider text-slate-400 relative">
                    I AM JOINING AS A
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('Poster')}
                      className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                        role === 'Poster' ? 'bg-[#553CFF]/10 border-[#553CFF] text-white shadow-[0_0_15px_rgba(85,60,255,0.2)]' : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/20 cursor-pointer'
                      }`}
                    >
                      <div className="font-bold">Poster</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('Solver')}
                      className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                        role === 'Solver' ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/20 cursor-pointer'
                      }`}
                    >
                      <div className="font-bold">Developer</div>
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2.5 text-xs text-red-400 bg-red-900/10 border border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}

              {/* NEW: DISPLAY NAME FIELD (Only for Sign Up) */}
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-slate-400">
                    FULL NAME
                  </label>
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#553CFF] focus:ring-1 focus:ring-[#553CFF] transition-all placeholder:text-slate-600"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-widest text-slate-400">
                  EMAIL ADDRESS
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#553CFF] focus:ring-1 focus:ring-[#553CFF] transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold tracking-widest text-slate-400">
                    PASSWORD
                  </label>
                  {!isSignUp && (
                    <a href="#" className="text-[11px] text-[#553CFF] hover:text-[#553CFF]/80 transition-colors">
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/5 rounded-lg pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-[#553CFF] focus:ring-1 focus:ring-[#553CFF] transition-all placeholder:text-slate-600 tracking-widest"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#553CFF] hover:bg-[#4A34DF] text-white font-semibold rounded-lg py-2.5 mt-4 transition-all shadow-[0_0_15px_rgba(85,60,255,0.3)] hover:shadow-[0_0_20px_rgba(85,60,255,0.5)] focus:outline-none"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            {/* 2. Injected Social Providers */}
            <SocialAuthGrid 
              isSignUp={isSignUp} 
              role={role} 
              onProviderLogin={handleProviderLogin} 
            />

            <div className="mt-6 text-center text-xs text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#553CFF] cursor-pointer hover:text-[#553CFF]/80 transition-colors focus:outline-none"
              >
                {isSignUp ? 'Sign in' : 'Sign up for free'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
