import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile } from '../../types'

// Retrieve User Profile / GET
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) return docSnap.data() as UserProfile

  return null
}

// Create User Profile / POST
export async function createUserProfile(
  uid: string, 
  profileData: Omit<UserProfile, 'uid'>
): Promise<void> {
  const docRef = doc(db, 'users', uid)
  await setDoc(docRef, { uid, ...profileData })
}

// Update User Profile / PATCH
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'users', uid)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  })
}

// Delete User Profile / DELETE
export async function deleteUserProfile(uid: string): Promise<void> {
  const docRef = doc(db, 'users', uid)
  await deleteDoc(docRef)
}