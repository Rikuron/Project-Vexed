import type { Timestamp } from 'firebase/firestore'

export interface Comment {
  id: string
  authorId: string
  authorDisplayName: string
  authorPhotoURL?: string | null
  content: string
  parentCommentId: string | null // null for top-level comments
  isEdited: boolean
  isDeleted: boolean

  deletedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ThreadedComment extends Comment {
  replies: ThreadedComment[]
}