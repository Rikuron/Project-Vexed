import type { VexationStatus } from '../../types'

interface DeveloperActionsBarProps {
  status: VexationStatus
  isClaimedByMe: boolean
  claimLoading: boolean
  solveLoading: boolean
  onClaim: () => void
  onSolve: () => void
}

export default function DeveloperActionsBar({
  status,
  isClaimedByMe,
  claimLoading,
  solveLoading,
  onClaim,
  onSolve,
}: DeveloperActionsBarProps) {
  return (
    <div className="flex bg-slate-800/50 rounded-lg p-4 mb-4 border border-indigo-500/20 items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-white">Developer Actions</h3>
        <p className="text-xs text-gray-400">
          {status === 'Solved'
            ? 'This vexation has been solved!'
            : isClaimedByMe
              ? 'You have claimed this task. Ready to submit?'
              : 'Take ownership and start building a solution.'}
        </p>
      </div>

      {status !== 'Solved' && (
        <div>
          {!isClaimedByMe && ['analyzed', 'pending'].includes(status.toLowerCase()) && (
            <button
              onClick={onClaim}
              disabled={claimLoading}
              className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {claimLoading ? 'Claiming...' : 'Claim Vexation'}
            </button>
          )}

          {isClaimedByMe && (
            <button
              onClick={onSolve}
              disabled={solveLoading}
              className="bg-emerald-600 cursor-pointer hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {solveLoading ? 'Submitting...' : 'Submit Solution'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}