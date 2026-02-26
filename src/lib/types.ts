import type { Timestamp } from "firebase/firestore"

export interface Problem {
  id: string
  title: string
  description: string

  // AI-generated Fields
  category: string
  tags: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  technicalComplexity: 'beginner' | 'intermediate' | 'advanced'

  // Metadata
  authorId: string
  authorDisplayName: string
  upvotes: number
  commentCount: number
  status: 'pending' | 'analyzed' | 'flagged'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Vote {
  id: string
  problemId: string
  userId: string
  createdAt: Timestamp
}

export interface Comment {
  id: string
  problemId: string
  authorId: string
  authorDisplayName: string
  content: string
  createdAt: Timestamp
}