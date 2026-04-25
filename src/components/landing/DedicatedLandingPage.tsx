import HeroSection from './HeroSection'
import ValueProposition from './ValueProposition'
import VideoDemoSection from './VideoDemoSection'
import LandingHeader from './LandingHeader'
import LandingCTA from './LandingCTA' // Add this import

export default function DedicatedLandingPage() {
  return (
    <div className="min-h-screen bg-vexed-bg2 text-white flex flex-col items-center relative overflow-hidden">
      
      <LandingHeader />

      {/* Dynamic Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Primary Ambient Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-vexed-primary/20 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
      
      {/* Secondary Accent Glows */}
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-vexed-highlight2/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-vexed-primary/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full pt-16">
        <HeroSection />
        <VideoDemoSection />
        <ValueProposition />
        <LandingCTA /> {/* Inserted here at the bottom */}
      </div>
    </div>
  )
}