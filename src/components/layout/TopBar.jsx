import { Bell, Search, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const ALERTS_MOCK = [
  { id: 1, text: 'Peringatan Kritis: Wilayah Simulasi 4', time: '2 mnt lalu', level: 'critical' },
  { id: 2, text: 'Laporan baru menunggu validasi', time: '8 mnt lalu', level: 'moderate' },
  { id: 3, text: 'Sinkronisasi Satuan W-07 gagal', time: '15 mnt lalu', level: 'high' },
]

export default function TopBar() {
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)

  const levelColor = { critical: '#EF4444', high: '#F59E0B', moderate: '#FACC15' }

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b"
         style={{ background: '#131922', borderColor: '#1F2937', height: 48 }}>
      {/* Search */}
      <div className="flex items-center gap-2 flex-1 max-w-sm rounded-lg px-3 py-1.5"
           style={{ background: '#1A2230', border: '1px solid #1F2937' }}>
        <Search size={14} color="#7C8A99" />
        <input
          placeholder="Cari entitas, laporan, wilayah…"
          className="bg-transparent text-sm outline-none flex-1"
          style={{ color: '#E8EDF2', fontFamily: 'Inter' }}
        />
      </div>

      <div className="flex-1" />

      {/* Notification bell */}
      <div className="relative">
        <button
          onClick={() => { setShowNotif(v => !v); setShowUser(false) }}
          className="relative p-2 rounded-lg hover:opacity-80 transition-opacity"
          style={{ background: '#1A2230' }}>
          <Bell size={16} color="#7C8A99" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: '#EF4444' }} />
        </button>
        {showNotif && (
          <div className="absolute right-0 top-10 w-72 rounded-xl shadow-2xl z-50 border"
               style={{ background: '#1A2230', borderColor: '#1F2937' }}>
            <div className="px-4 py-2 border-b text-xs font-semibold"
                 style={{ borderColor: '#1F2937', color: '#7C8A99' }}>
              NOTIFIKASI TERBARU
            </div>
            {ALERTS_MOCK.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-4 py-3 border-b hover:opacity-80 cursor-pointer"
                   style={{ borderColor: '#1F2937' }}>
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                     style={{ background: levelColor[a.level] }} />
                <div>
                  <p className="text-xs" style={{ color: '#E8EDF2' }}>{a.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7C8A99' }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="relative">
        <button
          onClick={() => { setShowUser(v => !v); setShowNotif(false) }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:opacity-80"
          style={{ background: '#1A2230' }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
               style={{ background: '#3B82F6', color: '#fff', fontFamily: 'Space Grotesk' }}>
            AP
          </div>
          <span className="text-xs" style={{ color: '#E8EDF2' }}>Analis Pusat</span>
          <ChevronDown size={12} color="#7C8A99" />
        </button>
        {showUser && (
          <div className="absolute right-0 top-10 w-44 rounded-xl shadow-2xl z-50 border py-1"
               style={{ background: '#1A2230', borderColor: '#1F2937' }}>
            {['Profil Saya', 'Pengaturan', 'Keluar'].map(item => (
              <button key={item} className="w-full text-left px-4 py-2 text-xs hover:opacity-70"
                      style={{ color: '#E8EDF2' }}>
                {item}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
