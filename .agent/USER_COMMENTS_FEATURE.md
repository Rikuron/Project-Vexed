# User Comments Feature — Implementation Plan

Threaded, real-time comments on both Vexation and Solution detail pages. Subcollection-based (`vexations/{id}/comments`, `solutions/{id}/comments`), with editing, soft-delete (Reddit-style), live updates via `onSnapshot`, and pagination.

## Workflow Compliance

> [!IMPORTANT]
> **Snippet Mode**: All code delivered as formatted snippets per [PROJECT_GUIDELINES.md](file:///c:/Josh%20Files/College/OJT%202026/vexed/.agent/PROJECT_GUIDELINES.md) §6 and [snippet-mode.md](file:///c:/Josh%20Files/College/OJT%202026/vexed/.agent/snippet-mode.md).

## Resolved Decisions

| Decision | Answer |
|---|---|
| Scope | Both Vexation and Solution detail pages |
| Firestore structure | Subcollections: `vexations/{id}/comments`, `solutions/{id}/comments` |
| Who can comment | Any authenticated user (Poster or Solver). Unauthenticated cannot. |
| Editing | Yes, with `isEdited` marker shown in UI |
| Deletion | Soft-delete (Reddit-style): shell remains, content/author hidden, shows "This comment has been deleted." + deletion timestamp |
| Who can delete | Only the comment author. Vexation/Solution owners cannot delete others' comments (future feature). |
| Threading | Threaded replies via `parentCommentId` (null = top-level, string = reply) |
| Real-time | `onSnapshot` for live updates |
| Pagination | Oldest-first chronological. Paginate top-level comments (e.g., 10 at a time), "Load More" for next batch. Replies load with their parent. |
| Activity logging | Yes — `COMMENT_VEXATION` and `COMMENT_SOLUTION` activity types |
| Comment count | Atomic increment/decrement on both `Vexation.commentCount` and new `Solution.commentCount` |

---

## Proposed Changes

### 1. Types Layer

#### [NEW] [comment.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/types/comment.ts)

New unified Comment type for both Vexation and Solution comments:

```ts
import type { Timestamp } from 'firebase/firestore'

export interface Comment {
  id: string
  authorId: string
  authorDisplayName: string
  authorPhotoURL: string | null
  content: string
  parentCommentId: string | null   // null = top-level, string = reply
  isEdited: boolean
  isDeleted: boolean
  deletedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Convenience type for rendering threaded comments
export interface ThreadedComment extends Comment {
  replies: ThreadedComment[]
}
```

No `vexationId`/`solutionId` needed — the subcollection path provides context.

#### [MODIFY] [vexation.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/types/vexation.ts)

Remove the old `Comment` interface (lines 66-73) since it's replaced by the new `comment.ts`. The `commentCount` field on `Vexation` already exists — no changes needed there.

#### [MODIFY] [solution.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/types/solution.ts)

Add `commentCount` field:

```ts
export interface Solution {
  // ... existing fields ...
  commentCount?: number    // NEW
}
```

#### [MODIFY] [activity.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/types/activity.ts)

Add new activity types:

```ts
export type ActivityType =
  | 'CLAIM_VEXATION'
  | 'SUBMIT_SOLUTION'
  | 'UPVOTE_VEXATION'
  | 'UPVOTE_SOLUTION'
  | 'SOLUTION_UPVOTED'
  | 'UPDATE_SOLUTION'
  | 'APPROVE_SOLUTION'
  | 'CLOSE_VEXATION'
  | 'COMMENT_VEXATION'     // NEW
  | 'COMMENT_SOLUTION'     // NEW
```

#### [MODIFY] [index.ts (types barrel)](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/types/index.ts)

Add export:

```ts
export * from './comment'   // NEW
```

---

### 2. Database Layer

#### [NEW] [comments.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/lib/db/comments.ts)

All Firestore operations for comments. Uses a `parentType` parameter (`'vexations'` | `'solutions'`) to target the correct subcollection path.

**Functions:**

| Function | Purpose |
|---|---|
| `subscribeToComments(parentType, parentId, limit, onData)` | Real-time `onSnapshot` listener, returns unsubscribe fn. Orders by `createdAt asc`. |
| `addComment(parentType, parentId, commentData)` | Creates a new comment doc in subcollection. Increments parent's `commentCount`. Logs activity. |
| `editComment(parentType, parentId, commentId, newContent, authorId)` | Updates `content`, sets `isEdited: true`, updates `updatedAt`. Auth check: only own comments. |
| `deleteComment(parentType, parentId, commentId, authorId)` | Soft-delete: sets `isDeleted: true`, `deletedAt: now`. Decrements parent's `commentCount`. Auth check: only own comments. |

**Key details:**
- `subscribeToComments` returns ALL comments (top-level + replies) ordered by `createdAt asc`. Client-side tree building into `ThreadedComment[]` happens in the component.
- `addComment` uses `increment(1)` on the parent doc's `commentCount`
- `deleteComment` uses `increment(-1)` on the parent doc's `commentCount`
- Activity logging: when commenting on a Vexation, logs `COMMENT_VEXATION` to the Vexation's `authorId`. When commenting on a Solution, logs `COMMENT_SOLUTION` to the Solution's `solverId`. Does NOT log if commenting on your own content.

#### [MODIFY] [index.ts (db barrel)](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/lib/db/index.ts)

```ts
export * from './comments'   // NEW
```

---

### 3. UI Components

All comment components go in a new `src/components/comments/` directory.

#### [NEW] [CommentSection.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/components/comments/CommentSection.tsx)

Main container component. Used by both Vexation and Solution detail pages.

**Props:**
```ts
interface CommentSectionProps {
  parentType: 'vexations' | 'solutions'
  parentId: string
  parentAuthorId: string   // For activity logging (who gets notified)
}
```

**Behavior:**
- Sets up `onSnapshot` listener via `subscribeToComments()` on mount, cleans up on unmount
- Receives flat comment array from Firestore → builds threaded tree client-side (groups replies under `parentCommentId`)
- Manages pagination state: starts with `PAGE_SIZE` (e.g., 10) top-level comments, "Load More" shows next batch
- Renders `CommentInput` for new top-level comments (only if authenticated)
- Renders list of `CommentThread` items
- Shows comment count header: `"💬 {n} Comments"`

#### [NEW] [CommentInput.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/components/comments/CommentInput.tsx)

Text input for posting new comments or replies.

**Props:**
```ts
interface CommentInputProps {
  parentType: 'vexations' | 'solutions'
  parentId: string
  parentCommentId?: string | null  // null = top-level, string = replying to this comment
  parentAuthorId: string
  onCancel?: () => void            // For reply inputs (cancel reply mode)
  placeholder?: string
}
```

**Behavior:**
- Textarea with user avatar on the left
- Submit button (disabled while empty or submitting)
- On submit: calls `addComment()` → clears input
- Reply mode: smaller input with a "Cancel" button
- Unauthenticated users see: "Sign in to comment"

#### [NEW] [CommentItem.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/components/comments/CommentItem.tsx)

Single comment display with actions.

**Props:**
```ts
interface CommentItemProps {
  comment: ThreadedComment
  parentType: 'vexations' | 'solutions'
  parentId: string
  parentAuthorId: string
  depth: number                    // For indentation (max ~3 levels visually)
}
```

**Rendering — Normal state:**
- Avatar + Display Name + timestamp (relative via `formatTimeAgo`)
- Comment content
- "edited" badge if `isEdited === true`
- Action row: `Reply` button, `Edit` / `Delete` buttons (only for own comments)
- Nested replies rendered recursively with increased `depth`

**Rendering — Deleted state (`isDeleted === true`):**
- No avatar, no display name, no content
- Shows: *"This comment has been deleted."* in muted/italic text
- Shows deletion timestamp: *"Deleted on May 15, 2026 at 5:00 PM"*
- Replies still visible below (threaded under the deleted shell)

**Rendering — Edit mode:**
- Content replaced with textarea pre-filled with current content
- "Save" / "Cancel" buttons
- On save: calls `editComment()` → exits edit mode

**Indentation:**
- `depth 0`: no indent (top-level)
- `depth 1+`: left border accent + padding-left, capped visually at depth 3 for readability

---

### 4. Page Integration

#### [MODIFY] [vexation/$id.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/routes/vexation/$id.tsx)

Add `CommentSection` below the existing footer (after the upvotes/comments span, ~line 527). Replace the static comment count display with the live section:

```tsx
<CommentSection
  parentType="vexations"
  parentId={id}
  parentAuthorId={vexation.authorId}
/>
```

The existing static `{vexation.commentCount} Comments` span (lines 523-526) can remain as-is in the action bar since `commentCount` stays synced via atomic increments.

#### [MODIFY] [solution/$id.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/routes/solution/$id.tsx)

Add `CommentSection` below the image gallery section (after ~line 259):

```tsx
<CommentSection
  parentType="solutions"
  parentId={id}
  parentAuthorId={solution.solverId}
/>
```

---

### 5. Firestore Indexes Required

Two composite indexes need to be created (Firebase will prompt with direct links when the queries first run):

1. `vexations/{id}/comments` → `createdAt ASC`
2. `solutions/{id}/comments` → `createdAt ASC`

These are subcollection indexes and may auto-create, but we should document them.

---

## File Summary

| # | Action | File | Purpose |
|---|--------|------|---------|
| 1 | **NEW** | `src/types/comment.ts` | `Comment` + `ThreadedComment` interfaces |
| 2 | MODIFY | `src/types/vexation.ts` | Remove old `Comment` interface |
| 3 | MODIFY | `src/types/solution.ts` | Add `commentCount` field |
| 4 | MODIFY | `src/types/activity.ts` | Add `COMMENT_VEXATION`, `COMMENT_SOLUTION` |
| 5 | MODIFY | `src/types/index.ts` | Export `comment.ts` |
| 6 | **NEW** | `src/lib/db/comments.ts` | All comment CRUD + real-time subscription |
| 7 | MODIFY | `src/lib/db/index.ts` | Export comments module |
| 8 | **NEW** | `src/components/comments/CommentSection.tsx` | Main container with real-time + pagination |
| 9 | **NEW** | `src/components/comments/CommentInput.tsx` | New comment / reply input |
| 10 | **NEW** | `src/components/comments/CommentItem.tsx` | Single comment with edit/delete/reply + recursive threading |
| 11 | MODIFY | `src/routes/vexation/$id.tsx` | Mount `CommentSection` |
| 12 | MODIFY | `src/routes/solution/$id.tsx` | Mount `CommentSection` |

---

## Implementation Order

1. **Batch 1 — Types**: `comment.ts`, modify `vexation.ts`, `solution.ts`, `activity.ts`, `types/index.ts`
2. **Batch 2 — DB Layer**: `comments.ts`, `db/index.ts`
3. **Batch 3 — UI Components**: `CommentInput.tsx`, `CommentItem.tsx`, `CommentSection.tsx`
4. **Batch 4 — Page Integration**: `vexation/$id.tsx`, `solution/$id.tsx`

---

## Design Reference

**Comment section styling** (consistent with existing Vexed design tokens):

- Section card: `bg-slate-800/30 border border-slate-700/50 rounded-xl`
- Comment bubble: `bg-vexed-bg1 rounded-xl p-4`
- Reply indent: `border-l-2 border-vexed-accent2 ml-6 pl-4`
- Deleted state: `text-vexed-dim italic`
- Edited badge: `text-[10px] text-vexed-dim` — "(edited)"
- Input: matches existing `bg-vexed-bg4 border border-vexed-accent2 rounded-lg` pattern
- Action buttons: `text-xs text-vexed-dim hover:text-white transition-colors`
- Submit button: `bg-vexed-primary hover:bg-vexed-secondary text-white rounded-lg text-sm`

---

## Verification Plan

### Manual Verification
1. **Vexation comments**: Post a comment on a Vexation → appears in real-time
2. **Solution comments**: Post a comment on a Solution → appears in real-time
3. **Threading**: Reply to a comment → reply appears nested under parent
4. **Edit**: Edit own comment → content updates, "(edited)" badge appears
5. **Soft-delete**: Delete own comment → shows "This comment has been deleted." with timestamp, replies remain visible
6. **Auth guard**: Unauthenticated users see "Sign in to comment", no input rendered
7. **Cannot delete others**: Edit/Delete buttons only visible on own comments
8. **Comment count**: `commentCount` increments on add, decrements on delete (verify in Firestore)
9. **Activity feed**: Commenting on someone else's Vexation/Solution logs activity to their feed
10. **Pagination**: Post 15+ top-level comments → only first 10 visible, "Load More" shows rest
11. **Real-time**: Open two browser tabs on same Vexation → comment in one appears in the other instantly

### Build Verification
- `npm run build` — no TypeScript errors
- `npm run dev` — visual smoke test on both detail pages