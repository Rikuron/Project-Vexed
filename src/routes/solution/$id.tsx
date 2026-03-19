import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getSolutionById, getVexationById } from '../../lib/db'
import type { Solution, Vexation } from '../../types'
import { Loader2, ArrowLeft, Github, ExternalLink, Calendar, User, Target } from 'lucide-react'

export const Route = createFileRoute('/solution/$id')({
  component: SolutionDetailPage,
})

function formatDate(timestamp: any): string {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function SolutionDetailPage() {
  const { id } = Route.useParams()
  const [solution, setSolution] = useState<Solution | null>(null)
  const [vexation, setVexation] = useState<Vexation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getSolutionById(id)
      .then(sol => {
        if (sol) {
          setSolution(sol)
          return getVexationById(sol.vexationId)
        }
        return null
      })
      .then(vex => setVexation(vex))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-vexed-bg2 flex items-center justify-center">
        <Loader2 className="animate-spin text-vexed-primary" size={40} />
      </div>
    )
  }

  if (!solution) {
    return (
      <div className="min-h-screen bg-vexed-bg2 flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold">Solution Not Found</h2>
        <Link to="/portfolio" className="mt-4 text-vexed-primary hover:text-white transition-colors">
          Return to Portfolio
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-vexed-bg2 text-white p-8 lg:p-12 font-sans">
      <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-vexed-dim hover:text-white transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Portfolio
      </Link>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">{solution.title}</h1>
        <p className="text-lg text-vexed-dim leading-relaxed">{solution.description}</p>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-vexed-bg1 border border-vexed-accent2 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-vexed-accent3 rounded-lg text-vexed-highlight2">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs text-vexed-dim uppercase tracking-wider font-semibold mb-1">Developer</p>
            <p className="font-medium">{solution.solverDisplayName}</p>
          </div>
        </div>
        <div className="bg-vexed-bg1 border border-vexed-accent2 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-vexed-accent3 rounded-lg text-vexed-highlight2">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-vexed-dim uppercase tracking-wider font-semibold mb-1">Timeline</p>
            <p className="font-medium text-sm">
              Started: {formatDate(solution.dateStarted)} <br/>
              Submitted: {formatDate(solution.dateSubmitted)}
            </p>
          </div>
        </div>
      </div>

      {/* Original Vexation Reference */}
      {vexation && (
        <div className="bg-linear-to-br from-vexed-bg4 to-vexed-bg1 border border-vexed-accent2 rounded-2xl p-8 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-vexed-highlight2" size={20} />
            <h2 className="text-xl font-bold">Targeted Vexation</h2>
          </div>
          <h3 className="text-lg font-semibold mb-2">{vexation.title}</h3>
          <p className="text-sm text-vexed-dim mb-4 line-clamp-2">{vexation.description}</p>
          <Link to={`/vexation/$id`} params={{ id: vexation.id }} className="text-sm font-semibold text-vexed-primary hover:text-white transition-colors">
            View Original Problem &rarr;
          </Link>
        </div>
      )}

      {/* Links & Tech Stack */}
      <div className="space-y-6">
        {solution.techStack && solution.techStack.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-vexed-dim uppercase tracking-widest mb-3">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {solution.techStack.map(tech => (
                <span key={tech} className="px-3 py-1.5 bg-vexed-bg3 border border-vexed-accent2 rounded-lg text-xs font-semibold text-slate-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4">
          {solution.repositoryUrl && (
            <a href={solution.repositoryUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-vexed-bg1 border border-vexed-accent2 rounded-lg text-sm font-semibold hover:bg-vexed-accent3 transition-colors">
              <Github size={18} /> Source Code
            </a>
          )}
          {solution.liveUrl && (
            <a href={solution.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-vexed-primary hover:bg-vexed-secondary rounded-lg text-sm font-semibold text-white transition-colors">
              <ExternalLink size={18} /> Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  )
}