import { createFileRoute } from '@tanstack/react-router'
import { Rocket, Github, ExternalLink, CheckCircle2, ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/portfolio')({
  component: PortfolioPage,
})

function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#0b0914] text-white p-8 lg:p-12 font-sans">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Portfolio</h1>
        <p className="text-base text-slate-400 mb-10 max-w-2xl leading-relaxed">
          Showcase of my technical contributions, architecture designs, and validated problem-solving within the Vexed ecosystem.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <div className="flex items-center gap-2 px-4 py-2 border border-emerald-500/20 bg-emerald-500/10 rounded-full text-xs font-semibold text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div> Available for Claims
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-white/5 bg-[#151320] rounded-full text-xs font-semibold text-slate-300">
            <span className="text-[#553CFF]">42</span> Problems Solved
          </div>
        </div>

        {/* Active Projects Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2.5">
              <Rocket className="text-[#553CFF]" size={22} /> Active Projects
            </h2>
            <button className="text-[#553CFF] text-sm font-semibold hover:text-white transition-colors">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Project Card 1 */}
            <div className="bg-[#151320] border border-white/5 rounded-2xl overflow-hidden group">
              <div className="h-44 bg-linear-to-br from-[#2D6A4F] to-[#1B4332] p-6 relative flex items-center justify-center">
                {/* Visual representation placeholder */}
                <div className="w-[80%] h-16 bg-white/10 rounded-lg blur-sm"></div>
              </div>
              <div className="p-7">
                <h3 className="text-xl font-bold mb-2.5 text-white">Vexed Analytics Engine</h3>
                <p className="text-sm text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                  A high-performance telemetry processing pipeline designed for sub-millisecond data validation and real-time fraud detection.
                </p>
                <div className="flex items-center gap-2 mb-8">
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded tracking-wider uppercase">RUST</span>
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded tracking-wider uppercase">GRAPHQL</span>
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded tracking-wider uppercase">POSTGRESQL</span>
                </div>
                <div className="flex items-center gap-6 border-t border-white/5 pt-5">
                  <button className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"><Github size={16}/> GitHub</button>
                  <button className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"><ExternalLink size={16}/> Live Demo</button>
                </div>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="bg-[#151320] border border-white/5 rounded-2xl overflow-hidden group">
              <div className="h-44 bg-linear-to-br from-[#1E5C6B] to-[#0A2635] p-6 relative flex items-center justify-center">
                {/* Visual representation placeholder */}
                <div className="w-[80%] h-16 bg-white/10 rounded-lg blur-sm"></div>
              </div>
              <div className="p-7">
                <h3 className="text-xl font-bold mb-2.5 text-white">Distributed Task Scheduler</h3>
                <p className="text-sm text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                  Scalable microservice architecture for background job orchestration, managing millions of concurrent tasks across multiple clusters.
                </p>
                <div className="flex items-center gap-2 mb-8">
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded tracking-wider uppercase">GO</span>
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded tracking-wider uppercase">REDIS</span>
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-bold rounded tracking-wider uppercase">KUBERNETES</span>
                </div>
                <div className="flex items-center gap-6 border-t border-white/5 pt-5">
                  <button className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"><Github size={16}/> GitHub</button>
                  <button className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"><ExternalLink size={16}/> Live Demo</button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Solved Problems Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2.5">
              <CheckCircle2 className="text-[#553CFF]" size={22} /> Solved Problems
            </h2>
            <button className="text-[#553CFF] text-sm font-semibold hover:text-white transition-colors">View Archive</button>
          </div>
          
          <div className="space-y-4">
            
            <div className="bg-linear-to-r from-[#151320] to-transparent border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-colors">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">Optimizing Node.js Garbage Collection for High-Traffic APIs</h3>
                  <span className="px-2.5 py-0.5 bg-slate-800 rounded font-bold text-[10px] text-slate-300 border border-white/5">RESOLVED</span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-1">Reduced latency spikes by 40% using heap analysis and V8 flag tuning for the core payment gateway.</p>
              </div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="text-right flex items-center gap-1.5 font-bold text-[#553CFF] bg-[#553CFF]/10 px-3 py-1 rounded-md">
                  <span className="font-serif text-[10px]">₿</span> 0.45 BTC
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-800 border border-white/5 text-slate-300 rounded text-[10px] font-bold">Node.js</span>
                  <span className="px-2 py-1 bg-slate-800 border border-white/5 text-slate-300 rounded text-[10px] font-bold">V8</span>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
              </div>
            </div>

            <div className="bg-linear-to-r from-[#151320] to-transparent border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-colors">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">Implementing Zero-Knowledge Proofs for User Identity</h3>
                  <span className="px-2.5 py-0.5 bg-slate-800 rounded font-bold text-[10px] text-slate-300 border border-white/5">RESOLVED</span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-1">Engineered a privacy-preserving authentication module using zk-SNARKs for the decentralized identity hub.</p>
              </div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="text-right flex items-center gap-1.5 font-bold text-[#553CFF] bg-[#553CFF]/10 px-3 py-1 rounded-md">
                  <span className="font-serif text-[10px]">₿</span> 1.20 BTC
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-800 border border-white/5 text-slate-300 rounded text-[10px] font-bold">Cryptography</span>
                  <span className="px-2 py-1 bg-slate-800 border border-white/5 text-slate-300 rounded text-[10px] font-bold">Solidity</span>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
              </div>
            </div>

            <div className="bg-linear-to-r from-[#151320] to-transparent border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hover:border-indigo-500/30 transition-colors">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">Race Condition in Distributed Order Book</h3>
                  <span className="px-2.5 py-0.5 bg-slate-800 rounded font-bold text-[10px] text-slate-300 border border-white/5">RESOLVED</span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-1">Fixed critical race condition in concurrent order matching using lock-free data structures and CAS operations.</p>
              </div>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="text-right flex items-center gap-1.5 font-bold text-[#553CFF] bg-[#553CFF]/10 px-3 py-1 rounded-md">
                  <span className="font-serif text-[10px]">₿</span> 0.75 BTC
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-800 border border-white/5 text-slate-300 rounded text-[10px] font-bold">C++</span>
                  <span className="px-2 py-1 bg-slate-800 border border-white/5 text-slate-300 rounded text-[10px] font-bold">Distributed Systems</span>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
