import { useState } from 'react'
import { Send } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { addComment } from '../../lib/db'

interface CommentInputProps {
  parentType: 'vexations' | 'solutions'
  parentId: string
  parentCommentId?: string | null
  parentAuthorId: string
  onCancel?: () => void
  placeholder?: string
}

export default function CommentInput({
  parentType,
  parentId,
  parentCommentId = null,
  parentAuthorId,
  onCancel,
  placeholder
}: CommentInputProps) {
  const { user, userProfile } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isReply = parentCommentId !== null

  // Unauthenticated guard
  if (!user || !userProfile) {
    return (
      <p className="text-sm text-vexed-dim italic py-3">
        Sign in to {isReply ? 'reply' : 'comment'}.
      </p>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed || submitting || !user || !userProfile) return

    setSubmitting(true)
    try {
      await addComment(
        parentType,
        parentId,
        {
          authorId: user.uid,
          authorDisplayName: userProfile.displayName || 'Anonymous',
          authorPhotoURL: userProfile.photoURL ?? null,
          content: trimmed,
          parentCommentId
        },
        parentAuthorId
      )
      setContent('')
      onCancel?.() // Close reply input after posting
    } catch (err) {
      console.error('Failed to post comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      {/* Avatar */}
      {userProfile.photoURL ? (
        <img
          src={userProfile.photoURL}
          alt={userProfile.displayName || 'User'}
          className={`rounded-full object-cover shrink-0 ${isReply ? 'w-7 h-7' : 'w-9 h-9'}`}
        />
      ) : (
        <div className={`rounded-full bg-vexed-accent3 flex items-center justify-center text-vexed-highlight2 font-bold shrink-0 ${isReply ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'}`}>
          {(userProfile.displayName || '?')[0].toUpperCase()}
        </div>
      )}

      {/* Input area */}
      <div className="flex-1 space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || (isReply ? 'Write a reply...' : 'Add a comment...')}
          rows={isReply ? 2 : 3}
          className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-3 text-sm text-white placeholder-vexed-dim resize-none focus:outline-none focus:border-vexed-highlight2 transition-colors"
        />

        <div className="flex items-center justify-end gap-2">
          {isReply && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-vexed-dim hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-vexed-primary hover:bg-vexed-secondary text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            {submitting ? 'Posting...' : isReply ? 'Reply' : 'Comment'}
          </button>
        </div>
      </div>
    </form>
  )
}