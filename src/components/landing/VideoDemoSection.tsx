import { useState, useRef, useEffect } from 'react'

type Tab = 'poster' | 'solver'

export default function VideoDemoSection() {
  const [activeTab, setActiveTab] = useState<Tab>('poster')
  
  const posterVideoRef = useRef<HTMLVideoElement>(null)
  const solverVideoRef = useRef<HTMLVideoElement>(null)

  // This effect handles pausing the inactive video and restarting the active one
  useEffect(() => {
    if (activeTab === 'poster') {
      if (solverVideoRef.current) solverVideoRef.current.pause()
      if (posterVideoRef.current) {
        posterVideoRef.current.currentTime = 0
        posterVideoRef.current.play().catch(() => {})
      }
    } else {
      if (posterVideoRef.current) posterVideoRef.current.pause()
      if (solverVideoRef.current) {
        solverVideoRef.current.currentTime = 0
        solverVideoRef.current.play().catch(() => {})
      }
    }
  }, [activeTab])

  return (
    <section id="demo" className="w-full max-w-6xl mx-auto px-6 py-24 flex flex-col items-center relative z-10">
      <h2 className="text-4xl md:text-5xl font-black text-center mb-6 text-white">
        See how <span className="text-vexed-primary">Vexed</span> works
      </h2>
      <p className="text-xl text-vexed-dim text-center max-w-2xl mb-12">
        Whether you're venting a frustration or building a solution, the process is seamless and entirely transparent.
      </p>

      {/* Interactive Tabs */}
      <div className="flex bg-vexed-bg1 p-1.5 rounded-2xl border border-vexed-accent2 mb-12 shadow-lg">
        <button
          onClick={() => setActiveTab('poster')}
          className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
            activeTab === 'poster' 
              ? 'bg-vexed-accent2 text-white shadow-[0_0_15px_rgba(42,45,61,0.5)]' 
              : 'text-vexed-dim hover:text-white hover:bg-vexed-accent2/50 cursor-pointer'
          }`}
        >
          Poster Experience
        </button>
        <button
          onClick={() => setActiveTab('solver')}
          className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
            activeTab === 'solver' 
              ? 'bg-vexed-primary text-white shadow-[0_0_15px_rgba(26,44,254,0.4)]' 
              : 'text-vexed-dim hover:text-white hover:bg-vexed-accent2/50 cursor-pointer'
          }`}
        >
          Solver Experience
        </button>
      </div>

      {/* Video Display Area - Mock Browser Window */}
      <div className="w-full max-w-5xl bg-vexed-bg1/80 backdrop-blur-md rounded-2xl border border-vexed-accent2 overflow-hidden shadow-[0_30px_60px_-20px_rgba(26,44,254,0.15)] relative">
        
        {/* Stylized Browser Chrome */}
        <div className="flex items-center px-4 py-3 bg-vexed-accent2/40 border-b border-vexed-accent2 backdrop-blur-md">
          <div className="flex gap-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
          </div>
          <div className="flex-1 px-4 py-1.5 bg-vexed-bg2/50 rounded-md border border-vexed-accent2/50 text-center text-xs text-vexed-dim font-mono tracking-wide max-w-md mx-auto">
            {activeTab === 'poster' ? 'app.vexed.com/submit' : 'app.vexed.com/browse'}
          </div>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>

        {/* The Videos */}
        <div className="relative bg-vexed-bg2 w-full overflow-hidden">
          <video 
            ref={posterVideoRef}
            muted 
            loop 
            playsInline
            className={`w-full h-auto block transition-opacity duration-700 ${
              activeTab === 'poster' 
                ? 'opacity-100 relative z-10' 
                : 'opacity-0 absolute top-0 left-0 z-0 pointer-events-none'
            }`}
          >
            <source src="/videos/poster_flow.webm" type="video/webm" />
            <source src="/videos/poster_flow.mp4" type="video/mp4" />
          </video>
          
          <video 
            ref={solverVideoRef}
            muted 
            loop 
            playsInline
            className={`w-full h-auto block transition-opacity duration-700 ${
              activeTab === 'solver' 
                ? 'opacity-100 relative z-10' 
                : 'opacity-0 absolute top-0 left-0 z-0 pointer-events-none'
            }`}
          >
            <source src="/videos/solver_flow.webm" type="video/webm" />
            <source src="/videos/solver_flow.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  )
}