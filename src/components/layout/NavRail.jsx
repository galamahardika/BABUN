import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Map, AlertTriangle, Network, FileInput,
  BarChart3, ArrowLeftRight, FileText, Database, Brain,
  Users, Shield, ChevronDown, ChevronRight
} from 'lucide-react'

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
      { icon: AlertTriangle, label: 'Early Warning', path: '/early-warning', code: 'A.4' },
    ],
  },
  {
    label: 'Input & Analisis',
    items: [
      { icon: FileInput, label: 'Pengumpulan Informasi', path: '/pengumpulan-informasi', code: 'A.2' },
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

function NavItem({ icon: Icon, label, path, code, expanded }) {
  const location = useLocation()
  const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <NavLink to={path} title={!expanded ? label : undefined}
      className="flex items-center gap-3 px-3 py-2 rounded-lg mx-2 transition-all duration-150 group"
      style={{
        background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
        color: isActive ? '#3B82F6' : '#7C8A99',
        boxShadow: isActive ? '0 0 12px rgba(59,130,246,0.2)' : 'none',
      }}>
      <Icon size={16} style={{ color: isActive ? '#3B82F6' : '#7C8A99', flexShrink: 0 }} />
      {expanded && (
        <span className="text-xs font-medium truncate flex-1" style={{ fontFamily: 'Inter' }}>
          {label}
        </span>
      )}
      {expanded && (
        <span className="text-xs shrink-0" style={{ color: '#1F2937', fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }}>
          {code}
        </span>
      )}
    </NavLink>
  )
}

function Group({ group, expanded }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-1">
      {expanded && (
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1 px-5 py-1 w-full text-left"
          style={{ color: '#1F2937' }}>
          <span className="text-xs uppercase tracking-widest font-semibold flex-1"
                style={{ color: '#7C8A99', fontSize: 9, letterSpacing: '0.1em' }}>
            {group.label}
          </span>
          {open
            ? <ChevronDown size={10} color="#7C8A99" />
            : <ChevronRight size={10} color="#7C8A99" />}
        </button>
      )}
      {(open || !expanded) && group.items.map(item => (
        <NavItem key={item.path} {...item} expanded={expanded} />
      ))}
    </div>
  )
}

export default function NavRail() {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className="nav-rail flex flex-col border-r shrink-0"
      style={{
        width: expanded ? 220 : 56,
        background: '#131922',
        borderColor: '#1F2937',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-3 border-b shrink-0"
           style={{ borderColor: '#1F2937', height: 48 }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
             style={{ background: 'linear-gradient(135deg,#3B82F6,#22D3D8)', boxShadow: '0 0 12px rgba(59,130,246,0.35)' }}>
          <span className="text-xs font-bold text-white" style={{ fontFamily: 'Space Grotesk' }}>A</span>
        </div>
        {expanded && (
          <div>
            <p className="text-xs font-bold leading-none" style={{ color: '#E8EDF2', fontFamily: 'Space Grotesk' }}>Sistem A</p>
            <p className="text-xs leading-none mt-0.5" style={{ color: '#7C8A99', fontSize: 9 }}>BNPT Intel</p>
          </div>
        )}
      </div>

      {/* Groups */}
      <div className="flex-1 py-2">
        {GROUPS.map(g => <Group key={g.label} group={g} expanded={expanded} />)}
      </div>

      {/* Inactive systems B-G */}
      <div className="border-t pt-2 pb-3 shrink-0" style={{ borderColor: '#1F2937' }}>
        {expanded && (
          <p className="px-5 py-1 text-xs uppercase tracking-widest font-semibold"
             style={{ color: '#1F2937', fontSize: 9, letterSpacing: '0.1em' }}>
            Platform Lainnya
          </p>
        )}
        {INACTIVE_SYSTEMS.map(s => (
          <div key={s.label}
               title={expanded ? `${s.label}: ${s.desc} — Belum tersedia di fase ini` : `${s.label} — Belum tersedia di fase ini`}
               className="flex items-center gap-3 px-3 py-2 mx-2 rounded-lg cursor-not-allowed select-none"
               style={{ opacity: 0.3 }}>
            <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                 style={{ background: '#1F2937' }}>
              <span className="text-xs" style={{ color: '#7C8A99', fontSize: 8, fontFamily: 'JetBrains Mono, monospace' }}>
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
