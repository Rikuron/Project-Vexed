import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  // Detect scroll to apply glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-vexed-bg2/80 backdrop-blur-md border-vexed-accent2 py-4 shadow-lg translate-y-0 opacity-100' 
          : 'bg-transparent border-transparent py-4 -translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="block transform transition-transform duration-300 hover:scale-105">
          <img 
            src="/wordmark.png" 
            alt="Vexed Wordmark" 
            className="h-7 md:h-9 w-auto object-contain drop-shadow-[0_0_10px_rgba(26,44,254,0.3)]"
          />
        </Link>

        {/* Navigation / Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link 
            to="/signIn" 
            className="hidden sm:flex px-5 py-2 rounded-lg text-vexed-dim hover:text-white font-medium transition-colors"
          >
            Sign In
          </Link>
          
          <div className="relative group">
            {/* Ambient glow for the Launch App button */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-vexed-highlight2 to-vexed-primary rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
            <Link 
              to="/app" 
              className="relative flex items-center justify-center px-5 py-2 rounded-lg bg-vexed-primary text-white font-bold text-sm transition-transform transform group-hover:-translate-y-0.5 shadow-md"
            >
              Launch App
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}