import { Link } from '@tanstack/react-router'
import { Rocket } from 'lucide-react'

interface ActiveProject {
  name: string
  id: string
  status: 'In Progress' | 'Testing' | 'Review'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  time: string
}

const statusStyles: Record<string, string> = {
  'In Progress': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Testing': 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  'Review': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
}

const MOCK_PROJECTS: ActiveProject[] = [
  { name: 'Optimize Redux Store', id: '#RE-402', status: 'In Progress', difficulty: 'Hard', time: '4h 20m' },
  { name: 'Async Auth Flow',      id: '#AU-119', status: 'Testing',     difficulty: 'Medium', time: '2h 15m' },
]

export default function ActiveProjectsTable() {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Rocket className="text-[#553CFF]" size={20} /> Active Projects
        </h2>
        <Link to="/my/claimed" className="text-[#553CFF] text-sm font-semibold hover:text-white transition-colors">
          View all tasks
        </Link>
      </div>
      <div className="bg-[#151320] border border-white/5 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-white/5 text-[10px] font-bold tracking-widest uppercase text-slate-500">
          <span>Problem Name</span>
          <span>Status</span>
          <span>Difficulty</span>
          <span>Time</span>
          <span>Action</span>
        </div>
        {/* Table Rows */}
        {MOCK_PROJECTS.map((project) => (
          <div
            key={project.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center border-b border-white/5 last:border-b-0 hover:bg-white/2 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-white">{project.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">ID: {project.id}</p>
            </div>
            <div>
              <span className={`inline-flex px-2.5 py-1 rounded text-[10px] font-bold border ${statusStyles[project.status]}`}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-300">{project.difficulty}</span>
            <span className="text-sm text-slate-300">{project.time}</span>
            <Link
              to="/my/claimed"
              className="text-[#553CFF] text-sm font-bold hover:text-white transition-colors"
            >
              OPEN EDITOR
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}