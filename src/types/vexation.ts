import type { Timestamp } from "firebase/firestore"

// Sector Categories
export const SECTORS = [
  'Health', 'Finance', 'Logistics', 'Productivity', 'Agriculture', 
  'Education', 'Environment', 'Social', 'Technology', 'AI/ML', 'Other'
] as const

export type Sector = typeof SECTORS[number]
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical'
export type Complexity = 'Beginner' | 'Intermediate' | 'Advanced'
export type VexationStatus = 'Pending' | 'Analyzed' | 'Claimed' | 'Solved' | 'Closed'

export interface AIAnalysis {
  isViolatingPolicies: boolean
  violationReason?: string
  sector: Sector
  category: string
  tags: string[]
  severity: Severity
  summary: string
  technicalComplexity: Complexity
  keyChallenges?: string[]
  suggestedTechStack?: string[]
}

export interface Vexation {
  id: string
  title: string
  description: string
  sector: Sector
  category: string
  tags: string[]
  severity: Severity
  summary: string
  technicalComplexity: Complexity
  keyChallenges: string[]
  suggestedTechStack: string[]
  authorId: string
  authorDisplayName: string
  upvotes: number
  viewCount: number
  commentCount: number
  savedBy: string[]
  status: VexationStatus
  claimedByID?: string[] | null
  solutionUrl?: string[] | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface VexationFormData {
  title: string
  description: string
}

export interface Vote {
  id: string
  vexationId: string
  userId: string
  createdAt: Timestamp
}

export interface Comment {
  id: string
  vexationId: string
  authorId: string
  authorDisplayName: string
  content: string
  createdAt: Timestamp
}

export interface VexationFilters {
  sector?: Sector
  complexity?: Complexity
  sortBy?: 'newest' | 'trending' | 'upvotes'
  searchQuery?: string
  limit?: number
}