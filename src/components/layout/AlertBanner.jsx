import { useNavigate } from 'react-router-dom'
import { AlertTriangle, X, ChevronRight } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

const LEVEL_COLOR = {
  critical: { bg: '#1A0505', border: '#7F1D1D', text: '#EF4444', dot: '#EF4444' },
  high:     { bg: '#1A0E02', border: '#78350F', text: '#F59E0B', dot: '#F59E0B' },
  moderate: { bg: '#1A1502', border: '#713F12', text: '#FACC15', dot: '#FACC15' },
  info:     { bg: '#020F1A', border: '#1E3A5F', text: '#3B82F6', dot: '#3B82F6' },
}

export default function AlertBanner() {
  const { critical, markRead, dismiss } = useNotifications()
  const nav = useNavigate()

  if (!critical) return null

  const c = LEVEL_COLOR[critical.level] || LEVEL_COLOR.info

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 16px',
      background: c.bg,
      borderBottom: `1px solid ${c.border}`,
      minHeight: 36,
    }}>
      <AlertTriangle size={13} color={c.dot} style={{ flexShrink: 0 }} />

      <span style={{ flex: 1, fontSize: 11, color: c.text, fontFamily: 'Inter', lineHeight: 1.4 }}>
        {critical.text}
      </span>

      {critical.module && (
        <button
          onClick={() => { markRead(critical.id); nav(critical.module) }}
          style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: c.text, fontSize: 10, fontFamily: 'Inter', opacity: 0.8, flexShrink: 0 }}>
          Lihat <ChevronRight size={10} />
        </button>
      )}

      <button
        onClick={() => dismiss(critical.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.5, padding: 2, flexShrink: 0 }}>
        <X size={12} />
      </button>
    </div>
  )
}
