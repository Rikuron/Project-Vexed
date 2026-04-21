<div align="center">

# Vexed

**Turn your daily frustrations into someone's next mission.**

A collaborative problem-solving platform where real-world frustrations meet developer talent. Posters submit challenges. Solvers build solutions. Everyone wins.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TanStack](https://img.shields.io/badge/TanStack_Router-1.x-FF4154?logo=reactrouter&logoColor=white)](https://tanstack.com/router)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📸 Screenshots

| Sign In | Poster Dashboard | Problem Discovery | Solver Analytics |
| :---: | :---: | :---: | :---: |
| ![Sign In](/public/screenshots/sign_in_page.png) | ![Poster Landing](/public/screenshots/poster_landing_page.png) | ![Browse](/public/screenshots/browse_page.png) | ![Solver Dashboard](/public/screenshots/solver_dashboard.png) |

---

## 🧩 The Core Loop

### For Posters — *The Problem Owners*

Posters submit real-world frustrations ("Vexations") through a guided form. Every submission is automatically processed by an **AI moderation & categorization pipeline** that:

- Screens for policy violations, explicit content, and low-substance input
- Classifies the problem into a **Sector** (e.g., Health, Finance, Environment, AI/ML)
- Generates tags, severity ratings, technical complexity, and a developer-focused summary
- Suggests a relevant tech stack and key challenges

### For Solvers — *The Developers*

Developers browse a dynamic discovery feed of categorized problems. They can:

- **Claim** vexations to work on
- **Submit solutions** with image uploads and detailed write-ups
- **Track streaks** and activity analytics on a personalized dashboard
- Build a **public portfolio** showcasing completed solutions

---

## 🏗️ Technical Architecture

### Stack

| Layer | Technology |
| --- | --- |
| **UI Framework** | React 19 |
| **Build Tool** | Vite 7 |
| **Routing & SSR** | TanStack Router + TanStack Start (Nitro) |
| **Backend / DB** | Firebase (Firestore, Auth, Storage) |
| **Server Functions** | Nitro-based server functions via `createServerFn` |
| **AI Integration** | OpenRouter API (MiniMax M2.5) — categorization & moderation |
| **Styling** | Tailwind CSS 4 + Custom Aurora Design System |
| **Icons** | Lucide React |
| **Testing** | Vitest + Testing Library |

### Design System — *Aurora*

The UI is built on a custom dark-mode-first design system defined in `src/styles.css`, featuring:

- A deep indigo/purple palette (`vexed-primary`, `vexed-highlight1–3`, `vexed-accent1–4`)
- Dark backgrounds (`vexed-bg1–4`) designed for extended screen time
- Inter font family with system fallbacks
- Orbital loading animations and hidden-scrollbar utilities

### Project Structure

```
src/
├── components/           # Modular, reusable UI components
│   ├── cards/            #   — Card-based display components (11 cards)
│   ├── forms/            #   — Submit, edit, and verification modals (6 forms)
│   ├── auth/             #   — Auth context & service
│   ├── Sidebar.tsx       #   — Main navigation sidebar
│   ├── MobileHeader.tsx  #   — Responsive mobile header
│   ├── MobileBottomNav.tsx
│   ├── PosterLandingPage.tsx
│   ├── SolverDashboard.tsx
│   └── LoadingScreen.tsx
├── routes/               # File-based routing (TanStack Router)
│   ├── index.tsx          #   — Role-based home (Poster vs. Solver)
│   ├── browse.tsx         #   — Problem discovery feed
│   ├── submit.tsx         #   — Vexation submission flow
│   ├── portfolio.tsx      #   — Public solver portfolio
│   ├── signIn.tsx         #   — Authentication page
│   ├── complete-profile.tsx
│   ├── my/               #   — User-specific pages
│   │   ├── vexations.tsx  #     — My submitted vexations
│   │   ├── claimed.tsx    #     — My claimed problems
│   │   └── saved.tsx      #     — Bookmarked vexations
│   ├── vexation/$id.tsx   #   — Vexation detail page
│   └── solution/$id.tsx   #   — Solution detail page
├── lib/                  # Core business logic
│   ├── ai.server.ts       #   — Server-only AI functions (API key never leaks)
│   ├── firebase.ts        #   — Firebase app initialization
│   ├── auth/              #   — AuthContext + authService
│   ├── db/                #   — Firestore CRUD abstractions
│   │   ├── vexations.ts
│   │   ├── solutions.ts
│   │   ├── activities.ts
│   │   ├── users.ts
│   │   └── storage.ts
│   ├── constants/         #   — App-wide constants
│   └── utils/             #   — Shared utilities
├── types/                # TypeScript type definitions
│   ├── vexation.ts
│   ├── solution.ts
│   ├── user.ts
│   └── activity.ts
└── styles.css            # Aurora design system tokens
```

### Key Design Decisions

- **Role-based routing** — The home page (`/`) dynamically renders `SolverDashboard` or `PosterLandingPage` based on the user's role.
- **Server function isolation** — AI calls run exclusively on the server via `createServerFn`. The `OPENROUTER_API_KEY` is accessed through `process.env` and never bundled into the client.
- **Clean data layer** — All Firestore operations are abstracted in `src/lib/db/`, keeping components free of database logic.
- **AI-powered moderation** — Both new submissions and edits pass through policy validation before persisting.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** (included with Node)
- A **Firebase** project with Firestore, Authentication, and Storage enabled
- An **OpenRouter** API key

### 1. Clone & Install

```bash
git clone <repo-url>
cd vexed
npm install
```

### 2. Configure Environment

Create a `.env` file at the project root:

```env
# Firebase (client-side — VITE_ prefix required)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenRouter (server-side — NO VITE_ prefix)
OPENROUTER_API_KEY=your_openrouter_key
```

> ⚠️ **Important:** Never prefix server-side secrets with `VITE_`. Doing so exposes them in the client bundle.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 4. Run Tests

```bash
npm test
```

---

## 🏭 Production & Deployment

Vexed targets **Firebase Hosting** with Cloud Functions, compiled via the Nitro preset.

### Build

```bash
npm run build
```

This outputs optimized server functions and static assets to `.output/`.

### Set Secrets

```bash
firebase functions:secrets:set OPENROUTER_API_KEY
```

### Deploy

```bash
firebase deploy
```

---

## 🤝 Contributing

1. **Styling** — Always defer to `src/styles.css` as the source of truth for all branding tokens and Aurora design system utilities.
2. **Type safety** — No unused variables. Strict TypeScript throughout.
3. **Component architecture** — Keep components modular. DB logic stays in `src/lib/db/`, AI logic stays in `src/lib/ai.server.ts`.
4. See `.agent/PROJECT_GUIDELINES.md` for the full coding policy.

---

<div align="center">

**Vexed** · Built with 🔥 by passionate developers

*Turn your daily frustrations into someone's next mission.*

</div>
