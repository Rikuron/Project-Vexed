import type { Timestamp } from 'firebase/firestore'

export type ActivityType =
  | 'CLAIM_VEXATION'
  | 'SUBMIT_SOLUTION'
  | 'UPVOTE_VEXATION'
  | 'UPVOTE_SOLUTION'
  | 'SOLUTION_UPVOTED'
  | 'UPDATE_SOLUTION'
  | 'APPROVE_SOLUTION'
  | 'CLOSE_VEXATION'
  | 'COMMENT_VEXATION'
  | 'COMMENT_SOLUTION'

export interface Activity {
  id: string
  ownerId: string           // Solver user whose dashboard this should appear on
  actorId: string           // User who performed Activity
  actorName: string         
  type: ActivityType
  targetId: string          // ID of the Vexation or Solution
  targetTitle: string 
  createdAt: Timestamp
}