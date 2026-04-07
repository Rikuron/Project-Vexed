import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { getSolutionById, getVexationById, upvoteSolution, hasUserUpvotedSolution, updateSolution } from '../../lib/db'
import type { Solution, Vexation } from '../../types'
import { useAuth } from '../../lib/auth/AuthContext'
import { 
  Loader2, ArrowLeft, Github, 
  ExternalLink, Calendar, User, 
  Target, ArrowBigUp, Pencil
} from 'lucide-react'
import EditSolutionModal from '../../components/forms/EditSolutionModal'

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
  const { user } = useAuth()
  
  const [solution, setSolution] = useState<Solution | null>(null)
  const [vexation, setVexation] = useState<Vexation | null>(null)
  const [loading, setLoading] = useState(true)

  // Tracking upvotes
  const [upvotes, setUpvotes] = useState(0)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    getSolutionById(id)
      .then(sol => {
        if (sol) {
          setSolution(sol)
          setUpvotes(sol.upvotes || 0) // Initialize upvotes with DB property

          // If the user is logged in, check if they have already liked it
          if (user?.uid) {
            hasUserUpvotedSolution(id, user.uid)
              .then(setHasUpvoted)
              .catch(console.error)
          }

          return getVexationById(sol.vexationId)
        }
        return null
      })
      .then(vex => setVexation(vex))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id, user?.uid])

  const handleUpvote = async () => {
    // Prevent if not signed in, is solver, or an active process is ongoing
    if (!user || user.uid === solution?.solverId || isVoting || !solution) return
    
    setIsVoting(true)
    const previouslyUpvoted = hasUpvoted
    
    // Optimsitic UI changes (appear instant to user)
    setHasUpvoted(!previouslyUpvoted)
    setUpvotes(prev => previouslyUpvoted ? Math.max(0, prev - 1) : prev + 1)

    try {
      const voteStatus = await upvoteSolution(solution.id, user.uid)
      setHasUpvoted(voteStatus)
    } catch (error) {
      console.error('Error upvoting solution:', error)
      // Revert UI on failure
      setHasUpvoted(previouslyUpvoted)
      setUpvotes(prev => previouslyUpvoted ? prev + 1 : Math.max(0, prev - 1))
    } finally {
      setIsVoting(false)
    }
  }

  const handleEditSubmit = async (updates: any) => {
    if (!user || !solution) return

    try {
      await updateSolution(solution.id, user.uid, updates)
      setSolution({
        ...solution,
        ...updates
      })
    } catch (error: any) {
      console.error('Failed to update solution: ', error)
      alert('Failed to update solution. Please try again.')
    }
  }

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
    <div className="min-h-screen bg-vexed-bg2 text-white p-4 sm:p-8 lg:p-12 font-sans">
      <div className="flex items-center justify-between mb-8">
        <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-vexed-dim hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Portfolio
        </Link>

        {user?.uid === solution.solverId && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-vexed-bg1 text-gray-400 border border-slate-700 hover:text-white hover:border-slate-600 px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
          >
            <Pencil size={18} />
            Edit
          </button>
        )}
      </div>

      {/* Header featuring Upvote Button */}
      <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">{solution.title}</h1>
          <p className="text-lg text-vexed-dim leading-relaxed">{solution.description}</p>
        </div>

        <div className="shrink-0 flex flex-col md:items-end gap-2">
          <button
            onClick={handleUpvote}
            disabled={isVoting || user?.uid === solution.solverId || !user}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all w-full md:w-auto ${
              hasUpvoted 
                ? 'bg-vexed-highlight1 text-white shadow-[0_0_15px_rgba(85,60,255,0.4)]' 
                : 'bg-vexed-bg1 text-slate-300 border border-vexed-accent2 hover:bg-white/5'
            } ${
              (!user || user?.uid === solution.solverId) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title={!user ? "Sign in to upvote" : user.uid === solution.solverId ? "You cannot upvote your own solution" : ""}
          >
            <ArrowBigUp size={20} className={hasUpvoted ? 'fill-white' : ''} />
            {upvotes} {upvotes === 1 ? 'Upvote' : 'Upvotes'}
          </button>
          
          {user?.uid === solution.solverId && (
            <p className="text-xs text-vexed-dim font-medium text-center md:text-right">
              You cannot upvote your own solution.
            </p>
          )}
        </div>
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

      {/* Image Gallery */}
      {solution.images && solution.images.length > 0 && (
        <div className="mt-8 border-t border-vexed-accent2 pt-8">
          <h3 className="text-sm font-bold text-vexed-dim uppercase tracking-widest mb-4">Gallery & Screenshots</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {solution.images.map((imgUrl, i) => (
              <a href={imgUrl} target="_blank" rel="noreferrer" key={i} className="shrink-0 snap-center">
                <img 
                  src={imgUrl} 
                  alt={`Screenshot ${i + 1}`} 
                  className="h-48 md:h-64 rounded-xl border border-vexed-accent2 object-cover hover:border-vexed-primary transition-colors cursor-pointer" 
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Edit Solution Modal */}
      {solution && (
        <EditSolutionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          solution={solution}
        />
      )}
    </div>
  )
}