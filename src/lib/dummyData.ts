import type { Vexation } from './types'

// Dummy data for development
// Replace with Firestore queries in prod
export const DUMMY_VEXATIONS: Vexation[] = [
  {
    id: 'vex-001',
    title: 'Stripe Connect onboarding loop',
    description:
      'Users get stuck in a refresh loop after verifying email on the secondary screen. The redirect URI seems to lose the session token.',
    summary:
      'Users get stuck in a refresh loop after verifying email on the secondary screen.',
    category: 'UX Friction',
    sector: 'Finance',
    severity: 'High',
    technicalComplexity: 'Intermediate',
    tags: ['stripe', 'onboarding', 'auth'],
    upvotes: 12,
    commentCount: 4,
    viewCount: 89,
    status: 'Analyzed',
    savedBy: [],
    keyChallenges: ['Session persistence across redirects', 'OAuth state management'],
    suggestedTechStack: ['Stripe Connect API', 'Redis sessions', 'Next.js middleware'],
    authorId: 'user-1',
    authorDisplayName: 'Juan Karlos',
    createdAt: mockTimestamp(2),   // 2 minutes ago
    updatedAt: mockTimestamp(2),
  },
  {
    id: 'vex-002',
    title: 'Dark mode flash on initial load',
    description:
      'The white background flashes for 200ms before dark theme applies on Next.js 13 build. SSR sends light-mode HTML before client hydration.',
    summary:
      'The white background flashes for 200ms before dark theme applies on Next.js 13 build.',
    category: 'Bug',
    sector: 'Technology',
    severity: 'Medium',
    technicalComplexity: 'Beginner',
    tags: ['dark-mode', 'nextjs', 'ssr', 'hydration'],
    upvotes: 48,
    commentCount: 12,
    viewCount: 320,
    status: 'Analyzed',
    savedBy: [],
    keyChallenges: ['SSR/CSR color scheme sync', 'FOUC prevention'],
    suggestedTechStack: ['next-themes', 'CSS custom properties', 'cookie-based preference'],
    authorId: 'user-2',
    authorDisplayName: 'Alex Chen',
    createdAt: mockTimestamp(15),  // 15 minutes ago
    updatedAt: mockTimestamp(15),
  },
  {
    id: 'vex-003',
    title: 'Mobile checkout timeout on slow networks',
    description:
      'Payment confirmation hangs indefinitely on 3G connections. No timeout or retry mechanism, users lose their cart.',
    summary:
      'Payment confirmation hangs indefinitely on 3G connections with no timeout.',
    category: 'Feature',
    sector: 'Finance',
    severity: 'Critical',
    technicalComplexity: 'Advanced',
    tags: ['mobile', 'checkout', 'timeout', 'resilience'],
    upvotes: 48,
    commentCount: 12,
    viewCount: 210,
    status: 'Analyzed',
    savedBy: [],
    keyChallenges: ['Network resilience', 'Idempotent payment retries'],
    suggestedTechStack: ['Service workers', 'AbortController', 'Stripe idempotency keys'],
    authorId: 'user-3',
    authorDisplayName: 'Maria Santos',
    createdAt: mockTimestamp(60),  // 1 hour ago
    updatedAt: mockTimestamp(60),
  },
]

// Helper: creates a mock Firestore-like timestamp
function mockTimestamp(minutesAgo: number) {
  const date = new Date(Date.now() - minutesAgo * 60_000)

  return { toDate: () => date } as any
}