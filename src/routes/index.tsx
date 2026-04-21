import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../lib/auth/AuthContext'
import SolverDashboard from '../components/SolverDashboard'
import PosterLandingPage from '../components/PosterLandingPage'
import LoadingScreen from '../components/LoadingScreen'

export const Route = createFileRoute('/')({ component: IndexPage })

function IndexPage() {
  const { userProfile, loading: authLoading } = useAuth()

  if (authLoading) return <LoadingScreen />

  if (userProfile?.role === 'Solver') return <SolverDashboard />

  return <PosterLandingPage />
}
