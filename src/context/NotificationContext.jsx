import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

const INITIAL_ALERTS = [
  { id: 'WRN-2024-000041', text: 'Peningkatan aktivitas terdeteksi di Wilayah Simulasi 4', level: 'critical', time: new Date(Date.now() - 2 * 60000).toISOString(), read: false, module: '/early-warning' },
  { id: 'WRN-2024-000039', text: 'Laporan RPT-2024-000312 menunggu validasi analis', level: 'high', time: new Date(Date.now() - 8 * 60000).toISOString(), read: false, module: '/laporan-intelijen' },
  { id: 'WRN-2024-000037', text: 'Sinkronisasi SAT-FLD-007 gagal — periksa koneksi', level: 'high', time: new Date(Date.now() - 15 * 60000).toISOString(), read: false, module: '/jaringan-intelijen' },
  { id: 'WRN-2024-000034', text: 'Pertukaran data EXC-2024-000091 diselesaikan', level: 'info', time: new Date(Date.now() - 32 * 60000).toISOString(), read: true, module: '/pertukaran-informasi' },
  { id: 'WRN-2024-000031', text: 'Indikator A-104 melampaui ambang batas di WIL-009', level: 'moderate', time: new Date(Date.now() - 58 * 60000).toISOString(), read: true, module: '/analisis-ancaman' },
]

export function NotificationProvider({ children }) {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)

  const unread = alerts.filter(a => !a.read)
  const critical = unread.find(a => a.level === 'critical') || unread[0] || null

  const markRead = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
  }, [])

  const markAllRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }, [])

  const dismiss = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  const addAlert = useCallback((alert) => {
    setAlerts(prev => [{ ...alert, id: `WRN-${Date.now()}`, time: new Date().toISOString(), read: false }, ...prev])
  }, [])

  return (
    <NotificationContext.Provider value={{ alerts, unread, critical, markRead, markAllRead, dismiss, addAlert }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider')
  return ctx
}
