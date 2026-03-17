import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { getUserProfile } from '../../lib/db'

interface ClaimedSolversCardProps {
  claimedByIDs: string[]
}

// Truncate a display name to the first word only.
function truncateName(displayName: string | null): string {
  if (!displayName) return 'Unknown'
  return displayName.split(' ')[0]
}

export default function ClaimedSolversCard({ claimedByIDs }: ClaimedSolversCardProps) {
  const [displayNames, setDisplayNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNames() {
      setLoading(true)
      try {
        const profiles = await Promise.all(
          claimedByIDs.map((uid) => getUserProfile(uid))
        )
        setDisplayNames(
          profiles.map((p) => p?.displayName ?? 'Unknown')
        )
      } catch (err) {
        console.error('Failed to fetch claimant names:', err)
        setDisplayNames(claimedByIDs.map(() => 'Unknown'))
      } finally {
        setLoading(false)
      }
    }

    if (claimedByIDs.length > 0) {
      fetchNames()
    } else {
      setLoading(false)
    }
  }, [claimedByIDs])

  if (loading || claimedByIDs.length === 0) return null

  const MAX_VISIBLE = 3
  const visibleNames = displayNames.slice(0, MAX_VISIBLE)
  const hasMore = displayNames.length > MAX_VISIBLE
  const allFullNames = displayNames.join(', ')

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-indigo-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Claimed By
        </h4>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {visibleNames.map((name, i) => (
          <span
            key={i}
            className="rounded-md bg-indigo-600/15 border border-indigo-500/20 px-2.5 py-1 text-xs font-medium text-indigo-300"
            title={displayNames[i]}
          >
            {truncateName(name)}
          </span>
        ))}
        {hasMore && (
          <span
            className="text-xs text-gray-400 cursor-default"
            title={allFullNames}
          >
            , and {displayNames.length - MAX_VISIBLE} more
          </span>
        )}
      </div>
    </div>
  )
}
