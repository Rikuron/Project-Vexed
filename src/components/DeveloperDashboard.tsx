import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle, ThumbsUp, Flame, Bell, CirclePlus } from 'lucide-react'
import StatCard from './cards/StatCard'
import ActivityFeed from './cards/ActivityFeed'
import ActiveVexationsTable from './cards/ActiveVexationsTable'
import PortfolioShowcase from './cards/PortfolioShowcase'
import { useAuth } from '../lib/auth/AuthContext'
import { getClaimedVexations } from '../lib/db/vexations'
import { getSolutionsBySolver } from '../lib/db/solutions'
import { getUserActivities } from '../lib/db/activities'
import { getStreakFromData } from '../lib/utils/streak'
import type { Vexation, Solution, Activity } from '../types'

export default function DeveloperDashboard() {
  const { user } = useAuth()
  const [claimedVexations, setClaimedVexations] = useState<Vexation[]>([])
  const [completedSolutions, setCompletedSolutions] = useState<Solution[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  const totalUpvotes = completedSolutions.reduce((sum, solution) => sum + (solution.upvotes || 0), 0)

  const currentStreak = getStreakFromData(claimedVexations, completedSolutions)

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return
      try {
        const [vexations, solutions, dbActivities] = await Promise.all([
          getClaimedVexations(user.uid),
          getSolutionsBySolver(user.uid),
          getUserActivities(user.uid)
        ])
        setClaimedVexations(vexations)
        setCompletedSolutions(solutions)
        setActivities(dbActivities)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  return (
    <div className="min-h-screen bg-vexed-bg2 text-white p-6 lg:p-10 font-sans overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[7.5%] left-[12.5%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-vexed-highlight1/20 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[7.5%] translate-x-1/4 translate-y-1/4 w-[650px] h-[650px] rounded-full bg-vexed-highlight1/15 blur-[150px]" />
      </div>

      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Developer Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#553CFF] rounded-full" />
            </button>
            <Link
              to="/browse"
              className="bg-vexed-highlight1 hover:bg-vexed-highlight3 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-[0_0_15px_var(--color-vexed-highlight1)] hover:shadow-[0_0_20px_var(--color-vexed-highlight3)]"
            >
              <CirclePlus size={16} /> Claim New Vexation
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard 
            label="Solved Problems" 
            value={loading ? "..." : completedSolutions.length.toString()} 
            changePercent="Up to date" 
            icon={<CheckCircle size={20} />} 
          />
          <StatCard 
            label="Upvotes Received" 
            value={loading ? "..." : totalUpvotes.toString()}
            changePercent="Static" 
            icon={<ThumbsUp size={20} />} 
          />
          <StatCard 
            label="Current Streak" 
            value={loading ? "..." : `${currentStreak} Day${currentStreak !== 1 ? 's' : ''}`} 
            changePercent={currentStreak > 0 ? "Active" : "No Streak"} 
            icon={<Flame size={20} />} 
            variant="accent" 
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          <div className="flex-1 min-w-0">
            <ActiveVexationsTable projects={claimedVexations} loading={loading} />
            <PortfolioShowcase solutions={completedSolutions} loading={loading} />
          </div>
          <div className="w-full lg:w-[340px] shrink-0">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  )
}