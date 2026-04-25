import { Link } from '@tanstack/react-router'

export default function LandingCTA() {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-32 flex flex-col items-center text-center relative z-10">
      {/* Background ambient glow behind the CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-vexed-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
        Ready to start your next <span className="text-transparent bg-clip-text bg-linear-to-r from-vexed-primary to-vexed-highlight2">mission?</span>
      </h2>
      
      <p className="text-xl md:text-2xl text-vexed-dim max-w-2xl mb-12 leading-relaxed">
        Join the community of problem-solvers and everyday innovators building software that people actually want.
      </p>

      {/* Massive Glowing CTA Button */}
      <div className="relative group">
        <div className="absolute -inset-1.5 bg-linear-to-r from-vexed-primary to-vexed-highlight2 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
        <Link 
          to="/app" 
          className="relative flex items-center justify-center px-12 py-5 rounded-xl bg-vexed-bg1 border border-vexed-primary/50 text-white font-bold text-xl transition-all transform hover:-translate-y-1 hover:bg-vexed-primary shadow-2xl"
        >
          Launch Vexed Now
        </Link>
      </div>
    </section>
  )
}