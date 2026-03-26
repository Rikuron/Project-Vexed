# Vexed Project Guidelines & AI Assistant Instructions

This document serves as a reference for AI assistants and developers working on the **Vexed** project. It outlines the project's purpose, coding standards, important considerations, and desired workflow to ensure consistency and high-quality development. Keep this file in mind for all current and future work.

## 1. Project Overview & Actors
**Vexed** is a web platform (built with React, Vite, TanStack Router, and Firebase) for problem-solving and collaboration. 

**User Roles / Actors**:
There are two primary types of users in the system:
1. **Posters**: Users who face challenges and publish them on the platform as **Vexations**.
2. **Solvers (Developers)**: Users who browse the active Vexations, claim them to work on, and submit **Solutions** to build their portfolio.

**Key Focus Areas**:
- **Dynamic Dashboards**: Real-time event sourcing via Firestore, tracking activity, dynamic feeds, and upvotes.
- **Solver Experience**: Activity Feed, Streak calculations, Portfolio of claimed vexations and solutions.
- **AI-Powered Categorization**: Automated content moderation and tagging using AI server functions.

## 2. Project Structure & Organization
The project follows a modular, feature-focused directory structure within `src/`:

- `src/components/`: Reusable, modular UI components. 
  - `cards/`: Cards for displaying Vexations, Solutions, and Activity Feeds.
  - `forms/`: Modals, submit forms, and verifications (e.g., `SubmitSolutionModal.tsx`).
  - `auth/`: Authentication related components.
- `src/routes/`: File-based routing handled by TanStack Router. This contains all root page components (e.g., `browse.tsx`, `portfolio.tsx`, `my-vexations.tsx`) and dynamic routes (e.g., `/vexation/$id`, `/solution/$id`).
- `src/lib/`: Core business logic and integrations.
  - `db/`: Modularized Firestore database queries arranged by entity (`activities.ts`, `solutions.ts`, `users.ts`, `vexations.ts`).
  - `utils/`: Reusable domain-specific utilities (e.g., calculating streaks `streak.ts`, tracking activity `activity.ts`, formatting).
  - `ai.server.ts`: TanStack Start server functions for secure server-side logic (e.g., calling OpenRouter AI for categorization and moderation).
  - `auth/`: Authentication contexts and hooks.
- `src/types/`: TypeScript definitions (e.g., User profiles, Vexation schemas, Activity models).
- `src/styles.css`: The central stylesheet containing all necessary styling rules, custom CSS variables, and core branding tokens ("Aurora" styling).

*Note: Whenever creating a new feature, place new reusable UI parts in `components/`, core logic or DB queries in `lib/`, and define matching types in `types/`.*

## 3. Coding Standards
- **Strict Variable Usage**: Whenever variables are declared, they **SHOULD ALWAYS be USED**. Do not leave unused variables, unreferenced imports, or dead code lying around. Clean up after any refactor.
- **Modularity**: Break complex UI views into smaller, highly cohesive, and reusable separated components. Avoid monolithic files.
- **TypeScript**: Adhere to strict typing. Resolve IDE type and syntax errors immediately.

## 4. UI, Styling & Branding
- **Source of Truth**: When writing or updating UI code, **ALWAYS refer to `src/styles.css`** for the project's core branding and custom CSS variables.
- Match existing color palettes, border radii, spacing, and typography to maintain visual consistency across all pages.

## 5. Architectural Considerations
- **Secure Server Functions**: Use TanStack Start server functions (like `ai.server.ts`) for any operations requiring secret API keys.
- **Dynamic over Static**: Components should be built with the ability to consume live Firestore data rather than hardcoded mock data.
- **Feature Encapsulation**: Follow existing patterns for organizing features (e.g., separating Activity Feeds, Stat Cards, and Dashboards).

## 6. Required Workflow: Snippet Mode
When it comes to code implementation, **YOU MUST USE `[/snippet-mode]`**.

As an AI Assistant, adhere to the following strict rules:
1. **ASSIST, DO NOT EDIT**: Do not automatically write or apply changes to files directly using your file-writing tools.
2. **Provide Code Snippets**: Always provide your solution as formatted markdown code blocks in the chat response.
3. **Be Explicit**: Clearly indicate the target file, and explicitly state what existing code I should edit/remove and what code should replace it.
4. **Wait for the User**: Wait for me to copy, paste, and implement the code manually.
5. **Brief Explanations**: Provide a short, concise description of how the snippet works or fixes the issue.
