import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase'
import { getUserProfile } from '../db'
import { authService } from './authService'
import type { UserRole, UserProfile } from '../../types'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signInWithProvider: (providerName: 'google' | 'github' | 'twitter' | 'microsoft' | 'linkedin', role?: UserRole) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithProvider = async (providerName: 'google' | 'github' | 'twitter' | 'microsoft' | 'linkedin', role?: UserRole) => {
    const profile = await authService.signInWithProvider(providerName, role)
    setUserProfile(profile)
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string, role: UserRole) => {
    const profile = await authService.signUpWithEmail(email, password, displayName, role)
    setUserProfile(profile)
  }

  const signInWithEmail = async (email: string, password: string) => {
    await authService.signInWithEmail(email, password)
    // Profile is fetched automatically via onAuthStateChanged
  }

  const signOut = async () => {
    await authService.signOut()
    setUserProfile(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithProvider,
      signUpWithEmail,
      signInWithEmail,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
