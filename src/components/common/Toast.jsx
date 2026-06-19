import { useEffect, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function Toast({ toasts, onDismiss, onView }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" style={{ pointerEvents: 'none' }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} onView={() => onView(t)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss, onView }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300) }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const borderColor = {
    critical: '#EF4444', high: '#F59E0B', moderate: '#FACC15', info: '#3B82F6'
  }[toast.level] || '#3B82F6'

  return (
    <div
      style={{
        pointerEvents: 'auto',
        background: '#1A2230',
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        width: 320,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 300ms ease, opacity 300ms ease',
      }}>
      <div className="flex items-start gap-3 px-4 py-3">
        <AlertTriangle size={14} style={{ color: borderColor, flexShrink: 0, marginTop: 1 }} />
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{ color: '#E8EDF2' }}>{toast.title}</p>
          <p className="text-xs mt-0.5" style={{ color: '#7C8A99' }}>{toast.body}</p>
        </div>
        <button onClick={onDismiss} className="p-0.5 hover:opacity-70">
          <X size={12} color="#7C8A99" />
        </button>
      </div>
      <div className="flex gap-2 px-4 pb-3">
        <button onClick={onView}
                className="text-xs px-3 py-1 rounded font-medium"
                style={{ background: borderColor + '22', color: borderColor, border: `1px solid ${borderColor}44` }}>
          Lihat
        </button>
        <button onClick={onDismiss}
                className="text-xs px-3 py-1 rounded"
                style={{ color: '#7C8A99', border: '1px solid #1F2937' }}>
          Tandai Ditinjau
        </button>
      </div>
    </div>
  )
}
