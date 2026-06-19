import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, LayoutDashboard, Map, AlertTriangle, Network, FileInput, BarChart3, ArrowLeftRight, FileText, Database, Brain, Users, Shield, Keyboard, X } from 'lucide-react'

const PAGES = [
  { label: 'Dashboard Pimpinan',     path: '/',                       code: 'A.8',     icon: LayoutDashboard, group: 'Beranda' },
  { label: 'Peta & Monitoring',       path: '/peta-monitoring',        code: 'A.5/A.6', icon: Map,             group: 'Kesadaran Situasional' },
  { label: 'Early Warning',           path: '/early-warning',          code: 'A.4',     icon: AlertTriangle,   group: 'Kesadaran Situasional' },
  { label: 'Pengumpulan Informasi',   path: '/pengumpulan-informasi',  code: 'A.2',     icon: FileInput,       group: 'Input & Analisis' },
  { label: 'Analisis Ancaman',        path: '/analisis-ancaman',       code: 'A.3',     icon: BarChart3,       group: 'Input & Analisis' },
  { label: 'Decision Support',        path: '/decision-support',       code: 'A.11',    icon: Brain,           group: 'Input & Analisis' },
  { label: 'Jaringan Intelijen',      path: '/jaringan-intelijen',     code: 'A.1',     icon: Network,         group: 'Jaringan & Output' },
  { label: 'Pertukaran Informasi',    path: '/pertukaran-informasi',   code: 'A.7',     icon: ArrowLeftRight,  group: 'Jaringan & Output' },
  { label: 'Laporan Intelijen',       path: '/laporan-intelijen',      code: 'A.9',     icon: FileText,        group: 'Jaringan & Output' },
  { label: 'Repository Data',         path: '/repository-data',        code: 'A.10',    icon: Database,        group: 'Jaringan & Output' },
  { label: 'Pengguna & Hak Akses',   path: '/admin/pengguna',         code: 'A.12',    icon: Users,           group: 'Administrasi' },
  { label: 'Audit & Kepatuhan',       path: '/admin/audit-keamanan',   code: 'A.13',    icon: Shield,          group: 'Administrasi' },
]

const SHORTCUTS = [
  { key: 'Ctrl+D', desc: 'Dashboard Pimpinan' },
  { key: 'Ctrl+E', desc: 'Early Warning' },
  { key: 'Ctrl+M', desc: 'Peta & Monitoring' },
  { key: 'Ctrl+K', desc: 'Buka Command Palette' },
  { key: '?',      desc: 'Tampilkan shortcut (di palette)' },
  { key: '↑ ↓',   desc: 'Navigasi hasil' },
  { key: 'Enter',  desc: 'Pilih hasil' },
  { key: 'Esc',    desc: 'Tutup palette' },
]

function groupResults(results) {
  const groups = {}
  results.forEach(item => {
    if (!groups[item.group]) groups[item.group] = []
    groups[item.group].push(item)
  })
  return Object.entries(groups)
}

export default function CommandPalette({ open, onClose }) {
  const nav = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const filtered = query === '?'
    ? []
    : PAGES.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.code.toLowerCase().includes(query.toLowerCase()) ||
        p.group.toLowerCase().includes(query.toLowerCase())
      )

  const flat = filtered

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setShowShortcuts(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setSelected(0) }, [query])

  const go = useCallback((path) => {
    nav(path)
    onClose()
  }, [nav, onClose])

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, flat.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && flat[selected]) go(flat[selected].path)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, flat, selected, go, onClose])

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-selected="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  const grouped = groupResults(flat)
  let idx = 0 // running index across groups

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: 560, background: '#131922', border: '1px solid #1F2937', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', overflow: 'hidden' }}>

        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #1F2937' }}>
          <Search size={16} color="#7C8A99" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setShowShortcuts(e.target.value === '?')
            }}
            placeholder="Cari modul, kode (mis. A.4), atau ketik ? untuk shortcut…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#E8EDF2', fontSize: 14, fontFamily: 'Inter' }}
          />
          <button onClick={() => setShowShortcuts(v => !v)} title="Shortcut keyboard" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: showShortcuts ? '#3B82F6' : '#7C8A99' }}>
            <Keyboard size={14} />
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#7C8A99' }}>
            <X size={14} />
          </button>
        </div>

        {/* Shortcuts panel */}
        {(showShortcuts || query === '?') && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1F2937' }}>
            <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 10px', fontFamily: 'Inter', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Shortcut Keyboard</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {SHORTCUTS.map(s => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <kbd style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#3B82F6', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>{s.key}</kbd>
                  <span style={{ fontSize: 11, color: '#7C8A99', fontFamily: 'Inter' }}>{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 360, overflowY: 'auto' }}>
          {query && !showShortcuts && flat.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#4B5563', fontSize: 13, fontFamily: 'Inter' }}>
              Tidak ada hasil untuk "{query}"
            </div>
          )}
          {!query && !showShortcuts && (
            <div style={{ padding: '16px', paddingBottom: 0 }}>
              <p style={{ fontSize: 10, color: '#4B5563', margin: '0 0 8px', fontFamily: 'Inter', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Semua Modul</p>
            </div>
          )}
          {grouped.map(([group, items]) => {
            const groupStart = idx
            idx += items.length
            return (
              <div key={group}>
                <p style={{ fontSize: 10, color: '#4B5563', margin: 0, padding: '10px 16px 4px', fontFamily: 'Inter', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{group}</p>
                {items.map((item, i) => {
                  const itemIdx = groupStart + i
                  const isSelected = itemIdx === selected
                  const Icon = item.icon
                  return (
                    <div
                      key={item.path}
                      data-selected={isSelected}
                      onClick={() => go(item.path)}
                      onMouseEnter={() => setSelected(itemIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 16px', cursor: 'pointer',
                        background: isSelected ? 'rgba(59,130,246,0.12)' : 'transparent',
                        borderLeft: `2px solid ${isSelected ? '#3B82F6' : 'transparent'}`,
                        transition: 'background 100ms',
                      }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: isSelected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={14} color={isSelected ? '#3B82F6' : '#7C8A99'} />
                      </div>
                      <span style={{ flex: 1, fontSize: 13, color: isSelected ? '#E8EDF2' : '#A0ADB8', fontFamily: 'Inter' }}>{item.label}</span>
                      <span style={{ fontSize: 10, color: '#3B82F6', fontFamily: 'JetBrains Mono, monospace', opacity: isSelected ? 1 : 0.5 }}>{item.code}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}
          <div style={{ height: 8 }} />
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid #1F2937', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#374151', fontFamily: 'Inter' }}>↑↓ navigasi</span>
          <span style={{ fontSize: 10, color: '#374151', fontFamily: 'Inter' }}>↵ pilih</span>
          <span style={{ fontSize: 10, color: '#374151', fontFamily: 'Inter' }}>Esc tutup</span>
          <span style={{ fontSize: 10, color: '#374151', fontFamily: 'Inter' }}>? shortcut</span>
        </div>
      </div>
    </div>
  )
}
