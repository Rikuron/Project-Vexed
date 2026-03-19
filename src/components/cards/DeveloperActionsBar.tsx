import type { VexationStatus } from '../../types'
import { CheckCircle2 } from 'lucide-react'

interface DeveloperActionsBarProps {
  status: VexationStatus
  isClaimedByMe: boolean
  hasSubmittedSolution: boolean
  claimLoading: boolean
  solveLoading: boolean
  onClaim: () => void
  onSolve: () => void
}

export default function DeveloperActionsBar({
  status,
  isClaimedByMe,
  hasSubmittedSolution,
  claimLoading,
  solveLoading,
  onClaim,
  onSolve,
}: DeveloperActionsBarProps) {
  
  // If the user HAS personally submitted a solution
  if (hasSubmittedSolution) {
    return (
      <div className="flex bg-emerald-500/10 rounded-lg p-4 mb-4 border border-emerald-500/30 items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" size={24} />
          <div>
            <h3 className="text-sm font-semibold text-emerald-400">Solution Published</h3>
            <p className="text-xs text-emerald-500/80">You have successfully submitted a solution for this problem!</p>
          </div>
        </div>
      </div>
    )
  }
  // Otherwise, show the Claim/Submit interface regardless if there's already a solution by someone else
  return (
    <div className="flex bg-vexed-bg1 rounded-lg p-4 mb-4 border border-vexed-highlight2/30 items-center justify-between">
      <div>
        <h3 className="text-sm font-bold text-white">Developer Actions</h3>
        <p className="text-xs text-vexed-dim">
          {status === 'Closed'
            ? 'This vexation has been closed.'
            : isClaimedByMe
              ? 'You have claimed this task. Ready to submit?'
              : 'Take ownership and start building a solution.'}
        </p>
      </div>
      {status !== 'Closed' && (
        <div>
          {!isClaimedByMe && (
            <button
              onClick={onClaim}
              disabled={claimLoading}
              className="bg-vexed-primary hover:bg-vexed-secondary cursor-pointer text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {claimLoading ? 'Claiming...' : 'Claim Vexation'}
            </button>
          )}
          {isClaimedByMe && (
            <button
              onClick={onSolve}
              disabled={solveLoading}
              className="bg-emerald-600 cursor-pointer hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {solveLoading ? 'Submitting...' : 'Submit Solution'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}