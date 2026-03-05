import { Github } from 'lucide-react'
import type { UserRole } from '../../types'

interface SocialAuthGridProps {
  isSignUp: boolean
  role: UserRole
  onProviderLogin: (provider: 'google' | 'github' | 'twitter' | 'microsoft' | 'linkedin') => void
}

export function SocialAuthGrid({ isSignUp, role, onProviderLogin }: SocialAuthGridProps) {
  return (
    <>
      <div className="mt-6 flex items-center gap-3 before:h-px before:flex-1 before:bg-white/5 after:h-px after:flex-1 after:bg-white/5">
        <span className="text-[10px] font-bold tracking-widest text-slate-500 whitespace-nowrap">
          OR CONTINUE WITH
        </span>
      </div>

      {/* Single row of icon-only buttons centered */}
      <div className="mt-5 flex justify-center items-center gap-3">
        {/* 1. Google */}
        <button
          type="button"
          title="Sign in with Google"
          onClick={() => onProviderLogin('google')}
          className="flex items-center justify-center w-11 h-11 bg-[#1A1A24] cursor-pointer hover:bg-[#22222D] border border-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#553CFF]/50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>

        {/* 2. X / Twitter */}
        <button
          type="button"
          title="Sign in with X (Twitter)"
          onClick={() => onProviderLogin('twitter')}
          className="flex items-center justify-center w-11 h-11 bg-[#1A1A24] cursor-pointer hover:bg-[#22222D] border border-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#553CFF]/50"
        >
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </button>

        {/* 3. Microsoft */}
        <button
          type="button"
          title="Sign in with Microsoft"
          onClick={() => onProviderLogin('microsoft')}
          className="flex items-center justify-center w-11 h-11 bg-[#1A1A24] cursor-pointer hover:bg-[#22222D] border border-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#553CFF]/50"
        >
          <svg className="w-5 h-5" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
        </button>

        {/* 4. LinkedIn */}
        <button
          type="button"
          title="Sign in with LinkedIn"
          onClick={() => onProviderLogin('linkedin')}
          className="flex items-center justify-center w-11 h-11 bg-[#1A1A24] cursor-pointer hover:bg-[#22222D] border border-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#553CFF]/50"
        >
          <svg className="w-5 h-5 fill-[#0a66c2]" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </button>

        {/* 5. GitHub (Conditionally Rendered for Solvers) */}
        {(!isSignUp || role === 'Solver') && (
          <button
            type="button"
            title="Sign in with GitHub"
            onClick={() => onProviderLogin('github')}
            className="flex items-center justify-center w-11 h-11 bg-[#1A1A24] cursor-pointer hover:bg-[#22222D] border border-white/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#553CFF]/50"
          >
            <Github size={20} />
          </button>
        )}
      </div>
    </>
  )
}
