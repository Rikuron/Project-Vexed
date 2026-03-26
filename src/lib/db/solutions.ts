import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Solution } from '../../types'
import { logActivity } from './activities'

const solutionsRef = collection(db, 'solutions')

// Create a new solution
export async function createSolution(
  solutionData: Omit<Solution, 'id' | 'dateSubmitted'>
): Promise<String> {
  // Check if Solver already submitted to this exact Vexation
  const solverCheckQuery = query(
    solutionsRef,
    where('vexationId', '==', solutionData.vexationId),
    where('solverId', '==', solutionData.solverId)
  )
  const solverCheckSnapshot = await getDocs(solverCheckQuery)
  if (!solverCheckSnapshot.empty) throw new Error('You have already submitted a solution for this Vexation.')

  // Prevent submission of same Solution for this Vexation
  if (solutionData.repositoryUrl) {
    const uniqueSolutionCheckQuery = query(
      solutionsRef,
      where('vexationId', '==', solutionData.vexationId),
      where('repositoryUrl', '==', solutionData.repositoryUrl)
    )
    const uniqueSolutionCheckSnapshot = await getDocs(uniqueSolutionCheckQuery)

    if (!uniqueSolutionCheckSnapshot.empty) throw new Error('This Solution has already been submitted for this Vexation.')
  }
  
  const docRef = await addDoc(solutionsRef, {
    ...solutionData,
    dateSubmitted: serverTimestamp(),
  })

  return docRef.id
}

// Get solution by ID
export async function getSolutionById(id: string): Promise<Solution | null> {
  const docSnap = await getDoc(doc(db, 'solutions', id))

  if (!docSnap.exists()) return null

  return { id: docSnap.id, ...docSnap.data() } as Solution
}

// Get solutions by Solver
export async function getSolutionsBySolver(solverId: string): Promise<Solution[]> {
  try {
    const q = query(
      solutionsRef,
      where('solverId', '==', solverId),
      orderBy('dateSubmitted', 'desc')
    )

    const snapshot = await getDocs(q)

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Solution)
  } catch (error: any) {
    console.error('Error fetching solutions: ', error)
    return []
  }
}

// Fetch all solutions for a specific Vexation ID
export async function getSolutionsForVexation(vexationId: string): Promise<Solution[]> {
  try {
    const q = query(
      solutionsRef,
      where('vexationId', '==', vexationId)
    )
    const snapshot = await getDocs(q)
    const solutions = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Solution
    )
    
    // Sort in-memory (newest first)
    return solutions.sort((a, b) => {
      const timeA = a.dateSubmitted?.toMillis() || 0
      const timeB = b.dateSubmitted?.toMillis() || 0
      return timeB - timeA
    })
  } catch (error: any) {
    console.error('Error fetching vexation solutions:', error)
    return []
  }
}

// Upvote
export async function upvoteSolution(
  solutionId: string,
  userId: string
): Promise<boolean> {
  const voteRef = doc(db, 'solutions', solutionId, 'votes', userId)
  const voteSnap = await getDoc(voteRef)

  if (voteSnap.exists()) {
    await deleteDoc(voteRef)
    await updateDoc(doc(db, 'solutions', solutionId), {
      upvotes: increment(-1)
    })
    return false
  }

  const { setDoc, serverTimestamp: ts } = await import('firebase/firestore')
  await setDoc(voteRef, { createdAt: ts() })
  
  const solutionSnap = await getDoc(doc(db, 'solutions', solutionId))
  const solutionData = solutionSnap.data()

  if (solutionData) {
    await updateDoc(doc(db, 'solutions', solutionId), {
      upvotes: increment(1)
    })

    // Log what solver did
    await logActivity({
      ownerId: userId,
      actorId: userId,
      actorName: 'You',
      type: 'UPVOTE_SOLUTION',
      targetId: solutionId,
      targetTitle: solutionData.title || 'Unknown Solution'
    })

    // Log what happened to solver
    if (solutionData.solverId !== userId) {
      const upvoterSnap = await getDoc(doc(db, 'users', userId))
      const upvoterName = upvoterSnap.data()?.displayName || 'Someone'

      await logActivity ({
        ownerId: solutionData.solverId,
        actorId: userId,
        actorName: upvoterName,
        type: 'SOLUTION_UPVOTED',
        targetId: solutionId,
        targetTitle: solutionData.title || 'Unknown Solution'
      })
    }
  }

  return true
}

// Check if user has upvoted solution
export async function hasUserUpvotedSolution(
  solutionId: string,
  userId: string
): Promise<boolean> {
  const voteRef = doc(db, 'solutions', solutionId, 'votes', userId)
  const voteSnap = await getDoc(voteRef)
  return voteSnap.exists()
}

// Edit a solution / PUT
export async function updateSolution(
  solutionId: string,
  userId: string,
  updates: Partial<{ 
    title: string
    description: string
    repositoryUrl: string
    liveUrl: string
    techStack: string[]
    updatedAt: Timestamp
  }>
): Promise<void> {
  const solRef = doc(db, 'solutions', solutionId)
  const solSnap = await getDoc(solRef)

  if (!solSnap.exists()) throw new Error ('Solution not found')
  if (solSnap.data()?.solverId !== userId) throw new Error ('Unauthorized')

  await updateDoc(solRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}