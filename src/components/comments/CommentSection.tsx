import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { subscribeToComments } from '../../lib/db'
import type { Comment, ThreadedComment } from '../../types'
import CommentInput from './CommentInput'
import CommentItem from './CommentItem'

interface CommentSectionProps {
  parentType: 'vexations' | 'solutions'
  parentId: string
  parentAuthorId: string
}

const PAGE_SIZE = 10

/**
 * Builds a threaded tree from a flat array of comments.
 * Top-level comments have `parentCommentId === null`.
 * Replies are grouped under their parent.
 */
function buildThreadTree(flatComments: Comment[]): ThreadedComment[] {
  const map = new Map<string, ThreadedComment>()
  const roots: ThreadedComment[] = []

  // Initialize every comment with an empty replies array
  for (const c of flatComments) {
    map.set(c.id, { ...c, replies: [] })
  }

  // Link children to parents
  for (const c of flatComments) {
    const node = map.get(c.id)!
    if (c.parentCommentId && map.has(c.parentCommentId)) {
      map.get(c.parentCommentId)!.replies.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export default function CommentSection({
  parentType,
  parentId,
  parentAuthorId
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Real-time subscription
  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToComments(
      parentType,
      parentId,
      (data) => {
        setComments(data)
        setLoading(false)
      },
      (error) => {
        console.error('Comment subscription failed:', error)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [parentType, parentId])

  // Build threaded tree from flat data
  const threads = buildThreadTree(comments)
  const totalTopLevel = threads.length
  const visibleThreads = threads.slice(0, visibleCount)
  const hasMore = visibleCount < totalTopLevel

  return (
    <div className="mt-8 border-t border-slate-700/50 pt-8">
      {/* Header */}
      <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
        <MessageSquare size={20} className="text-vexed-highlight2" />
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>

      {/* New top-level comment input */}
      <div className="mb-6">
        <CommentInput
          parentType={parentType}
          parentId={parentId}
          parentAuthorId={parentAuthorId}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <p className="text-sm text-vexed-dim py-4">Loading comments...</p>
      )}

      {/* Comment threads */}
      {!loading && (
        <div className="space-y-4">
          {visibleThreads.map((thread) => (
            <CommentItem
              key={thread.id}
              comment={thread}
              parentType={parentType}
              parentId={parentId}
              parentAuthorId={parentAuthorId}
              depth={0}
            />
          ))}

          {/* Empty state */}
          {totalTopLevel === 0 && (
            <p className="text-sm text-vexed-dim text-center py-6">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}

          {/* Load More */}
          {hasMore && (
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="w-full py-2.5 text-sm font-medium text-vexed-highlight2 hover:text-white border border-vexed-accent2 rounded-lg hover:border-vexed-highlight2 transition-colors cursor-pointer"
            >
              Load More ({totalTopLevel - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  )
}