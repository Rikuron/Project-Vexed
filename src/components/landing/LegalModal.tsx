import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface LegalModalProps {
  title: string
  content: ReactNode
  onClose: () => void
}

export default function LegalModal({ title, content, onClose }: LegalModalProps) {
  const modalContent = (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
      {/* Dark frosted background overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative bg-vexed-bg1 border border-vexed-accent2 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-vexed-accent2 bg-vexed-bg2/50">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 text-vexed-dim hover:text-white cursor-pointer rounded-full hover:bg-vexed-accent2 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto text-vexed-dim space-y-6 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  )

  // Use createPortal to render the modal directly into the document.body
  // This breaks it out of any parent z-index constraints!
  // The 'typeof document !== undefined' check ensures it doesn't crash during Server-Side Rendering.
  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}