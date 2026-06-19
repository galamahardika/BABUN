import { useState, useCallback } from 'react'
import { Bell, ChevronDown, Lock, LogOut, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import NotificationCenter from './NotificationCenter'

export default function TopBar({ onOpenPalette }) {
  const { user, lock, logout } = useAuth()
  const { unread } = useNotifications()

  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)

  const closeAll = useCallback(() => { setShowNotif(false); setShowUser(false) }, [])

  return (
    <div className="flex items-center gap-3 px-4 border-b"
         style={{ background: '#131922', borderColor: '#1F2937', height: 48, position: 'relative' }}>

      {/* Search / Command Palette trigger */}
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2 flex-1 max-w-sm rounded-lg px-3 py-1.5 text-left"
        style={{ background: '#1A2230', border: '1px solid #1F2937', cursor: 'text' }}>
        <Search size={14} color="#7C8A99" />
        <span className="text-sm flex-1" style={{ color: '#4B5563', fontFamily: 'Inter' }}>
          Cari modul, laporan, wilayah…
        </span>
        <kbd style={{ fontSize: 9, color: '#374151', fontFamily: 'JetBrains Mono, monospace', background: 'rgba(255,255,255,0.04)', border: '1px solid #1F2937', borderRadius: 3, padding: '1px 5px' }}>
          Ctrl+K
        </kbd>
      </button>

      <div className="flex-1" />

      {/* Notification bell */}
      <div className="relative">
        <button
          onClick={() => { setShowNotif(v => !v); setShowUser(false) }}
          className="relative p-2 rounded-lg transition-opacity"
          style={{ background: '#1A2230' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <Bell size={16} color="#7C8A99" />
          {unread.length > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center"
                  style={{ minWidth: 14, height: 14, borderRadius: 7, background: '#EF4444', fontSize: 8, color: '#fff', fontWeight: 700, fontFamily: 'Inter', padding: '0 2px' }}>
              {unread.length > 9 ? '9+' : unread.length}
            </span>
          )}
        </button>
        <NotificationCenter open={showNotif} onClose={() => setShowNotif(false)} />
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => { setShowUser(v => !v); setShowNotif(false) }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: '#1A2230' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
               style={{ background: user?.avatarColor || '#3B82F6', color: '#fff', fontFamily: 'Space Grotesk', fontSize: 9 }}>
            {user?.avatar || '??'}
          </div>
          <span className="text-xs" style={{ color: '#E8EDF2', fontFamily: 'Inter' }}>
            {user?.nama || 'Pengguna'}
          </span>
          <ChevronDown size={12} color="#7C8A99" />
        </button>

        {showUser && (
          <div className="absolute right-0 top-10 rounded-xl shadow-2xl z-50 border py-1"
               style={{ background: '#1A2230', borderColor: '#1F2937', width: 200, minWidth: 180 }}>
            {/* User info */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #1F2937' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#E8EDF2', margin: 0, fontFamily: 'Space Grotesk' }}>{user?.nama}</p>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: '2px 0 0', fontFamily: 'Inter' }}>{user?.jabatan}</p>
              <p style={{ fontSize: 9, color: '#374151', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>{user?.id}</p>
            </div>

            <button onClick={() => { lock(); closeAll() }}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs"
              style={{ color: '#7C8A99', fontFamily: 'Inter', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <Lock size={12} /> Kunci Sesi
            </button>

            <button onClick={() => { logout(); closeAll() }}
              className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs"
              style={{ color: '#EF4444', fontFamily: 'Inter', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <LogOut size={12} /> Keluar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
