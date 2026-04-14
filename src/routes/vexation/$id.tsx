import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  ArrowBigUp, Bookmark, Share2,
  MessageSquare, Loader2, Pencil,
  CheckCircle2, XCircle, ShieldCheck
} from 'lucide-react'
import {
  getVexationById,
  upvoteVexation,
  toggleSaveVexation,
  hasUserVoted,
  incrementViewCount,
  claimVexation,
  submitSolution,
  createSolution,
  getSolutionsForVexation,
  updateVexation,
  closeVexation,
  approveSolution
} from '../../lib/db'
import { useAuth } from '../../lib/auth/AuthContext'
import type { Vexation, Solution } from '../../types'
import ClaimedSolversCard from '../../components/cards/ClaimedSolversCard'
import { formatTimeAgo } from '../../lib/utils/formatTimeAgo'
import { SEVERITY_STYLES } from '../../lib/constants/severityStyles'
import AIInsightsCard from '../../components/cards/AIInsightCard'
import DeveloperActionsBar from '../../components/cards/DeveloperActionsBar'
import SubmitSolutionModal from '../../components/forms/SubmitSolutionModal'
import EditVexationModal from '../../components/forms/EditVexationModal'

export const Route = createFileRoute('/vexation/$id')({
  component: VexationDetailPage,
})

