# Vexed Project Guidelines & AI Assistant Instructions

This document serves as a reference for AI assistants and developers working on the **Vexed** project. It outlines the project's purpose, coding standards, important considerations, and desired workflow to ensure consistency and high-quality development. Keep this file in mind for all current and future work.

## 1. Project Overview & Focus
**Vexed** is a web platform (built with React, Vite, and TanStack Router) for problem-solving and collaboration. 
It focuses on two main concepts:
- **Vexations**: Challenges or problems that users post.
- **Solutions**: Submissions from developers/solvers who review and solve these vexations.

**Key Focus Areas**:
- **Dynamic Dashboards**: Real-time event sourcing via Firestore, tracking developer activity, dynamic activity feeds, and upvotes on solutions and vexations.
- **Developer Experience**: Activity Feed, Streak calculations, Portfolio of claimed vexations and solutions, and an Upvoting system.

## 2. Coding Standards
- **Strict Variable Usage**: Whenever variables are declared, they **SHOULD ALWAYS be USED**. Do not leave unused variables, unreferenced imports, or dead code lying around. Clean up after any refactor.
- **Modularity**: Break complex UI views into smaller, highly cohesive, and reusable separated components. Avoid monolithic files.
- **TypeScript**: Adhere to strict typing. Resolve IDE type and syntax errors immediately.

## 3. UI, Styling & Branding
- **Source of Truth**: When writing or updating UI code, **ALWAYS refer to `src/styles.css`** for the project's core branding and custom CSS variables.
- Match existing color palettes, border radii, spacing, and typography to maintain visual consistency across all pages.

## 4. Architectural Considerations
- **Dynamic over Static**: Components should be built with the ability to consume live Firestore data rather than hardcoded mock data.
- **Feature Encapsulation**: Follow existing patterns for organizing features (e.g., separating Activity Feeds, Stat Cards, and Dashboards).

## 5. Required Workflow: Snippet Mode
When it comes to code implementation, **YOU MUST USE `[/snippet-mode]`**.

As an AI Assistant, adhere to the following strict rules:
1. **ASSIST, DO NOT EDIT**: Do not automatically write or apply changes to files directly using your file-writing tools.
2. **Provide Code Snippets**: Always provide your solution as formatted markdown code blocks in the chat response.
3. **Be Explicit**: Clearly indicate the target file, and explicitly state what existing code I should edit/remove and what code should replace it.
4. **Wait for the User**: Wait for me to copy, paste, and implement the code manually.
5. **Brief Explanations**: Provide a short, concise description of how the snippet works or fixes the issue.
