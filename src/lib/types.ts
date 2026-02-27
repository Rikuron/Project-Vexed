import type { Timestamp } from "firebase/firestore"

// Sector Categories
export const SECTORS = [
  'health', 'finance', 'logistics', 'productivity',
  'education', 'environment', 'social', 'technology', 'ai/ml', 'other'
] as const

export type Sector = typeof SECTORS[number]

export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type Complexity = 'beginner' | 'intermediate' | 'advanced'
export type VexationStatus = 'pending' | 'analyzed' | 'claimed' | 'solved' | 'closed'

// AI Analysis (returned by the server function)
export interface AIAnalysis {
  sector: Sector
  category: string
  tags: string[]
  severity: Severity
  summary: string
  technicalComplexity: Complexity
  keyChallenges?: string[]
  suggestedTechStack?: string[]
}

// Core Vexation Document 
export interface Vexation {
  id: string
  title: string
  description: string
  // AI-generated fields (populated after analysis)
  sector: Sector
  category: string
  tags: string[]
  severity: Severity
  summary: string
  technicalComplexity: Complexity
  keyChallenges: string[]
  suggestedTechStack: string[]
  // Metadata
  authorId: string
  authorDisplayName: string
  upvotes: number
  viewCount: number
  commentCount: number
  savedBy: string[]        // array of userIds who bookmarked this
  status: VexationStatus
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Form input (what the user types before AI analysis) 
export interface VexationFormData {
  title: string
  description: string
}

// Vote subcollection document 
export interface Vote {
  id: string
  vexationId: string
  userId: string
  createdAt: Timestamp
}

// Comment subcollection document 
export interface Comment {
  id: string
  vexationId: string
  authorId: string
  authorDisplayName: string
  content: string
  createdAt: Timestamp
}

// Query Filters (for browse page) 
export interface VexationFilters {
  sector?: Sector
  complexity?: Complexity
  sortBy?: 'newest' | 'trending' | 'upvotes'
  searchQuery?: string
  limit?: number
}