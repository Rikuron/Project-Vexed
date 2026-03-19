import { Link } from '@tanstack/react-router'
import { Rocket } from 'lucide-react'
import type { Vexation } from '../../types'

interface ActiveProjectsTableProps {
  projects: Vexation[]
  loading?: boolean
}

const statusStyles: Record<string, string> = {
  'Claimed': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Solved': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

export default function ActiveProjectsTable({ projects, loading }: ActiveProjectsTableProps) {
  // Only show projects that are currently "Claimed" (in progress)
  const activeProjects = projects.filter(p => p.status === 'Claimed').slice(0, 3)

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Rocket className="text-[#553CFF]" size={20} /> Active Projects
        </h2>
        <Link to="/portfolio" className="text-[#553CFF] text-sm font-semibold hover:text-white transition-colors">
          View all tasks
        </Link>
      </div>
      <div className="bg-[#151320] border border-white/5 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/5 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          <span>Problem Name</span>
          <span>Status</span>
          <span>Difficulty</span>
          <span>Time</span>
          <span>Action</span>
        </div>
        
        {loading ? (
          <div className="px-6 py-4 text-sm text-slate-400">Loading projects...</div>
        ) : activeProjects.length === 0 ? (
          <div className="px-6 py-4 text-sm text-slate-400">No active projects yet.</div>
        ) : (
          activeProjects.map((project) => (
            <div
              key={project.id}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-white truncate pr-2">{project.title}</p>
                <p className="text-[11px] text-slate-500 font-medium">ID: #{project.id.slice(0, 6)}</p>
              </div>
              <div>
                <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold border ${statusStyles[project.status || 'Claimed'] || statusStyles['Claimed']}`}>
                  {(project.status || 'IN PROGRESS').toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-slate-300">{project.technicalComplexity || 'N/A'}</span>
              <span className="text-sm text-slate-300">N/A</span>
              <Link
                to={`/vexation/$id`}
                params={{ id: project.id }}
                className="text-[#553CFF] text-sm font-bold hover:text-white transition-colors"
              >
                OPEN EDITOR
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  )
}