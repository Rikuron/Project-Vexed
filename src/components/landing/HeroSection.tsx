import { Link } from '@tanstack/react-router'

export default function HeroSection() {
  return (
    <section className="w-full mx-auto px-6 py-20 flex flex-col items-center text-center mt-12 relative">
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-[15%] w-16 h-16 rounded-full bg-linear-to-tr from-vexed-primary to-vexed-highlight2 opacity-20 blur-xl animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}></div>
      <div className="absolute bottom-20 right-[15%] w-24 h-24 rounded-full bg-linear-to-br from-vexed-highlight1 to-purple-500 opacity-20 blur-xl animate-bounce pointer-events-none" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>

      {/* Vexed Wordmark Logo with Hover Scale */}
      <div className="mb-6 block transform transition-transform duration-700 hover:scale-105">
        <img 
          src="/wordmark.png" 
          alt="Vexed Wordmark" 
          className="w-full max-w-[280px] md:max-w-[480px] h-auto object-contain drop-shadow-[0_0_20px_rgba(26,44,254,0.4)]"
        />
      </div>

      {/* BrandSide Tagline with Gradient Highlight */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-8 leading-tight max-w-4xl mx-auto">
        Turn your daily <span className="text-transparent bg-clip-text bg-linear-to-r from-vexed-highlight2 to-vexed-primary">frustrations</span> into someone's next <span className="text-transparent bg-clip-text bg-linear-to-r from-vexed-primary to-[#553CFF]">mission</span>.
      </h1>
      
      <p className="text-lg md:text-xl text-vexed-dim max-w-2xl mb-12 leading-relaxed">
        Submit real-world problems and let developers build solutions. <br className="hidden md:block" />
        A problem-first platform connecting frustrations with builders.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 w-[65%] sm:w-auto items-center">
        {/* Glow wrapper for primary button */}
        <div className="relative group w-full sm:w-auto">
          <div className="absolute -inset-1 bg-linear-to-r from-vexed-highlight2 to-vexed-primary rounded-xl blur opacity-30 group-hover:opacity-80 transition duration-500"></div>
          <Link 
            to="/app" 
            className="relative flex items-center justify-center w-full px-8 py-4 rounded-xl bg-vexed-primary text-white font-bold text-lg transition-all transform hover:-translate-y-1 hover:scale-105 shadow-xl"
          >
            Launch App
          </Link>
        </div>
        
        <Link 
          to="/signIn" 
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-vexed-accent2 text-white font-bold text-lg transition-all border border-vexed-accent4 hover:border-vexed-dim text-center"
        >
          Sign In
        </Link>
      </div>
    </section>
  )
}