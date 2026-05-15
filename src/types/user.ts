import type { Timestamp } from "firebase/firestore"

export type UserRole = 'Poster' | 'Solver'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: UserRole
  bio?: string
  createdAt: Timestamp
  updatedAt: Timestamp

  // Poster-specific fields
  industry?: string
  company?: string

  // Solver-specific fields
  github?: string
  website?: string
  skills?: string[]
}
