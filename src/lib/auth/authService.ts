import {
  signInWithPopup,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  type AuthProvider as FirebaseAuthProvider
} from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'
import {
  auth,
  googleProvider,
  githubProvider,
  twitterProvider,
  microsoftProvider,
  linkedinProvider
} from '../firebase'
import { getUserProfile, createUserProfile } from '../db'
import type { UserRole } from '../../types'

const getProviderInstance = (name: string): FirebaseAuthProvider => {
  switch (name) {
    case 'google': return googleProvider
    case 'github': return githubProvider
    case 'twitter': return twitterProvider
    case 'microsoft': return microsoftProvider
    case 'linkedin': return linkedinProvider
    default: return googleProvider
  }
}

export const authService = {
  signInWithProvider: async (
    providerName: 'google' | 'github' | 'twitter' | 'microsoft' | 'linkedin',
    selectedRole: UserRole = 'Poster'
  ) => {
    const provider = getProviderInstance(providerName)
    const result = await signInWithPopup(auth, provider)
    const fbUser = result.user

    const existingProfile = await getUserProfile(fbUser.uid)

    if (!existingProfile) {
      await createUserProfile(fbUser.uid, {
        email: fbUser.email || '',
        displayName: fbUser.displayName || '',
        photoURL: fbUser.photoURL,
        role: selectedRole,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }
    
    return getUserProfile(fbUser.uid)
  },

  signUpWithEmail: async (
    email: string,
    password: string,
    displayName: string,
    selectedRole: UserRole
  ) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const fbUser = result.user

    await updateProfile(fbUser, { displayName })

    await createUserProfile(fbUser.uid, {
      email: fbUser.email || email,
      displayName: displayName,
      photoURL: null,
      role: selectedRole,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    return getUserProfile(fbUser.uid)
  },

  signInWithEmail: async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  },

  signOut: async () => {
    return firebaseSignOut(auth)
  }
}
