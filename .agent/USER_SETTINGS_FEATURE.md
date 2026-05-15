# User Settings Feature — Final Plan

Implement a full User Settings page with **role-aware sections** for the two distinct user types: **Poster** and **Solver (Developer)**. Currently the "User Settings" button in both the Sidebar and MobileHeader menus is **disabled** — this plan activates it.

## Workflow Compliance

> [!IMPORTANT]
> **Snippet Mode**: Per [PROJECT_GUIDELINES.md](file:///c:/Josh%20Files/College/OJT%202026/vexed/.agent/PROJECT_GUIDELINES.md) §6 and [snippet-mode.md](file:///c:/Josh%20Files/College/OJT%202026/vexed/.agent/snippet-mode.md), all code will be delivered as **formatted code snippets** in chat. No files will be written or modified directly. You will copy-paste and implement each snippet yourself.

## Resolved Decisions

| Decision | Answer |
|---|---|
| Role switching | **No** — role is permanent, set at onboarding. Displayed as read-only. |
| Delete Account | **Yes** — included with confirmation modal + data cascade |
| Password Change | **Yes** — for email/password users only (OAuth users won't see this section) |
| Re-authentication | **Both flows** — email users re-enter password; OAuth users re-sign in with provider |
| Avatar constraints | **jpg/png/webp only**, max **2MB** |
| Skills UX (Solver) | **Polished chip/pill input** with individually removable tags |
| Poster deletion cascade | Vexations remain → `authorDisplayName` set to `"[Deleted User]"` → status set to `"Closed"` |
| Solver deletion cascade | Solutions remain → `solverDisplayName` set to `"[Deleted User]"` |

---

## Role-Specific Settings Design

| | **Poster** | **Solver (Developer)** |
|---|---|---|
| **Purpose on Vexed** | Faces challenges, publishes Vexations | Browses Vexations, claims & solves them |
| **Profile Fields** | Display Name, Avatar, Bio, Industry, Company | Display Name, Avatar, Bio, GitHub, Website, Skills (chips) |
| **Account Section** | Email (read-only), Role (read-only), Joined date, Change Password (email users) | Email (read-only), Role (read-only), Joined date, Change Password (email users) |
| **Danger Zone** | Delete Account (cascades → close Vexations) | Delete Account (cascades → mark Solutions) |

---

## Proposed Changes

### 1. Types Layer

#### [MODIFY] [user.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/types/user.ts)

Extend `UserProfile` with role-aware optional fields. All new fields are `?` — no Firestore migration needed.

```ts
import type { Timestamp } from "firebase/firestore"

export type UserRole = 'Poster' | 'Solver'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: UserRole
  bio?: string                // Shared — short user bio

  // Poster-specific fields
  industry?: string           // What sector/industry they work in
  company?: string            // Company or organization name

  // Solver-specific fields
  github?: string             // GitHub username
  website?: string            // Personal/portfolio URL
  skills?: string[]           // Technical skills (e.g., ["React", "Python", "Firebase"])

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

### 2. Database Layer

#### [MODIFY] [users.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/lib/db/users.ts)

Add `updateUserProfile()` and `deleteUserProfile()`. Full replacement of the file:

```ts
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile } from '../../types'

// Retrieve User Profile / GET
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) return docSnap.data() as UserProfile
  return null
}

// Create User Profile / POST
export async function createUserProfile(uid: string, profileData: Omit<UserProfile, 'uid'>): Promise<void> {
  const docRef = doc(db, 'users', uid)
  await setDoc(docRef, { uid, ...profileData })
}

// Update User Profile / PATCH  (NEW)
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'users', uid)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  })
}

// Delete User Profile / DELETE  (NEW)
export async function deleteUserProfile(uid: string): Promise<void> {
  const docRef = doc(db, 'users', uid)
  await deleteDoc(docRef)
}
```

---

#### [MODIFY] [storage.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/lib/db/storage.ts)

Add `uploadAvatar()` below the existing `uploadImages()`:

```ts
/** Avatar constraints: jpg/png/webp only, max 2MB */
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB

