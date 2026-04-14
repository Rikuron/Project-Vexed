import type { Timestamp } from 'firebase/firestore'

export interface Solution {
  id: string
  vexationId: string
  solverId: string
  solverDisplayName: string
  title: string
  description: string
  repositoryUrl?: string
  liveUrl?: string
  dateStarted: Timestamp
  dateSubmitted: Timestamp
  techStack?: string[]
  upvotes?: number
  images?: string[]
  updatedAt?: Timestamp
  status?: 'pending' | 'approved' | 'rejected'
  approvedAt?: Timestamp
}