import { Link } from '@tanstack/react-router'
import { Sparkles, Github, ExternalLink, ArrowBigUp } from 'lucide-react'
import type { Solution } from '../../types'

interface PortfolioShowcaseProps {
  solutions: Solution[]
  loading?: boolean
}

const tagColors = ['bg-emerald-500/20 text-emerald-400', 'bg-indigo-500/20 text-indigo-400', 'bg-amber-500/20 text-amber-400']

export default function PortfolioShowcase({ solutions, loading }: PortfolioShowcaseProps) {
  const displaySolutions = solutions.slice(0, 2)

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
      
      {loading ? (
        <div className="p-5 text-sm text-slate-400 bg-[#151320] rounded-xl border border-white/5">Loading solutions...</div>
      ) : displaySolutions.length === 0 ? (
        <div className="p-5 text-sm text-slate-400 bg-[#151320] rounded-xl border border-white/5">No completed solutions yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displaySolutions.map((solution) => (
            <div key={solution.id} className="bg-[#151320] border border-white/5 rounded-xl p-5 hover:border-white/10 hover:bg-white/2 transition-colors flex flex-col group">
              <Link to="/solution/$id" params={{ id: solution.id }} className="flex-1 block cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    {(solution.techStack || []).slice(0, 3).map((tag: string, i: number) => (
                      <span key={tag} className={`px-2 h-7 rounded-md flex items-center justify-center text-[9px] font-bold whitespace-nowrap ${tagColors[i % tagColors.length]}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    <ArrowBigUp size={16} /> {solution.upvotes || 0}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 truncate group-hover:text-[#553CFF] transition-colors">
                  {solution.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                  {solution.description}
                </p>
              </Link>
              
              <div className="flex items-center gap-5 border-t border-white/5 pt-4 mt-auto relative z-10">
                {solution.repositoryUrl && (
                  <a href={solution.repositoryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                    <Github size={14} /> GITHUB
                  </a>
                )}
                {solution.liveUrl && (
                  <a href={solution.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                    <ExternalLink size={14} /> LIVE DEMO
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}