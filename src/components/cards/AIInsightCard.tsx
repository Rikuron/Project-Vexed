import { Shield, Cpu, AlertTriangle } from 'lucide-react'
import type { Vexation } from '../../types'

interface AIInsightsCardProps {
  technicalComplexity: Vexation['technicalComplexity']
  suggestedTechStack: string[]
  keyChallenges: string[]
}

// Maps complexity level to a numeric score for the visual bar.
function getComplexityScore(complexity: string): number {
  switch (complexity) {
    case 'Advanced': return 8.5
    case 'Intermediate': return 5.5
    default: return 3.0
  }
}

export default function AIInsightsCard({
  technicalComplexity,
  suggestedTechStack,
  keyChallenges,
}: AIInsightsCardProps) {
  const complexityScore = getComplexityScore(technicalComplexity)

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 bg-slate-800/50 border-b border-slate-700/50">
        <Shield size={18} className="text-indigo-400" />
        <span className="text-sm font-semibold text-white">
          AI Technical Insights
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Complexity Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Complexity Score
            </span>
            <span className="text-2xl font-bold text-white">
              {complexityScore}
              <span className="text-sm font-normal text-gray-500">/10</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${complexityScore * 10}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {technicalComplexity.charAt(0).toUpperCase() +
              technicalComplexity.slice(1)}{' '}
            level difficulty
          </p>
        </div>

        {/* Suggested Tech Stack */}
        {suggestedTechStack.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Suggested Tech Stack
            </h4>
            <div className="space-y-2">
              {suggestedTechStack.map((tech) => (
                <div key={tech} className="flex items-center gap-2 text-sm">
                  <Cpu size={14} className="text-gray-500 shrink-0" />
                  <span className="text-gray-300">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Challenges */}
        {keyChallenges.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Key Challenges
            </h4>
            <ul className="space-y-2">
              {keyChallenges.map((challenge, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-400"
                >
                  <AlertTriangle
                    size={14}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}