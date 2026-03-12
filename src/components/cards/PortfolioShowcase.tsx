import { Link } from '@tanstack/react-router'
import { Sparkles, Github, ExternalLink } from 'lucide-react'

interface ShowcaseProject {
  name: string
  description: string
  techTags: string[]
  stars: number
}

const MOCK_SHOWCASE: ShowcaseProject[] = [
  {
    name: 'StateSync Engine',
    description: 'Reactive state management solution with zero-latency synchronization.',
    techTags: ['TS', 'RE'],
    stars: 48,
  },
  {
    name: 'PixelShader Core',
    description: 'WebAssembly-powered shader compiler for real-time visual...',
    techTags: ['RS', 'WA'],
    stars: 122,
  },
]
const tagColors = ['bg-emerald-500/20 text-emerald-400', 'bg-indigo-500/20 text-indigo-400', 'bg-amber-500/20 text-amber-400']
export default function PortfolioShowcase() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="text-[#553CFF]" size={20} /> Portfolio Showcase
        </h2>
        <Link to="/portfolio" className="text-[#553CFF] text-sm font-semibold hover:text-white transition-colors">
          Manage portfolio
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_SHOWCASE.map((project) => (
          <div key={project.name} className="bg-[#151320] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
            {/* Top row: tags + stars */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                {project.techTags.map((tag, i) => (
                  <span key={tag} className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold ${tagColors[i % tagColors.length]}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-sm text-slate-400 flex items-center gap-1">
                ⭐ {project.stars}
              </span>
            </div>
            {/* Title + desc */}
            <h3 className="text-base font-bold text-white mb-1.5">{project.name}</h3>
            <p className="text-sm text-slate-400 line-clamp-2 mb-5 leading-relaxed">{project.description}</p>
            {/* Bottom links */}
            <div className="flex items-center gap-5 border-t border-white/5 pt-4">
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                <Github size={14} /> GITHUB
              </button>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                <ExternalLink size={14} /> LIVE DEMO
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}