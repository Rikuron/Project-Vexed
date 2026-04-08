# Responsive View Refactoring — Handoff Document

This document captures the current state of the responsive UI refactoring for the **Vexed** web platform. Use it alongside `PROJECT_GUIDELINES.md` and `src/styles.css` for full context.

> **IMPORTANT**: Before making ANY changes, read `PROJECT_GUIDELINES.md` — particularly §6 (Snippet Mode). You must provide code as snippets, not auto-apply edits.

---

## Tech Stack & Design System

- **Framework**: React + TanStack Router + TanStack Start
- **Styling**: Tailwind CSS v4 (using `@theme` block in `src/styles.css`)
- **Approach**: Mobile-first. Use Tailwind breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- **Branding**: All color tokens are defined in `src/styles.css` under `@theme`
- **Key colors**: `vexed-bg1` (#161822), `vexed-bg2` (#0b0c15), `vexed-primary` (#1a2cfe), `vexed-highlight1` (#3713ec)
- **Sidebar**: Fixed-position, slides in on mobile (`lg:` breakpoint toggles visibility). Hamburger button is `fixed top-3 left-4 z-50 lg:hidden`

---

## Layout Architecture

### Root Layout (`src/routes/__root.tsx`)
```
<html>
  <body>
    <AuthProvider>
      <SidebarProvider>
        <AppLayout>
          <div class="flex min-h-screen overflow-x-hidden">
            <Sidebar />              ← fixed position, not in flow
            <div style="padding-left: var(--sidebar-offset, 0px)">
              <main class="flex-1">
                {children}            ← page content
              </main>
            </div>
          </div>
        </AppLayout>
      </SidebarProvider>
    </AuthProvider>
  </body>
</html>
```

**Critical notes:**
- `--sidebar-offset` is only set at `min-width: 1024px` (desktop). On mobile it defaults to `0px`.
- `<main>` has NO top padding. The hamburger button (`fixed top-3 left-4`) overlays page content. Each page is responsible for its own top padding/spacing.
- `overflow-x: hidden` is set on both the flex container AND `html`/`body` in `styles.css` to prevent glow blobs from creating horizontal overflow.
- Do NOT add `pt-14` or similar global top padding to `<main>` — this creates a gap that no page background fills, causing visible layout breaks on mobile.

### Global Styles (`src/styles.css`)
- `html` and `body` have `background-color: #0b0c15; overflow-x: hidden;`
- `.no-scrollbar` utility hides scrollbars on horizontal scroll containers (webkit + Firefox)

---

## Completed Work

### Pages Refactored ✅

| Page / Component | File | Changes Made |
|---|---|---|
| **Root Layout** | `src/routes/__root.tsx` | Added `overflow-x-hidden` to flex container. Removed `pt-14 lg:pt-0` from `<main>`. |
| **PosterLandingPage** | `src/components/PosterLandingPage.tsx` | Complete redesign: removed top bar & suggestion chips, centered hero vertically, cards in horizontal scroll on mobile with fade edges, 3-col grid on `md`+. Added `relative` for glow containment. |
| **DeveloperDashboard** | `src/components/DeveloperDashboard.tsx` | Constrained glow blobs (`w-[300px] sm:w-[500px]`), header wraps on mobile (`flex-col sm:flex-row`), CTA button text scales down. |
| **Browse** | `src/routes/browse.tsx` | Filter/sort tabs wrap (`flex-wrap`), padding reduced on mobile (`px-4 sm:px-6`), `flex-1` spacer hidden on mobile. |
| **My Vexations** | `src/routes/my-vexations.tsx` | Table converts to stacked cards on mobile (`hidden sm:grid` for header, card layout for rows). Title scales (`text-2xl sm:text-3xl`). Stats row wraps. |
| **Claimed** | `src/routes/my/claimed.tsx` | Search/sort stacked vertically on mobile. Tab gaps reduced (`gap-4 sm:gap-8`). Title scales. |
| **Saved** | `src/routes/my/saved.tsx` | Padding reduced. Title scales (`text-2xl sm:text-3xl`). |
| **Vexation Detail** | `src/routes/vexation/$id.tsx` | Breadcrumb/actions bar stacks on mobile. Title text scales. |
| **Solution Detail** | `src/routes/solution/$id.tsx` | Padding reduced. Title scales. |
| **Portfolio** | `src/routes/portfolio.tsx` | Padding reduced, title scales, card preview height adjusted. |
| **SubmitForm** | `src/components/forms/SubmitForm.tsx` | Glow blob constrained, padding reduced for mobile. |
| **SignIn** | `src/routes/signIn.tsx` | Removed desktop-only right margin. |
| **ActiveVexationsTable** | `src/components/cards/ActiveVexationsTable.tsx` | Table rows convert to stacked cards on mobile. |
| **RecentVexationCard** | `src/components/cards/RecentVexationCard.tsx` | Added `block h-full` to `<Link>` so it properly fills its parent container. |

---

## Pages / Components NOT YET Audited

These files have NOT been tested for mobile responsiveness and may need attention:

| File | Priority | Notes |
|---|---|---|
| `src/routes/complete-profile.tsx` | Medium | Profile completion form — check form layout and inputs on mobile |
| `src/components/Sidebar.tsx` | Low | Already responsive (fixed + slide-in), but verify touch targets (44px min) |
| `src/components/LoadingScreen.tsx` | Low | Simple centered spinner, likely fine |
| `src/components/auth/*` | Medium | Auth-related components — check modal/form sizing |
| `src/components/forms/SubmitSolutionModal.tsx` | High | Modal forms are notoriously bad on mobile — check sizing, scrollability, and inputs |
| `src/components/cards/*` | Medium | Individual card components — verify they don't overflow on narrow screens |

---

## Common Responsive Patterns Used

### 1. Flex row → column on mobile
```tsx
className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
```

### 2. Title scaling
```tsx
className="text-2xl sm:text-3xl font-bold"
```

### 3. Table → card conversion on mobile
```tsx
{/* Table header: hidden on mobile */}
<div className="hidden sm:grid grid-cols-12 ...">

{/* Row: card on mobile, grid row on desktop */}
<div className="flex flex-col gap-2 p-4 sm:grid sm:grid-cols-12 sm:p-0 ...">
```

### 4. Horizontal scroll with fade edges
```tsx
<div className="relative">
  <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
       style={{ background: 'linear-gradient(to right, #0b0c15, transparent)' }} />
  <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
       style={{ background: 'linear-gradient(to left, #0b0c15, transparent)' }} />
  <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar">
    {items.map(item => (
      <div className="shrink-0 w-[280px]">{item}</div>
    ))}
  </div>
</div>
```

> **Note**: Fade gradients MUST use inline `style` with the hex color `#0b0c15`, not Tailwind's `from-vexed-bg2`. Tailwind's gradient utilities don't properly resolve CSS custom properties for gradients.

### 5. Glow blob containment
```tsx
{/* Parent must have: overflow-hidden relative */}
<div className="min-h-screen bg-vexed-bg2 overflow-hidden relative">
  <div className="absolute inset-0 pointer-events-none">
    {/* Use responsive sizes to prevent overflow */}
    <div className="absolute ... w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] ..." />
  </div>
</div>
```

### 6. Link components as block containers
```tsx
{/* TanStack Router <Link> renders as <a> (inline). Add block h-full when it needs to fill a parent container */}
<Link className="block h-full rounded-xl border bg-vexed-bg1 p-5 ...">
```

---

## Critical Gotchas & Lessons Learned

1. **Never add global `pt-*` to `<main>`** — It creates a gap that no page background fills. Pages must handle their own top spacing.

2. **Glow blobs cause horizontal overflow** — Every page with decorative background glows needs `overflow-hidden relative` on its root container AND responsive blob sizing.

3. **`overflow-x: hidden` on a flex child doesn't prevent body overflow** — Must also set it on `html` and `body` in `styles.css`.

4. **Tailwind gradient utilities don't resolve CSS custom properties** — Use inline `style={{ background: 'linear-gradient(...)' }}` with hex values.

5. **`<Link>` from TanStack Router is inline by default** — When a card Link needs to fill its parent (e.g., in a flex row of fixed-width wrappers), add `block h-full`.

6. **`no-scrollbar` requires custom CSS** — It's defined in `styles.css`, not a built-in Tailwind class.

7. **The hamburger menu is `fixed top-3 left-4`** — Pages should avoid placing critical content in that exact top-left area on mobile. Normal page padding (`px-6 py-8`) is usually sufficient.

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Poster | jane@gmail.com | jane123 |
| Solver | gary@gmail.com | gary123 |

---

## Verification Checklist

When auditing a page for responsiveness, check:

- [ ] No horizontal overflow / scrollbar at 390px width
- [ ] Hamburger menu doesn't overlap critical content
- [ ] All text is readable (no truncation unless intentional via `line-clamp`)
- [ ] Filter/sort controls don't overflow — use `flex-wrap` or vertical stacking
- [ ] Tables convert to card layouts on mobile
- [ ] Glow decorations are contained (no bleed on edges)
- [ ] Touch targets are at least 44×44px
- [ ] Cards fill their containers properly (`block h-full` on Links if needed)
