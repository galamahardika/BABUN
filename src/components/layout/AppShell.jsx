import NavRail from './NavRail'
import TopBar from './TopBar'
import ClassificationBanner from './ClassificationBanner'

export default function AppShell({ children }) {
  return (
    <div className="flex flex-col" style={{ height: '100dvh', background: '#0A0E13' }}>
      <ClassificationBanner />
      <div className="flex flex-1 overflow-hidden">
        <NavRail />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto" style={{ background: '#0A0E13' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
