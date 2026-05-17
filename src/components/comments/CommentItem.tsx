import { useState } from 'react'
import { Reply, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { editComment, deleteComment } from '../../lib/db'
import { formatTimeAgo } from '../../lib/utils/formatTimeAgo'
import CommentInput from './CommentInput'
import type { ThreadedComment } from '../../types'

interface CommentItemProps {
  comment: ThreadedComment
  parentType: 'vexations' | 'solutions'
  parentId: string
  parentAuthorId: string
  depth: number
}

const MAX_VISUAL_DEPTH = 3

export default function CommentItem({
  comment,
  parentType,
  parentId,
  parentAuthorId,
  depth
}: CommentItemProps) {
  const { user } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [editLoading, setEditLoading] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const isOwn = user?.uid === comment.authorId
  const visualDepth = Math.min(depth, MAX_VISUAL_DEPTH)

  // Deleted state
  if (comment.isDeleted) {
    const deletedDate = comment.deletedAt?.toDate
      ? comment.deletedAt.toDate().toLocaleString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
          hour: 'numeric', minute: '2-digit'
        })
      : ''

    return (
      <div className={`${visualDepth > 0 ? 'border-l-2 border-vexed-accent2 ml-6 pl-4' : ''}`}>
        <div className="py-3">
          <p className="text-sm text-vexed-dim italic">This comment has been deleted.</p>
          {deletedDate && (
            <p className="text-[10px] text-vexed-dim mt-1">Deleted on {deletedDate}</p>
          )}
        </div>

        {/* Replies still render under deleted shells */}
        {comment.replies.length > 0 && (
          <div className="space-y-3 mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                parentType={parentType}
                parentId={parentId}
                parentAuthorId={parentAuthorId}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Handlers
  async function handleSaveEdit() {
    const trimmed = editContent.trim()
    if (!trimmed || !user || editLoading) return

    setEditLoading(true)
    try {
      await editComment(parentType, parentId, comment.id, trimmed, user.uid)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to edit comment:', err)
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    if (!user || deleteLoading) return
    const confirmed = window.confirm('Delete this comment? It will be shown as removed.')
    if (!confirmed) return

    setDeleteLoading(true)
    try {
      await deleteComment(parentType, parentId, comment.id, user.uid)
    } catch (err) {
      console.error('Failed to delete comment:', err)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className={`${visualDepth > 0 ? 'border-l-2 border-vexed-accent2 ml-6 pl-4' : ''}`}>
      <div className="bg-vexed-bg1 rounded-xl p-4">
        {/* Header: avatar + name + timestamp */}
        <div className="flex items-center gap-3 mb-2">
          {comment.authorPhotoURL ? (
            <img
              src={comment.authorPhotoURL}
              alt={comment.authorDisplayName}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-vexed-accent3 flex items-center justify-center text-vexed-highlight2 text-xs font-bold">
              {comment.authorDisplayName[0]?.toUpperCase() || '?'}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">
              {comment.authorDisplayName}
            </span>
            <span className="text-[11px] text-vexed-dim">
              {formatTimeAgo(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-[10px] text-vexed-dim">(edited)</span>
            )}
          </div>
        </div>

        {/* Body: content or edit mode */}
        {isEditing ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-vexed-highlight2 transition-colors"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setIsEditing(false); setEditContent(comment.content) }}
                className="px-3 py-1.5 text-xs text-vexed-dim hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || editLoading}
                className="px-4 py-1.5 bg-vexed-primary hover:bg-vexed-secondary text-white rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Action row: Reply, Edit, Delete */}
        {!isEditing && (
          <div className="flex items-center gap-3 mt-3">
            {user && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 text-xs text-vexed-dim hover:text-white transition-colors cursor-pointer"
              >
                <Reply size={13} />
                Reply
              </button>
            )}

            {isOwn && (
              <>
                <button
                  onClick={() => { setIsEditing(true); setEditContent(comment.content) }}
                  className="flex items-center gap-1 text-xs text-vexed-dim hover:text-white transition-colors cursor-pointer"
                >
                  <Pencil size={12} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-1 text-xs text-vexed-dim hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Trash2 size={12} />
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Inline reply input */}
      {isReplying && (
        <div className="mt-2 ml-4">
          <CommentInput
            parentType={parentType}
            parentId={parentId}
            parentCommentId={comment.id}
            parentAuthorId={parentAuthorId}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Nested replies (recursive) */}
      {comment.replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              parentType={parentType}
              parentId={parentId}
              parentAuthorId={parentAuthorId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}