export async function uploadAvatar(file: File, uid: string): Promise<string> {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed.')
  }
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('Avatar must be under 2MB.')
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const storageRef = ref(storage, `avatars/${uid}.${ext}`)
  const snapshot = await uploadBytes(storageRef, file)
  return getDownloadURL(snapshot.ref)
}
```

---

#### [MODIFY] [index.ts (db barrel)](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/lib/db/index.ts)

Add `storage` re-export:

```ts
export * from './vexations'
export * from './users'
export * from './solutions'
export * from './activities'
export * from './storage'    // NEW
```

---

### 3. Auth Context

#### [MODIFY] [AuthContext.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/lib/auth/AuthContext.tsx)

Add `refreshProfile` to the context so the Settings page can reload the cached profile after updates.

**Changes:**

1. Add to `AuthContextType` interface:
```ts
refreshProfile: () => Promise<void>
```

2. Add implementation inside `AuthProvider`:
```ts
const refreshProfile = async () => {
  if (user) {
    const profile = await getUserProfile(user.uid)
    setUserProfile(profile)
  }
}
```

3. Add `refreshProfile` to the `<AuthContext.Provider value={{...}}>` object.

---

### 4. Account Deletion Cascade

#### [MODIFY] [vexations.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/lib/db/vexations.ts)

Add a function that marks all of a Poster's Vexations as closed with a deleted user label:

```ts
// Cascade: mark all Poster's vexations on account deletion
export async function cascadeDeletePoster(uid: string): Promise<void> {
  const q = query(vexationsRef, where('authorId', '==', uid))
  const snapshot = await getDocs(q)

  const updates = snapshot.docs.map((docSnap) =>
    updateDoc(doc(db, 'vexations', docSnap.id), {
      authorDisplayName: '[Deleted User]',
      status: 'Closed',
      closedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  )

  await Promise.all(updates)
}
```

---

#### [MODIFY] [solutions.ts](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/lib/db/solutions.ts)

Add a function that marks all of a Solver's Solutions with a deleted user label:

```ts
// Cascade: mark all Solver's solutions on account deletion
export async function cascadeDeleteSolver(uid: string): Promise<void> {
  const q = query(solutionsRef, where('solverId', '==', uid))
  const snapshot = await getDocs(q)

  const updates = snapshot.docs.map((docSnap) =>
    updateDoc(doc(db, 'solutions', docSnap.id), {
      solverDisplayName: '[Deleted User]',
      updatedAt: serverTimestamp()
    })
  )

  await Promise.all(updates)
}
```

---

### 5. Settings Route (Main Deliverable)

#### [NEW] [settings.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/routes/settings.tsx)

A TanStack Router file-based route at `/settings`.

**Page wireframe:**

```
┌──────────────────────────────────────────────────┐
│  ⚙ User Settings                                 │
│  Manage your profile and account preferences      │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─ PROFILE ────────────────────────────────────┐│
│  │                                              ││
│  │  [Avatar ○]  Click to change                 ││
│  │              jpg/png/webp, max 2MB           ││
│  │                                              ││
│  │  Display Name  [___________________]         ││
│  │  Bio           [___________________]         ││
│  │                                              ││
│  │  ── IF POSTER ──────────────────────         ││
│  │  Industry      [___________________]         ││
│  │  Company       [___________________]         ││
│  │                                              ││
│  │  ── IF SOLVER ──────────────────────         ││
│  │  GitHub        [___________________]         ││
│  │  Website       [___________________]         ││
│  │  Skills        [React ✕] [Python ✕] [+___]  ││
│  │                                              ││
│  │                       [Save Profile]         ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  ┌─ ACCOUNT ────────────────────────────────────┐│
│  │  Email    user@example.com      (read-only)  ││
│  │  Role     Poster / Solver       (read-only)  ││
│  │  Joined   May 14, 2026          (read-only)  ││
│  │                                              ││
│  │  ── IF EMAIL USER ─────────────────          ││
│  │  Current Password  [_______________]         ││
│  │  New Password      [_______________]         ││
│  │  Confirm Password  [_______________]         ││
│  │                    [Change Password]         ││
│  └──────────────────────────────────────────────┘│
│                                                  │
│  ┌─ DANGER ZONE ────────────────────────────────┐│
│  │  ⚠ This action is permanent and cannot       ││
│  │    be undone.                                 ││
│  │                                              ││
│  │  • Your profile will be permanently deleted   ││
│  │  • Poster: Your vexations will be closed      ││
│  │  • Solver: Your solutions will remain         ││
│  │    but marked as [Deleted User]               ││
│  │                                              ││
│  │          [Delete My Account]                  ││
│  └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

**Key implementation details:**

- **Auth guard**: Redirect to `/signIn` if no authenticated user (same pattern as [complete-profile.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/routes/complete-profile.tsx))
- **Role-conditional rendering**: `userProfile.role === 'Poster'` shows Industry + Company; `'Solver'` shows GitHub + Website + Skills
- **Avatar upload**: Hidden `<input type="file" accept=".jpg,.jpeg,.png,.webp">` triggered by clicking the avatar. Validates type + size → calls `uploadAvatar()` → updates Firestore via `updateUserProfile({ photoURL })` → calls Firebase Auth `updateProfile(user, { photoURL })` → calls `refreshProfile()`
- **Skills chip input (Solver)**: An input field + Enter key to add chips. Each chip has an `✕` button to remove. Stored as `string[]` on save
- **Password change (email users only)**: Detects auth provider via `user.providerData[0]?.providerId === 'password'`. Uses `reauthenticateWithCredential(user, EmailAuthProvider.credential(email, currentPassword))` then `updatePassword(user, newPassword)`
- **Inline feedback**: Success/error banner with auto-dismiss (same pattern as error display in `complete-profile.tsx`)

**Design tokens** from [styles.css](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/styles.css):
- Page background: `bg-[#0D0C15]` (matches portfolio)
- Section cards: `bg-vexed-bg1 border border-vexed-accent2 rounded-2xl`
- Inputs: `bg-vexed-bg4 border border-vexed-accent2 rounded-lg px-4 py-2.5 text-sm text-white focus:border-vexed-primary focus:outline-none`
- Labels: `text-xs font-semibold text-vexed-dim uppercase tracking-wider`
- Section headers: `text-sm font-bold text-vexed-dim uppercase tracking-widest border-b border-vexed-accent2 pb-2`
- Primary button: `bg-vexed-primary hover:bg-vexed-secondary text-white rounded-lg`
- Danger button: `bg-rose-600/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600/20`
- Skill chips: `bg-vexed-highlight1/20 text-vexed-highlight2 text-xs font-bold rounded-full px-3 py-1`

---

### 6. Delete Account Modal

#### [NEW] [DeleteAccountModal.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/components/forms/DeleteAccountModal.tsx)

Confirmation modal following the pattern from [EditVexationModal.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/components/forms/EditVexationModal.tsx).

**Props interface:**
```ts
interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  displayName: string
  role: UserRole
  onConfirm: () => Promise<void>
}
```

**Behavior:**
1. User must type their exact display name to enable the delete button
2. Shows role-specific consequences:
   - Poster: "Your Vexations will be closed and marked as [Deleted User]"
   - Solver: "Your Solutions will remain but marked as [Deleted User]"
3. Delete button disabled until typed name matches `displayName`
4. On confirm → triggers re-authentication flow:
   - **Email users**: Prompts for current password → `reauthenticateWithCredential()` → proceeds
   - **OAuth users**: `reauthenticateWithPopup(user, provider)` → proceeds
5. Calls cascade function based on role → `deleteUserProfile()` → `user.delete()` → redirect to `/signIn`

**Design:**
- Overlay: `fixed inset-0 z-50 bg-black/70`
- Card: `bg-vexed-bg2 border border-vexed-accent2 rounded-2xl max-w-md`
- Destructive red accent throughout
- `⚠` warning icon in header

---

### 7. Navigation Wiring

#### [MODIFY] [Sidebar.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/components/Sidebar.tsx)

**Lines 147-152** — Replace disabled button with functional navigation:

```tsx
// REPLACE:
<button
  disabled
  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
>
  <UserCog size={14} /> User Settings
</button>

// WITH:
<button
  onClick={() => {
    setSettingsOpen(false)
    navigate({ to: '/settings' })
  }}
  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
>
  <UserCog size={14} /> User Settings
</button>
```

#### [MODIFY] [MobileHeader.tsx](file:///c:/Josh%20Files/College/OJT%202026/vexed/src/components/MobileHeader.tsx)

**Lines 50-55** — Same replacement as Sidebar.

---

## File Summary

| # | Action | File | Purpose |
|---|--------|------|---------|
| 1 | MODIFY | `src/types/user.ts` | Add `bio`, `industry`, `company`, `github`, `website`, `skills` |
| 2 | MODIFY | `src/lib/db/users.ts` | Add `updateUserProfile()` + `deleteUserProfile()` |
| 3 | MODIFY | `src/lib/db/storage.ts` | Add `uploadAvatar()` with type/size validation |
| 4 | MODIFY | `src/lib/db/index.ts` | Re-export storage |
| 5 | MODIFY | `src/lib/auth/AuthContext.tsx` | Add `refreshProfile()` to context |
| 6 | MODIFY | `src/lib/db/vexations.ts` | Add `cascadeDeletePoster()` |
| 7 | MODIFY | `src/lib/db/solutions.ts` | Add `cascadeDeleteSolver()` |
| 8 | **NEW** | `src/routes/settings.tsx` | Full settings page (main deliverable) |
| 9 | **NEW** | `src/components/forms/DeleteAccountModal.tsx` | Confirmation modal with re-auth |
| 10 | MODIFY | `src/components/Sidebar.tsx` | Wire "User Settings" → `/settings` |
| 11 | MODIFY | `src/components/MobileHeader.tsx` | Wire "User Settings" → `/settings` |

---

## Implementation Order

Snippet batches will be delivered in this dependency order:

1. **Batch 1 — Foundation**: `user.ts` type + `users.ts` DB + `storage.ts` + `db/index.ts`
2. **Batch 2 — Auth**: `AuthContext.tsx` with `refreshProfile`
3. **Batch 3 — Cascade**: `vexations.ts` cascade + `solutions.ts` cascade
4. **Batch 4 — UI**: `settings.tsx` route page
5. **Batch 5 — Modal**: `DeleteAccountModal.tsx`
6. **Batch 6 — Wiring**: `Sidebar.tsx` + `MobileHeader.tsx` button activation

---

## Verification Plan

### Manual Verification
1. **Sidebar nav**: Click "User Settings" from Sidebar dropdown → navigates to `/settings`
2. **Mobile nav**: Click "User Settings" from MobileHeader dropdown → navigates to `/settings`
3. **Poster view**: Log in as Poster → Settings shows Industry + Company, no GitHub/Website/Skills
4. **Solver view**: Log in as Solver → Settings shows GitHub + Website + Skills chips, no Industry/Company
5. **Profile save**: Update display name + bio → verify Firestore `users/{uid}` fields update, sidebar reflects change
6. **Avatar upload**: Upload a .png under 2MB → appears in Storage `avatars/`, `photoURL` updates everywhere
7. **Avatar rejection**: Try uploading a .gif or 5MB file → error message shown, no upload
8. **Skills chips**: Add/remove skill chips → verify stored as `string[]` in Firestore
9. **Password change**: Email user → enter current + new password → verify Firebase Auth password updates
10. **Delete Poster account**: Type display name → confirm → Vexations become `"Closed"` with `"[Deleted User]"` → user deleted → redirect to `/signIn`
11. **Delete Solver account**: Type display name → confirm → Solutions show `"[Deleted User]"` → user deleted → redirect to `/signIn`
12. **Auth guard**: Visit `/settings` while signed out → redirect to `/signIn`

### Build Verification
- `npm run build` — no TypeScript errors
- `npm run dev` — visual smoke test on `/settings` for both roles