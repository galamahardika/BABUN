import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import NavRail from './NavRail'
import TopBar from './TopBar'
import ClassificationBanner from './ClassificationBanner'
import AlertBanner from './AlertBanner'
import CommandPalette from '../common/CommandPalette'

export default function AppShell({ children }) {
  const nav = useNavigate()
  const [paletteOpen, setPaletteOpen] = useState(false)

  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(v => !v)
        return
      }
      // Only fire shortcuts when not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return

      if (ctrl && e.key === 'd') { e.preventDefault(); nav('/') }
      if (ctrl && e.key === 'e') { e.preventDefault(); nav('/early-warning') }
      if (ctrl && e.key === 'm') { e.preventDefault(); nav('/peta-monitoring') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [nav])

  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: '#0A0E13' }}>
      <ClassificationBanner />
      <AlertBanner />
      <div className="flex flex-1 overflow-hidden">
        <NavRail />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar onOpenPalette={openPalette} />
          <main className="flex-1 overflow-auto" style={{ background: '#0A0E13' }}>
            {children}
          </main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={closePalette} />
    </div>
  )
}
