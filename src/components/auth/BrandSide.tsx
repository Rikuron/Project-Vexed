import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function BrandSide() {
  const navigate = useNavigate()

  return (
    <div className="hidden lg:flex flex-col justify-center px-16 xl:px-32 w-1/2 relative">
      <button 
        onClick={() => navigate({ to: '/' })}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </button>

      <div className="max-w-lg">
        <div className="mb-4 block">
          <img 
            src="/wordmark.png" 
            alt="Vexed Wordmark" 
            className="w-full max-w-[320px] h-auto object-contain drop-shadow-[0_0_15px_rgba(85,60,255,0.4)]"
          />
        </div>
        
        <h2 className="text-[32px] leading-[1.2] font-bold tracking-tight mb-2">
          Turn your daily <span className="text-[#553CFF]">frustrations</span> into someone's next <span className="text-[#553CFF]">mission</span>
        </h2>
      </div>
    </div>
  )
}
