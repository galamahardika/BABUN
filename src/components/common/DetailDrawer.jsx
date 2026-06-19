import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function DetailDrawer({ open, onClose, title, children, width = 420 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ pointerEvents: open ? 'auto' : 'none' }}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(10,14,19,0.6)' }} onClick={onClose} />

      {/* Panel */}
      <div
        className="drawer-enter relative flex flex-col border-l overflow-hidden"
        style={{
          width, background: '#131922', borderColor: '#1F2937',
          height: '100%', boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
        }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
             style={{ borderColor: '#1F2937' }}>
          <h3 className="font-semibold text-sm" style={{ fontFamily: 'Space Grotesk', color: '#E8EDF2' }}>
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:opacity-70">
            <X size={16} color="#7C8A99" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
