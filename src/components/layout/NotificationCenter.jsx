import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X, Check, ChevronRight, AlertTriangle, Info } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { formatRelative } from '../../utils/time'

const LEVEL_CONFIG = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  icon: AlertTriangle },
  high:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: AlertTriangle },
  moderate: { color: '#FACC15', bg: 'rgba(250,204,21,0.1)', icon: AlertTriangle },
  info:     { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: Info },
}

export default function NotificationCenter({ open, onClose }) {
  const { alerts, unread, markRead, markAllRead, dismiss } = useNotifications()
  const nav = useNavigate()
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={ref} style={{
      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
      width: 340, maxHeight: 480,
      background: '#131922', border: '1px solid #1F2937',
      borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
      display: 'flex', flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #1F2937' }}>
        <Bell size={14} color="#7C8A99" style={{ marginRight: 8 }} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#E8EDF2', fontFamily: 'Space Grotesk' }}>
          Notifikasi
          {unread.length > 0 && (
            <span style={{ marginLeft: 6, fontSize: 10, background: '#EF4444', color: '#fff', borderRadius: 8, padding: '1px 6px', fontFamily: 'Inter', fontWeight: 700 }}>
              {unread.length}
            </span>
          )}
        </span>
        {unread.length > 0 && (
          <button onClick={markAllRead} title="Tandai semua dibaca"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', fontSize: 10, fontFamily: 'Inter', marginRight: 8 }}>
            <Check size={13} />
          </button>
        )}
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C8A99', padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {/* Alert list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {alerts.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#4B5563', fontSize: 12, fontFamily: 'Inter' }}>
            Tidak ada notifikasi
          </div>
        )}
        {alerts.map(a => {
          const cfg = LEVEL_CONFIG[a.level] || LEVEL_CONFIG.info
          const Icon = cfg.icon
          return (
            <div
              key={a.id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '11px 14px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: a.read ? 'transparent' : 'rgba(255,255,255,0.02)',
                cursor: a.module ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (a.module) { markRead(a.id); nav(a.module); onClose() }
              }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon size={13} color={cfg.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, color: a.read ? '#7C8A99' : '#E8EDF2', margin: 0, lineHeight: 1.4, fontFamily: 'Inter' }}>{a.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}>{a.id}</span>
                  <span style={{ fontSize: 9, color: '#374151' }}>•</span>
                  <span style={{ fontSize: 10, color: '#4B5563', fontFamily: 'Inter' }}>{formatRelative(a.waktu ?? a.time)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                {!a.read && <span style={{ width: 6, height: 6, borderRadius: 3, background: cfg.color }} />}
                <button
                  onClick={e => { e.stopPropagation(); dismiss(a.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 2, opacity: 0, transition: 'opacity 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                  <X size={11} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
