import type { Timestamp } from "firebase/firestore"

export type UserRole = 'Poster' | 'Solver'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: UserRole
  createdAt: Timestamp
  updatedAt: Timestamp
}
