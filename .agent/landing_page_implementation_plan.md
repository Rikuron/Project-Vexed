# Implement Dedicated Landing Page

We will implement "The Dedicated Landing Page" strategy from your `ONBOARDING_STRATEGIES.md`. This involves building a traditional marketing page explaining the platform's value proposition for both Posters and Solvers before users enter the main app. 

As requested, we will prepare this on a separate git branch. 

## User Review Required

> [!IMPORTANT]
> **Branching Strategy**  
> You mentioned using a different git branch for each feature. Before we begin, please create and checkout a new branch (e.g., `git checkout -b feature/dedicated-landing-page`) or let me know if you want me to run the command to create the branch for you.

> [!WARNING]
> **Code Delivery via Snippets**  
> As per `snippet-mode.md`, I will NOT modify your code directly. Instead, once this plan is approved, I will provide you with the markdown code snippets indicating exactly what to add, modify, or delete, and I'll wait for you to apply them.

## Open Questions

- **App Route Path**: Since the landing page will take over the root `/` route, we need to move the main application entry point. I propose moving it to `/app`. Does this work for you?
- **Landing Page Visibility**: Should logged-in users who navigate to `/` see the landing page, or should they be automatically redirected to `/app`? 

## Proposed Changes

### Route Restructuring

#### [NEW] `src/routes/app.tsx`
- We will duplicate the current logic from `src/routes/index.tsx` into this new route, establishing `/app` as the main gateway to either the `SolverDashboard` or `PosterLandingPage` (based on user role).

#### [MODIFY] `src/routes/index.tsx`
- We will replace the current logic to render a brand new `DedicatedLandingPage` component.

#### [MODIFY] `src/routes/__root.tsx`
- We will update the `AppLayout` component to ensure the root route (`/`) renders without the application chrome (Sidebar, Header, Bottom Nav), similar to the `/signIn` page.

### New Components

#### [NEW] `src/components/landing/DedicatedLandingPage.tsx`
- The main wrapper for the landing page.

#### [NEW] `src/components/landing/HeroSection.tsx`
- A visually impactful hero section with a clear headline and a "Launch App" / "Get Started" CTA button.

#### [NEW] `src/components/landing/ValueProposition.tsx`
- A section clearly outlining the two sides of the platform: Posters (Submit problems) vs. Solvers (Build solutions), using premium design cues.

### Styles

#### [MODIFY] `src/styles.css`
- We will add any new CSS variables or utilities needed for the landing page components to maintain the premium, modern aesthetic requested in the global guidelines.

## Verification Plan

### Manual Verification
1. Navigate to `/` as an unauthenticated user to view the new Dedicated Landing Page.
2. Verify the layout appears without the app sidebar and navigation.
3. Click the CTA to ensure it routes correctly to `/app`.
4. Verify `/app` loads the correct interface (Poster or Solver) based on authentication state.
