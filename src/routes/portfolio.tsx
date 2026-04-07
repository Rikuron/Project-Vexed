import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Rocket, ExternalLink, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { getClaimedVexations, getSolutionsBySolver } from '../lib/db'
import { useAuth } from '../lib/auth/AuthContext'
import type { Vexation, Solution } from '../types'

export const Route = createFileRoute('/portfolio')({
  component: PortfolioPage,
})

function formatDate(timestamp: any): string {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function PortfolioPage() {
  const { user, loading: authLoading } = useAuth()
  const [activeProjects, setActiveProjects] = useState<Vexation[]>([])
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      getClaimedVexations(user.uid),
      getSolutionsBySolver(user.uid) // Completed solutions
    ])
      .then(([vexationsData, solutionsData]) => {
        // Active projects are claimed but not yet solved
        setActiveProjects(vexationsData.filter(v => v.status === 'Claimed'))
        setSolutions(solutionsData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-vexed-bg2 flex items-center justify-center">
        <Loader2 className="animate-spin text-vexed-primary" size={40} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-vexed-bg2 flex flex-col items-center justify-center text-white px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Sign in to view your portfolio</h1>
        <p className="text-slate-400">Showcase your contributions and tracked problem-solving.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vexed-bg2 text-white p-4 sm:p-8 lg:p-12 font-sans">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">Portfolio</h1>
        <p className="text-base text-vexed-dim mb-10 max-w-2xl leading-relaxed">
          Showcase of my technical contributions, architecture designs, and validated problem-solving within the Vexed ecosystem.
        </p>

        <div className="flex flex-wrap gap-4 mb-16">
          <div className="flex items-center gap-2 px-4 py-2 border border-emerald-500/20 bg-emerald-500/10 rounded-full text-xs font-semibold text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div> Available for Claims
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border border-vexed-accent2 bg-vexed-bg1 rounded-full text-xs font-semibold text-slate-300">
            <span className="text-vexed-primary">{solutions.length}</span> Problems Solved
          </div>
        </div>

        {/* Active Projects Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2.5">
              <Rocket className="text-vexed-primary" size={22} /> Active Projects
            </h2>
          </div>
          
          {activeProjects.length === 0 ? (
            <div className="bg-vexed-bg1 border border-vexed-accent2 rounded-2xl p-10 py-16 text-center text-vexed-dim">
              You don't have any active projects right now. Start solving!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProjects.map((project) => (
                <div key={project.id} className="bg-vexed-bg1 border border-vexed-accent2 rounded-2xl overflow-hidden group">
                  <div className="h-32 sm:h-44 bg-vexed-bg4 p-6 relative flex items-center justify-center border-b border-vexed-accent2">
                    <div className="w-[80%] h-16 bg-white/5 rounded-lg"></div>
                  </div>
                  <div className="p-7">
                    <h3 className="text-xl font-bold mb-2.5 text-white">{project.title}</h3>
                    <p className="text-sm text-vexed-dim mb-6 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                    {project.suggestedTechStack && project.suggestedTechStack.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-8">
                        {project.suggestedTechStack.slice(0,3).map(tech => (
                          <span key={tech} className="px-2 py-1 bg-vexed-highlight1/20 text-vexed-highlight2 text-[10px] font-bold rounded tracking-wider uppercase">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-6 border-t border-vexed-accent2 pt-5">
                      <Link to={`/vexation/$id`} params={{ id: project.id }} className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                        <ExternalLink size={16}/> View Vexation
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Solved Problems Section (Solutions) */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2.5">
              <CheckCircle2 className="text-vexed-primary" size={22} /> Completed Solutions
            </h2>
          </div>
          
          <div className="space-y-4">
            {solutions.length === 0 ? (
              <div className="bg-vexed-bg1 border border-vexed-accent2 rounded-xl p-8 text-center text-vexed-dim">
                No solutions submitted yet.
              </div>
            ) : (
              solutions.map((solution) => (
                <Link 
                  to={`/solution/$id`} 
                  params={{ id: solution.id }} 
                  key={solution.id} 
                  className="bg-linear-to-r from-vexed-bg1 to-transparent border border-vexed-accent2 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hover:border-vexed-highlight1/50 transition-colors"
                >
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-base font-bold text-white group-hover:text-vexed-highlight2 transition-colors">{solution.title}</h3>
                      <span className="px-2.5 py-0.5 bg-vexed-bg3 rounded font-bold text-[10px] text-slate-300 border border-vexed-accent2">RESOLVED</span>
                    </div>
                    <p className="text-sm text-vexed-dim line-clamp-1">{solution.description}</p>
                  </div>
                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <div className="text-right flex items-center gap-1.5 font-bold text-vexed-primary bg-vexed-primary/10 px-3 py-1 rounded-md">
                      <span className="text-[12px]">{formatDate(solution.dateSubmitted)}</span>
                    </div>
                    {solution.techStack && solution.techStack.length > 0 && (
                      <div className="items-center gap-2 hidden md:flex">
                        {solution.techStack.slice(0,2).map(tech => (
                          <span key={tech} className="px-2 py-1 bg-vexed-bg3 border border-vexed-accent2 text-slate-300 rounded text-[10px] font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}