import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Map, AlertTriangle, Network, FileInput,
  BarChart3, ArrowLeftRight, FileText, Database, Brain,
  Users, Shield, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import { canAccess } from '../../data/schema'

const GROUPS = [
  {
    label: 'Beranda',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard Pimpinan', path: '/', code: 'A.8' },
    ],
  },
  {
    label: 'Kesadaran Situasional',
    items: [
      { icon: Map, label: 'Peta & Monitoring', path: '/peta-monitoring', code: 'A.5/A.6' },
      { icon: AlertTriangle, label: 'Early Warning', path: '/early-warning', code: 'A.4', badgeKey: 'earlyWarning' },
    ],
  },
  {
    label: 'Input & Analisis',
    items: [
      { icon: FileInput, label: 'Pengumpulan Informasi', path: '/pengumpulan-informasi', code: 'A.2', badgeKey: 'pending' },
      { icon: BarChart3, label: 'Analisis Ancaman', path: '/analisis-ancaman', code: 'A.3' },
      { icon: Brain, label: 'Decision Support', path: '/decision-support', code: 'A.11' },
    ],
  },
  {
    label: 'Jaringan & Output',
    items: [
      { icon: Network, label: 'Jaringan Intelijen', path: '/jaringan-intelijen', code: 'A.1' },
      { icon: ArrowLeftRight, label: 'Pertukaran Informasi', path: '/pertukaran-informasi', code: 'A.7' },
      { icon: FileText, label: 'Laporan Intelijen', path: '/laporan-intelijen', code: 'A.9' },
      { icon: Database, label: 'Repository Data', path: '/repository-data', code: 'A.10' },
    ],
  },
  {
    label: 'Administrasi',
    items: [
      { icon: Users, label: 'Pengguna & Hak Akses', path: '/admin/pengguna', code: 'A.12' },
      { icon: Shield, label: 'Audit & Kepatuhan', path: '/admin/audit-keamanan', code: 'A.13' },
    ],
  },
]

const INACTIVE_SYSTEMS = [
  { label: 'Sistem B', desc: 'Analitik Prediktif' },
  { label: 'Sistem C', desc: 'Manajemen Aset' },
  { label: 'Sistem D', desc: 'Komunikasi Aman' },
  { label: 'Sistem E', desc: 'Koordinasi Lapangan' },
  { label: 'Sistem F', desc: 'Pelatihan & Simulasi' },
  { label: 'Sistem G', desc: 'Pelaporan Eksternal' },
]

function readCollapsed() {
  try { return localStorage.getItem('navrail_collapsed') === 'true' } catch { return false }
}

function writeCollapsed(v) {
  try { localStorage.setItem('navrail_collapsed', String(v)) } catch {}
}

