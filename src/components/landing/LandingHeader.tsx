import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Detect scroll to apply glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      // Optional: close mobile menu when scrolling starts
      if (window.scrollY > 20 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen])

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false) // Close the menu on click
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        scrolled || mobileMenuOpen
          ? 'bg-vexed-bg2/80 backdrop-blur-md border-vexed-accent2 py-4 shadow-lg translate-y-0 opacity-100' 
          : 'bg-transparent border-transparent py-4 -translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between relative z-50">
        {/* Logo */}
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block transform transition-transform duration-300 hover:scale-105">
          <img 
            src="/wordmark.png" 
            alt="Vexed Wordmark" 
            className="h-7 md:h-9 w-auto object-contain drop-shadow-[0_0_10px_rgba(26,44,254,0.3)]"
          />
        </Link>

        {/* Desktop Navigation / Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">
          
          <nav className="flex items-center gap-6 text-sm font-medium text-vexed-dim">
            <a href="#demo" onClick={(e) => { e.preventDefault(); scrollToSection('demo') }} className="hover:text-white transition-colors">How it works</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features') }} className="hover:text-white transition-colors">Features</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact') }} className="hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="w-px h-6 bg-vexed-accent2"></div>

          <Link to="/signIn" className="px-5 py-2 rounded-lg text-vexed-dim hover:text-white font-medium transition-colors">
            Sign In
          </Link>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-vexed-highlight2 to-vexed-primary rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
            <Link to="/app" className="relative flex items-center justify-center px-5 py-2 rounded-lg bg-vexed-primary text-white font-bold text-sm transition-transform transform group-hover:-translate-y-0.5 shadow-md">
              Launch App
            </Link>
          </div>
        </div>

        {/* Mobile Toggle Button & Launch App */}
        <div className="flex md:hidden items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-linear-to-r from-vexed-highlight2 to-vexed-primary rounded-lg blur opacity-30 transition duration-300"></div>
            <Link to="/app" className="relative flex items-center justify-center px-4 py-2 rounded-lg bg-vexed-primary text-white font-bold text-xs shadow-md">
              Launch App
            </Link>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-vexed-dim hover:text-white transition-colors p-1"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-vexed-bg2/95 backdrop-blur-xl border-b border-vexed-accent2 shadow-2xl transition-all duration-300 origin-top overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 py-6 opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-6 flex flex-col gap-6">
          <nav className="flex flex-col gap-4 text-base font-medium text-white">
            <a href="#demo" onClick={(e) => { e.preventDefault(); scrollToSection('demo') }} className="block py-2 border-b border-vexed-accent2/50">How it works</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features') }} className="block py-2 border-b border-vexed-accent2/50">Features</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact') }} className="block py-2 border-b border-vexed-accent2/50">Contact</a>
          </nav>
          <div className="pt-2">
            <Link to="/signIn" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3 rounded-xl border border-vexed-accent2 text-white font-medium hover:bg-vexed-accent2 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}