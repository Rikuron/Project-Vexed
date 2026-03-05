import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Vexation, AIAnalysis, VexationFilters } from '../../types'

// Collection References
const vexationsRef = collection(db, 'vexations')

// Create / POST
export async function createVexation(
  formData: { title: string; description: string },
  aiAnalysis: AIAnalysis,
  authorId?: string,
  authorDisplayName?: string,
): Promise<string> {
  const docRef = await addDoc(vexationsRef, {
    title: formData.title,
    description: formData.description,

    // AI-generated fields
    sector: aiAnalysis.sector,
    category: aiAnalysis.category,
    tags: aiAnalysis.tags,
    severity: aiAnalysis.severity,
    summary: aiAnalysis.summary,
    technicalComplexity: aiAnalysis.technicalComplexity,
    keyChallenges: aiAnalysis.keyChallenges ?? [],
    suggestedTechStack: aiAnalysis.suggestedTechStack ?? [],

    // Metadata — anonymous submissions use fallback values
    authorId: authorId ?? 'anonymous',
    authorDisplayName: authorDisplayName ?? 'Anonymous Poster',
    upvotes: 0,
    viewCount: 0,
    commentCount: 0,
    savedBy: [],
    status: 'Analyzed', // Fixing lowercase 'analyzed' to match VexationStatus type
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

// Read (single) / GET 
export async function getVexationById(id: string): Promise<Vexation | null> {
  const docSnap = await getDoc(doc(db, 'vexations', id))

  if (!docSnap.exists()) return null

  return { id: docSnap.id, ...docSnap.data() } as Vexation
}

// Read (list with filters) / GET
export async function getVexations(
  filters: VexationFilters = {}
): Promise<Vexation[]> {
  const constraints = []

  // Filter by sector
  if (filters.sector) {
    constraints.push(where('sector', '==', filters.sector))
  }

  // Filter by complexity
  if (filters.complexity) {
    constraints.push(where('technicalComplexity', '==', filters.complexity))
  }

  // Sort order
  switch (filters.sortBy) {
    case 'upvotes':
      constraints.push(orderBy('upvotes', 'desc'))
      break
    case 'trending':
      constraints.push(orderBy('viewCount', 'desc'))
      break
    case 'newest':
    default:
      constraints.push(orderBy('createdAt', 'desc'))
      break
  }

  // Limit results
  constraints.push(firestoreLimit(filters.limit ?? 20))

  const q = query(vexationsRef, ...constraints)
  const snapshot = await getDocs(q)

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Vexation
  )
}

// Read (user's own vexations) / GET
export async function getUserVexations(userId: string): Promise<Vexation[]> {
  const q = query(
    vexationsRef,
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Vexation
  )
}

// Upvote (atomic increment + prevent duplicates via votes subcollection) / POST
export async function upvoteVexation(
  vexationId: string,
  userId: string
): Promise<boolean> {
  const voteRef = doc(db, 'vexations', vexationId, 'votes', userId)
  const voteSnap = await getDoc(voteRef)

  if (voteSnap.exists()) {
    // Already voted — remove the vote
    await deleteDoc(voteRef)
    await updateDoc(doc(db, 'vexations', vexationId), {
      upvotes: increment(-1),
    })
    return false // vote removed
  }

  // Add vote
  const { setDoc, serverTimestamp: ts } = await import('firebase/firestore')
  await setDoc(voteRef, { createdAt: ts() })
  await updateDoc(doc(db, 'vexations', vexationId), {
    upvotes: increment(1),
  })

  return true // vote added
}

// Check if user has voted / GET
export async function hasUserVoted(
  vexationId: string,
  userId: string
): Promise<boolean> {
  const voteRef = doc(db, 'vexations', vexationId, 'votes', userId)
  const voteSnap = await getDoc(voteRef)
  return voteSnap.exists()
}

// Save / Bookmark toggle / POST
export async function toggleSaveVexation(
  vexationId: string,
  userId: string,
  isSaved: boolean
): Promise<void> {
  const vexRef = doc(db, 'vexations', vexationId)

  await updateDoc(vexRef, {
    savedBy: isSaved ? arrayRemove(userId) : arrayUnion(userId),
  })
}

// Get saved vexations for a user / GET
export async function getSavedVexations(userId: string): Promise<Vexation[]> {
  const q = query(
    vexationsRef,
    where('savedBy', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Vexation
  )
}

// Increment view count / POST
export async function incrementViewCount(vexationId: string): Promise<void> {
  await updateDoc(doc(db, 'vexations', vexationId), {
    viewCount: increment(1),
  })
}