function Badge({ count }) {
  if (!count) return null
  return (
    <span style={{
      minWidth: 16, height: 16, borderRadius: 8,
      background: '#EF4444', color: '#fff',
      fontSize: 9, fontWeight: 700, fontFamily: 'Inter',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 4px',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

function NavItem({ icon: Icon, label, path, code, expanded, badge }) {
  const location = useLocation()
  const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <NavLink
      to={path}
      title={!expanded ? label : undefined}
      className="flex items-center gap-3 px-3 py-2 rounded-lg mx-2 transition-all duration-150 group"
      style={{
        background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
        color: isActive ? '#3B82F6' : '#7C8A99',
        boxShadow: isActive ? '0 0 12px rgba(59,130,246,0.2)' : 'none',
      }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Icon size={16} style={{ color: isActive ? '#3B82F6' : '#7C8A99' }} />
        {!expanded && badge > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -5, minWidth: 13, height: 13, borderRadius: 7, background: '#EF4444', color: '#fff', fontSize: 8, fontWeight: 700, fontFamily: 'Inter', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
            {badge > 99 ? '!' : badge}
          </span>
        )}
      </div>
      {expanded && (
        <span className="text-xs font-medium truncate flex-1" style={{ fontFamily: 'Inter' }}>
          {label}
        </span>
      )}
      {expanded && badge > 0 && <Badge count={badge} />}
      {expanded && !badge && (
        <span className="text-xs shrink-0" style={{ color: '#374151', fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }}>
          {code}
        </span>
      )}
    </NavLink>
  )
}

function Group({ group, expanded, badges }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-1">
      {expanded && (
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 px-5 py-1 w-full text-left">
          <span className="text-xs uppercase tracking-widest font-semibold flex-1"
                style={{ color: '#374151', fontSize: 9, letterSpacing: '0.1em' }}>
            {group.label}
          </span>
          {open
            ? <ChevronDown size={10} color="#374151" />
            : <ChevronRight size={10} color="#374151" />}
        </button>
      )}
      {(open || !expanded) && group.items.map(item => (
        <NavItem
          key={item.path}
          {...item}
          expanded={expanded}
          badge={item.badgeKey ? (badges[item.badgeKey] || 0) : 0}
        />
      ))}
    </div>
  )
}

export default function NavRail() {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const { unread } = useNotifications()
  const { user } = useAuth()

  const expanded = !collapsed
  const role = user?.role || 'operator'

  const toggle = () => {
    setCollapsed(v => {
      writeCollapsed(!v)
      return !v
    })
  }

  // Badge counts
  const badges = {
    earlyWarning: unread.filter(a => a.module === '/early-warning' || a.level === 'critical').length,
    pending: 3, // mock pending laporan count in A.2
  }

  return (
    <aside
      className="flex flex-col border-r shrink-0"
      style={{
        width: expanded ? 220 : 56,
        minWidth: expanded ? 220 : 56,
        background: '#131922',
        borderColor: '#1F2937',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'width 200ms cubic-bezier(0.4,0,0.2,1)',
      }}>
      {/* Logo + collapse toggle */}
      <div className="flex items-center gap-3 px-3 py-3 border-b shrink-0"
           style={{ borderColor: '#1F2937', height: 48 }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
             style={{ background: 'linear-gradient(135deg,#3B82F6,#22D3D8)', boxShadow: '0 0 12px rgba(59,130,246,0.35)' }}>
          <span className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>A</span>
        </div>
        {expanded && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-none" style={{ color: '#E8EDF2', fontFamily: 'Space Grotesk' }}>Sistem A</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: '#7C8A99', fontSize: 9 }}>BNPT Intel</p>
            </div>
          </>
        )}
        <button
          onClick={toggle}
          title={expanded ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
          className="shrink-0 p-1 rounded-md transition-colors"
          style={{ color: '#7C8A99' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#E8EDF2' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#7C8A99' }}>
          {expanded
            ? <PanelLeftClose size={15} />
            : <PanelLeftOpen  size={15} />}
        </button>
      </div>

      {/* Nav groups — filter items by RBAC */}
      <div className="flex-1 py-2">
        {GROUPS.map(g => {
          const visibleItems = g.items.filter(item => canAccess(role, item.path))
          if (visibleItems.length === 0) return null
          return <Group key={g.label} group={{ ...g, items: visibleItems }} expanded={expanded} badges={badges} />
        })}
      </div>

      {/* Inactive systems */}
      <div className="border-t pt-2 pb-3 shrink-0" style={{ borderColor: '#1F2937' }}>
        {expanded && (
          <p className="px-5 py-1 text-xs uppercase tracking-widest font-semibold"
             style={{ color: '#2D3748', fontSize: 9, letterSpacing: '0.1em' }}>
            Platform Lainnya
          </p>
        )}
        {INACTIVE_SYSTEMS.map(s => (
          <div key={s.label}
               title={`${s.label} — ${s.desc} (Belum tersedia)`}
               className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg cursor-not-allowed select-none"
               style={{ opacity: 0.25 }}>
            <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                 style={{ background: '#1F2937' }}>
              <span style={{ color: '#7C8A99', fontSize: 8, fontFamily: 'JetBrains Mono, monospace' }}>
                {s.label.split(' ')[1]}
              </span>
            </div>
            {expanded && (
              <span className="text-xs truncate" style={{ color: '#7C8A99', fontFamily: 'Inter' }}>
                {s.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}
