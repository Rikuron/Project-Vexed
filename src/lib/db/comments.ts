import {
  collection, doc, addDoc, getDoc, updateDoc,
  query, orderBy, onSnapshot, serverTimestamp,
  increment, type Unsubscribe, collectionGroup,
  where, getDocs, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'
import { logActivity } from './activities'
import type { Comment } from '../../types'

type ParentType = 'vexations' | 'solutions'

/**
 * Returns a reference to the commens subcollection under a parent document.
 * Path: `{parentType}/{parentId}/comments`
 */
function commentsRef(
  parentType: ParentType,
  parentId: string
) {
  return collection(db, parentType, parentId, 'comments')
}

export function subscribeToComments(
  parentType: ParentType,
  parentId: string,
  onData: (comments: Comment[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    commentsRef(parentType, parentId),
    orderBy('createdAt', 'asc')
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const comments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment)
      onData(comments)
    },
    (error) => {
      console.error('Comment subscription error:', error)
      onError?.(error)
    }
  )
}

// Add comment / POST
export async function addComment(
  parentType: ParentType,
  parentId: string,
  data: {
    authorId: string
    authorDisplayName: string
    authorPhotoURL?: string | null
    content: string
    parentCommentId: string | null
  },
  parentAuthorId: string
): Promise<string> {
  // 1. Write comment doc to subcollection
  const docRef = await addDoc(commentsRef(parentType, parentId), {
    authorId: data.authorId,
    authorDisplayName: data.authorDisplayName,
    authorPhotoURL: data.authorPhotoURL ?? null,
    content: data.content,
    parentCommentId: data.parentCommentId,
    isEdited: false,
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // 2. Atomically increment commentCount on the parent document
  const parentRef = doc(db, parentType, parentId)
  await updateDoc(parentRef, { commentCount: increment(1) })

  // 3. Log activity (notifications)
  if (data.authorId !== parentAuthorId) {
    const activityType = parentType === 'vexations'
      ? 'COMMENT_VEXATION' as const
      : 'COMMENT_SOLUTION' as const

    // Fetch parent doc to get the title for the activity entry
    const parentSnap = await getDoc(parentRef)
    const parentData = parentSnap.data()
    const targetTitle = parentData?.title || 'Unknown'

    await logActivity({
      ownerId: parentAuthorId,
      actorId: data.authorId,
      actorName: data.authorDisplayName,
      type: activityType,
      targetId: parentId,
      targetTitle
    })
  }

  return docRef.id
}

// Edit comment / PUT
export async function editComment(
  parentType: ParentType,
  parentId: string,
  commentId: string,
  newContent: string,
  authorId: string
): Promise<void> {
  const commentRef = doc(db, parentType, parentId, 'comments', commentId)
  const commentSnap = await getDoc(commentRef)

  if (!commentSnap.exists()) throw new Error('Comment not found')
  if (commentSnap.data()?.authorId !== authorId) throw new Error('Unauthorized')

  await updateDoc(commentRef, {
    content: newContent,
    isEdited: true,
    updatedAt: serverTimestamp()
  })
}

export async function updateCommentAuthorInfo(
  userId: string,
  newDisplayName: string,
  newPhotoURL: string | null
): Promise<void> {
  const commentsGroup = collectionGroup(db, 'comments')
  const q = query(commentsGroup, where('authorId', '==', userId))
  const snapshot = await getDocs(q)

  if (snapshot.empty) return

  // Batch update all comments by this user
  const batch = writeBatch(db)
  for (const docSnap of snapshot.docs) {
    batch.update(docSnap.ref, {
      authorDisplayName: newDisplayName,
      authorPhotoURL: newPhotoURL
    })
  }
  
  await batch.commit()
}

// Delete comment recursively (including replies) / DELETE
export async function deleteComment(
  parentType: ParentType,
  parentId: string,
  commentId: string,
  authorId: string
): Promise<void> {
  const commentRef = doc(db, parentType, parentId, 'comments', commentId)
  const commentSnap = await getDoc(commentRef)

  if (!commentSnap.exists()) throw new Error('Comment not found')
  if (commentSnap.data()?.authorId !== authorId) throw new Error('Unauthorized')

  // Soft-delete: content & author hidden, shell remains for thread continuity
  await updateDoc(commentRef, {
    isDeleted: true,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  // Decrement the parent's commentCount
  const parentRef = doc(db, parentType, parentId)
  await updateDoc(parentRef, { commentCount: increment(-1) })
}