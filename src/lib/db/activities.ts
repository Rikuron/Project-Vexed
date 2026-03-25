import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { Activity } from '../../types'

const activitiesRef = collection(db, 'activities')

// Called whenever an action happens in the app
export async function logActivity(data: Omit<Activity, 'id' | 'createdAt'>) {
  try {
    await addDoc(activitiesRef, {
      ...data,
      createdAt: serverTimestamp()
    })
  } catch (err) {
    console.error('Failed to log activity: ', err)
  }
}

export async function getUserActivities(
  userId: string,
  maxLimit = 15
): Promise<Activity[]> {
  try {
    const q = query(
      activitiesRef,
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    )

    const snap = await getDocs(q)
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Activity)
  } catch (err) {
    console.error('Error fetching backend acitvities. Ensure Firestore indices are built: ', err)
    return []
  }
}