function VexationDetailPage() {
  const { id } = Route.useParams()
  const { user, userProfile } = useAuth()

  const [vexation, setVexation] = useState<Vexation | null>(null)
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(true)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [voteLoading, setVoteLoading] = useState(false)
  const [localUpvotes, setLocalUpvotes] = useState(0)
  const [localSaveCount, setLocalSaveCount] = useState(0)
  const [shareTooltip, setShareTooltip] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)
  const [solveLoading, setSolveLoading] = useState(false)
  const [isSubmitSolutionModalOpen, setIsSubmitSolutionModalOpen] = useState(false)
  const [isEditVexationModalOpen, setIsEditVexationModalOpen] = useState(false)
  const [approveLoadingId, setApproveLoadingId] = useState<string | null>(null)
  const [closeLoading, setCloseLoading] = useState(false)
  const viewCountedRef = useRef(false)

  // Fetch vexation data
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getVexationById(id)
        if (data) {
          setVexation(data)
          setLocalUpvotes(data.upvotes)
          setLocalSaveCount(data.savedBy.length)
          setIsSaved(user ? data.savedBy.includes(user.uid) : false)

          const sols = await getSolutionsForVexation(id)
          setSolutions(sols)

          // Increment view count (fire and forget)
          if (!viewCountedRef.current) {
            viewCountedRef.current = true
            incrementViewCount(id).catch(() => {})
          }

          // Check if user has voted
          if (user) {
            const voted = await hasUserVoted(id, user.uid)
            setHasVoted(voted)
          }
        }
      } catch (err) {
        console.error('Failed to load vexation:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, user])

  // Upvote handler
  async function handleUpvote() {
    if (!user || voteLoading) return
    setVoteLoading(true)
    try {
      const added = await upvoteVexation(id, user.uid)
      setHasVoted(added)
      setLocalUpvotes((prev) => (added ? prev + 1 : prev - 1))
    } catch (err) {
      console.error('Upvote failed:', err)
    } finally {
      setVoteLoading(false)
    }
  }

  // Save/bookmark handler
  async function handleSave() {
    if (!user) return
    try {
      await toggleSaveVexation(id, user.uid, isSaved)
      setIsSaved(!isSaved)
      setLocalSaveCount((prev) => (isSaved ? prev - 1 : prev + 1))
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  // Share handler
  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setShareTooltip(true)
    setTimeout(() => setShareTooltip(false), 2000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    )
  }

  // Not found
  if (!vexation) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-2xl font-bold text-white mb-2">Vexation not found</h1>
        <p className="text-gray-400 mb-6">
          This problem may have been removed or doesn't exist.
        </p>
        <Link
          to="/browse"
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← Back to Browse
        </Link>
      </div>
    )
  }

  // Claim handler
  async function handleClaim() {
    if (!user || claimLoading || !vexation) return

    setClaimLoading(true)

    try {
      await claimVexation(vexation.id, user.uid)

      setVexation({
        ...vexation,
        status: 'Claimed',
        claimedByID: [...(vexation.claimedByID || []), user.uid]
      })
    } catch (error) {
      console.error('Failed to claim: ', error)
      alert("Failed to claim vexation. Ensure you're logged in as a Developer.")
    } finally {
      setClaimLoading(false)
    }
  }

  // Solve handler
    function handleSolve() {
    if (!user || !vexation) return
    setIsSubmitSolutionModalOpen(true)
  }

  async function handleModalSubmit(solutionData: any) {
    if (!user || !userProfile || !vexation) return
    setSolveLoading(true)
    
    try {
      // 1. Create the new Solution document
      await createSolution({
        ...solutionData,
        vexationId: vexation.id,
        solverId: user.uid,
        solverDisplayName: userProfile.displayName || 'Anonymous Developer',
      })

      // 2. Update the Vexation document status using the repository/live link
      const primaryUrl = solutionData.repositoryUrl || solutionData.liveUrl || ''
      await submitSolution(vexation.id, user.uid, primaryUrl)

      setVexation({
        ...vexation,
        solutionUrl: [...(vexation.solutionUrl || []), primaryUrl]
      })

      // 3. Refetch
      const refreshedSols = await getSolutionsForVexation(vexation.id)
      setSolutions(refreshedSols)
      
      setIsSubmitSolutionModalOpen(false)
    } catch (error: any) {
      console.error('Failed to save full solution:', error)
      alert(error.message || 'Failed to submit solution. Please try again.')
      throw error
    } finally {
      setSolveLoading(false)
    }
  }

  async function handleEditSubmit(updates: Partial<Vexation>) {
    if (!user || !vexation) return

    try {
      await updateVexation(vexation.id, user.uid, updates)

      setVexation({
        ...vexation,
        ...updates
      })
    } catch (error: any) {
      console.error('Failed to update vexation:', error)
      alert(error.message || 'Failed to update vexation. Please try again.')
    }
  }

  async function handleApproveSolution(solutionId: string) {
    if (!user || !vexation || approveLoadingId) return

    setApproveLoadingId(solutionId)
    try {
      await approveSolution(
        solutionId,
        vexation.id,
        user.uid,
        user.displayName || 'Poster'
      )

      setSolutions((prev) => 
        prev.map((s) => s.id === solutionId ? { ...s, status: 'approved' as const } : s)
      )

      setVexation({
        ...vexation,
        status: 'Solved',
        approvedSolutionIds: [...(vexation.approvedSolutionIds || []), solutionId]
      })
    } catch (error: any) {
      console.error('Failed to approve solution: ', error)
      alert(error.message || 'Failed to approve solution.')
    } finally {
      setApproveLoadingId(null)
    }
  }

  async function handleCloseVexation() {
    if (!user || !vexation || closeLoading) return

    const confirmed = window.confirm('Are you sure you want to close this vexation? It will be removed from the browse page.')
    if (!confirmed) return

    setCloseLoading(true)
    try {
      await closeVexation(vexation.id, user.uid, user.displayName || 'Poster')
      setVexation({ ...vexation, status: 'Closed' })
    } catch (error: any) {
      console.error('Failed to close Vexation: ', error)
      alert(error.message || 'Failed to close vexation.')
    } finally {
      setCloseLoading(false)
    }
  }

  const isSolver = userProfile?.role === 'Solver'
  const isClaimedByMe = user && vexation?.claimedByID?.includes(user.uid)
  const isOwnPost = user?.uid === vexation?.authorId
  const hasSubmittedSolution = !!(user && solutions.some(s => s.solverId === user.uid))

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb + actions bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link to="/browse" className="hover:text-white transition-colors">
              Vexations
            </Link>
            <span>›</span>
            <span className="text-gray-300 truncate max-w-xs">
              {vexation.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Edit Button - appears only for Poster of Vexation */}
            {isOwnPost && (
              <button
                onClick={() => setIsEditVexationModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-vexed-bg1 text-gray-400 border border-slate-700 hover:text-white cursor-pointer hover:border-slate-600 px-3 py-2 text-sm font-medium transition-colors"
                title="Edit Vexation"
              >
                <Pencil size={18} />
              </button>
            )}

            {/* Share */}
            <div className="relative">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-slate-700 text-gray-400 hover:text-white cursor-pointer hover:border-slate-600 transition-colors"
                aria-label="Share"
              >
                <Share2 size={18} />
              </button>
              {shareTooltip && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-emerald-400 whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </div>

            {/* Bookmark */}
            <button
              onClick={handleSave}
              disabled={!user}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors ${
                isSaved
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : 'border-slate-700 text-gray-400 hover:text-white cursor-pointer hover:border-slate-600'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark'}
              title={!user ? 'Sign in to bookmark' : ''}
            >
              <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
              <span className="text-sm font-medium">{localSaveCount}</span>
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-indigo-600/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {vexation.sector}
              </span>
              <span className={`rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${SEVERITY_STYLES[vexation.severity.toLowerCase()]}`}>
                {vexation.severity} impact
              </span>
              <span className="text-xs text-gray-500">
                • Reported by {vexation.authorDisplayName} • {formatTimeAgo(vexation.createdAt)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {vexation.title}
            </h1>

            {/* Description / "The Natural Language Vent" */}
            <div className="relative rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
              <span className="absolute top-4 right-6 text-6xl font-serif text-slate-700/50 leading-none select-none">
                "
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-4">
                The Natural Language Vent
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {vexation.description}
              </p>
            </div>

            {/* Developer Actions */}
            {isSolver && vexation && (
              <DeveloperActionsBar
                status={vexation.status}
                isClaimedByMe={!!isClaimedByMe}
                hasSubmittedSolution={!!hasSubmittedSolution}
                claimLoading={claimLoading}
                solveLoading={solveLoading}
                onClaim={handleClaim}
                onSolve={handleSolve}
              />
            )}

            {/* Poster Actions: Close Vexation */}
            {isOwnPost && vexation.status !== 'Closed' && (
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-vexed-bg1/50 p-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Manage Vexation</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {vexation.status === 'Solved'
                      ? 'This vexation has approved solutions. You can close it when satisfied.'
                      : 'Close this vexation to remove it from the browse page.'}
                  </p>
                </div>
                <button
                  onClick={handleCloseVexation}
                  disabled={closeLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {closeLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Close Vexation
                </button>
              </div>
            )}

            {/* Closed Banner */}
            {vexation.status === 'Closed' && (
              <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-4 text-center">
                <p className="text-sm font-semibold text-slate-400">This vexation has been closed by the poster.</p>
              </div>
            )}

            {/* Display Submitted Solutions */}
            {solutions.length > 0 && (
              <div className="pt-8 mb-6">
                <h3 className="text-xl font-bold text-white mb-6">
                  Submitted Solutions ({solutions.length})
                </h3>
                <div className="space-y-4">
                  {solutions.map((sol) => {
                    const isApproved = sol.status === 'approved'

                    return (
                      <div
                        key={sol.id}
                        className={`p-5 border rounded-xl transition-colors ${
                          isApproved
                            ? 'bg-linear-to-r from-emerald-500/5 to-transparent border-emerald-500/20'
                            : 'bg-linear-to-r from-vexed-bg1 to-transparent border-vexed-accent2'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <Link
                            to="/solution/$id"
                            params={{ id: sol.id }}
                            className="group flex-1 min-w-0"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {isApproved && (
                                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                              )}
                              <h4 className="font-bold text-white group-hover:text-vexed-highlight2 transition-colors truncate">
                                {sol.title}
                              </h4>
                            </div>
                            <p className="text-sm text-vexed-dim line-clamp-2">{sol.description}</p>
                          </Link>

                          <div className="flex items-center gap-2 shrink-0">
                            {isApproved ? (
                              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                                <CheckCircle2 size={12} /> Approved
                              </span>
                            ) : isOwnPost && vexation.status !== 'Closed' ? (
                              <button
                                onClick={() => handleApproveSolution(sol.id)}
                                disabled={approveLoadingId === sol.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {approveLoadingId === sol.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={12} />
                                )}
                                Approve
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-vexed-dim">
                            by {sol.solverDisplayName}
                          </span>
                          <div className="flex items-center gap-2">
                            {sol.techStack?.slice(0, 3).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-1 bg-vexed-bg3 border border-vexed-accent2 text-slate-300 rounded text-[10px] font-bold"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer: upvotes, comments, contact */}
            <div className="flex items-center gap-4 border-t border-slate-700/50 pt-4">
              <button
                onClick={handleUpvote}
                disabled={!user || voteLoading || isOwnPost}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  hasVoted
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 cursor-pointer'
                    : 'bg-slate-800 text-gray-400 border border-slate-700 hover:text-white hover:border-slate-600 cursor-pointer'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={!user ? 'Sign in to upvote' : isOwnPost ? "You can't upvote your own vexation" : ''}
              >
                <ArrowBigUp size={16} fill={hasVoted ? 'currentColor' : 'none'} />
                {localUpvotes}
              </button>

              <span className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare size={16} />
                {vexation.commentCount} Comments
              </span>
            </div>

            {/* Tags */}
            {vexation.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {vexation.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-800 border border-slate-700/50 px-3 py-1 text-xs text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — AI Technical Insights (1/3 width) */}
          <div className="space-y-6">
            {/* AI Insights Card */}
            <AIInsightsCard
              technicalComplexity={vexation.technicalComplexity}
              suggestedTechStack={vexation.suggestedTechStack}
              keyChallenges={vexation.keyChallenges}
            />

            {/* AI Summary Card */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                AI Summary
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {vexation.summary}
              </p>
            </div>

            {/* Claimed Solvers Card */}
            {vexation.claimedByID && vexation.claimedByID.length > 0 && (
              <ClaimedSolversCard claimedByIDs={vexation.claimedByID} />
            )}
          </div>
        </div>

        <SubmitSolutionModal
          isOpen={isSubmitSolutionModalOpen}
          onClose={() => setIsSubmitSolutionModalOpen(false)}
          onSubmit={handleModalSubmit}
        />

        {vexation && (
          <EditVexationModal
            isOpen={isEditVexationModalOpen}
            onClose={() => setIsEditVexationModalOpen(false)}
            vexation={vexation}
            onSubmit={handleEditSubmit}
          />
        )}
      </div>
    </div>
  )
}