import { Link } from '@tanstack/react-router'
import { CheckCircle, ThumbsUp, Flame, Bell, CirclePlus } from 'lucide-react'
import StatCard from './cards/StatCard'
import ActivityFeed from './cards/ActivityFeed'
import ActiveProjectsTable from './cards/ActiveProjectsTable'
import PortfolioShowcase from './cards/PortfolioShowcase'

export default function DeveloperDashboard() {
  return (
    <div className="min-h-screen bg-[#0D0C15] text-white p-6 lg:p-10 font-sans overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[7.5%] left-[12.5%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-vexed-highlight1/20 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[7.5%] translate-x-1/4 translate-y-1/4 w-[650px] h-[650px] rounded-full bg-vexed-highlight1/15 blur-[150px]" />
      </div>


      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight">Developer Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors" aria-label="Notifications">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#553CFF] rounded-full" />
            </button>
            <Link
              to="/browse"
              className="bg-[#553CFF] hover:bg-[#4A34DF] text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(85,60,255,0.2)] hover:shadow-[0_0_20px_rgba(85,60,255,0.4)]"
            >
              <CirclePlus size={16} /> Claim New Vexation
            </Link>
          </div>
        </div>

        {/* Stat Cards — full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <StatCard label="Solved Problems" value="124" changePercent="+12%" icon={<CheckCircle size={20} />} />
          <StatCard label="Upvotes Received" value="1.2k" changePercent="+5%" icon={<ThumbsUp size={20} />} />
          <StatCard label="Current Streak" value="15 Days" changePercent="+2%" icon={<Flame size={20} />} variant="accent" />
        </div>

        {/* Active Projects (left) + Activity Feed (right) */}
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          <div className="flex-1 min-w-0">
            <ActiveProjectsTable />
            <PortfolioShowcase />
          </div>
          <div className="w-full lg:w-[340px] shrink-0">
            <ActivityFeed />
          </div>
        </div>

        
      </div>
    </div>
  )
}
