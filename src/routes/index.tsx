import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../lib/auth/AuthContext'
import { useEffect } from 'react'
import DedicatedLandingPage from '../components/landing/DedicatedLandingPage'
import LoadingScreen from '../components/LoadingScreen'

export const Route = createFileRoute('/')({ component: IndexPage })

function IndexPage() {
  const { userProfile, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && userProfile) {
      navigate({ to: '/app' })
    }
  }, [userProfile, authLoading, navigate])

  if (authLoading) return <LoadingScreen />

  if (userProfile) return null

  return <DedicatedLandingPage />
}
