import { useState, useRef, useCallback, useEffect } from 'react'
import { RefreshCw, PlusCircle, ChevronDown, Wifi, WifiOff, AlertCircle, Users, Clock, Activity, X, Search } from 'lucide-react'
import OrgTreeViewer from '../components/org/OrgTreeViewer'
import Stepper from '../components/common/Stepper'
import SeverityBadge from '../components/common/SeverityBadge'
import jaringanRaw from '../data/jaringan.json'

const STATUS_CFG = {
  online:  { color: '#22C55E', label: 'Online',  level: 'success' },
  delay:   { color: '#F59E0B', label: 'Delay',   level: 'high'    },
  offline: { color: '#EF4444', label: 'Offline', level: 'critical' },
}

const WILAYAH_OPTS = ['Semua Wilayah', 'Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Maluku & Papua']

function StatBox({ label, value, color }) {
  return (
    <div style={{ background: '#0A0E13', borderRadius: 8, padding: '10px 14px', border: `1px solid ${color}22` }}>
      <p style={{ fontSize: 9, color: '#7C8A99', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color, margin: 0 }}>{value}</p>
    </div>
  )
}

function DetailPanel({ node, onSync, onClose }) {
  if (!node) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, color: '#7C8A99', textAlign: 'center' }}>
      <Activity size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
      <p style={{ fontSize: 13 }}>Pilih satuan atau koordinator wilayah dari pohon jaringan untuk melihat detail</p>
    </div>
  )

  const cfg = STATUS_CFG[node.status] || STATUS_CFG.offline
  const syncAgo = Math.round((Date.now() - new Date(node.syncAt).getTime()) / 60000)

  const steps = [
    { title: 'Sync berhasil terakhir', time: new Date(node.syncAt).toLocaleString('id-ID'), level: 'success', desc: null },
    ...(node.status === 'delay' ? [{ title: 'Keterlambatan sync terdeteksi', time: '—', level: 'high', desc: `${syncAgo} menit sejak sync terakhir` }] : []),
    ...(node.status === 'offline' ? [{ title: 'Koneksi terputus', time: '—', level: 'critical', desc: `Tidak merespons sejak ${syncAgo} menit lalu` }] : []),
    { title: 'Node terdaftar', time: '2024-01-10', level: 'info', desc: null },
  ]

  const isSatuan = !!node.wilayahId

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <SeverityBadge level={cfg.level} label={cfg.label} />
              {isSatuan && <span style={{ fontSize: 10, color: '#7C8A99' }}>Satuan Daerah</span>}
            </div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#E8EDF2', margin: 0 }}>
              {node.nama}
            </h2>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7C8A99', margin: '3px 0 0' }}>
              {node.id}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatBox label="Personel" value={node.personel} color="#3B82F6" />
          <StatBox label="Konektivitas" value={`${node.konektivitas ?? 100}%`} color={cfg.color} />
          {isSatuan && <StatBox label="Indikator Aktif" value={node.indikator ?? 0} color={node.indikator > 0 ? '#F59E0B' : '#22C55E'} />}
          <StatBox label="Wilayah" value={node.wilayah || node.wilayahId || '—'} color="#7C8A99" />
        </div>
      </div>

      {/* Sync info */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sync Terakhir</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#E8EDF2', margin: 0 }}>
              {new Date(node.syncAt).toLocaleString('id-ID')}
              <span style={{ color: '#7C8A99', marginLeft: 6 }}>({syncAgo} mnt lalu)</span>
            </p>
          </div>
          {(node.status === 'delay' || node.status === 'offline') && (
            <button onClick={() => onSync(node.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 14px', borderRadius: 8,
                      border: '1px solid rgba(245,158,11,0.3)',
                      background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                      fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    }}>
              <RefreshCw size={12} /> Coba Sinkronkan Ulang
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Riwayat Status
        </p>
        <Stepper steps={steps} />
      </div>
    </div>
  )
}

function RegistrasiModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ nama: '', wilayah: 'Sumatera', induk: '', personel: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(10,14,19,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#131922', border: '1px solid #1F2937',
        borderRadius: 16, padding: 28, width: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#E8EDF2', margin: 0 }}>
            Registrasi Satuan Baru
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={16} color="#7C8A99" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Nama Satuan', key: 'nama', placeholder: 'mis. Satuan Daerah Bengkulu' },
            { label: 'ID Induk (Korwil)', key: 'induk', placeholder: 'mis. SAT-W-01' },
            { label: 'Jumlah Personel', key: 'personel', placeholder: '12', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, color: '#7C8A99', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {f.label}
              </label>
              <input
                type={f.type || 'text'}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                style={{
                  width: '100%', background: '#1A2230', border: '1px solid #1F2937',
                  borderRadius: 8, padding: '9px 12px', color: '#E8EDF2',
                  fontSize: 13, fontFamily: 'Inter', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#1F2937'}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#7C8A99', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Wilayah
            </label>
            <select value={form.wilayah} onChange={e => set('wilayah', e.target.value)}
                    style={{
                      width: '100%', background: '#1A2230', border: '1px solid #1F2937',
                      borderRadius: 8, padding: '9px 12px', color: '#E8EDF2',
                      fontSize: 13, fontFamily: 'Inter', outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
                    }}>
              {['Sumatera','Jawa','Kalimantan','Sulawesi','Maluku & Papua'].map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    border: '1px solid #1F2937', background: 'transparent',
                    color: '#7C8A99', fontSize: 13, cursor: 'pointer',
                  }}>
            Batal
          </button>
          <button onClick={() => { onSubmit(form); onClose() }}
                  style={{
                    flex: 2, padding: '10px', borderRadius: 8,
                    border: 'none', background: 'linear-gradient(135deg,#3B82F6,#2563EB)',
                    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(59,130,246,0.3)',
                  }}>
            Daftarkan Satuan
          </button>
        </div>
      </div>
    </div>
  )
}

function flattenNodes(jaringan) {
  const nodes = []
  nodes.push({ ...jaringan.pusat, type: 'pusat', _path: jaringan.pusat.nama })
  jaringan.wilayah.forEach(w => {
    nodes.push({ ...w, type: 'wilayah', _path: w.nama })
    w.satuan.forEach(s => {
      nodes.push({ ...s, type: 'satuan', _path: `${w.nama} > ${s.nama}` })
    })
  })
  return nodes
}

const STATUS_DOT_CFG = {
  online:  '#22C55E',
  delay:   '#F59E0B',
  offline: '#EF4444',
}

function TreeSearch({ jaringan, selected, onSelect, query, onQueryChange }) {
  const inputRef = useRef(null)
  const [focusedIdx, setFocusedIdx] = useState(0)
  const itemRefs = useRef([])

  const allNodes = flattenNodes(jaringan)
  const q = query.toLowerCase().trim()
  const results = q
    ? allNodes.filter(n =>
        n.nama?.toLowerCase().includes(q) ||
        n.id?.toLowerCase().includes(q) ||
        n.singkatan?.toLowerCase().includes(q)
      )
    : []

  useEffect(() => { setFocusedIdx(0) }, [q])

  const handleKey = useCallback((e) => {
    if (!q) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIdx(i => {
        const next = Math.min(i + 1, results.length - 1)
        itemRefs.current[next]?.scrollIntoView({ block: 'nearest' })
        return next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIdx(i => {
        const prev = Math.max(i - 1, 0)
        itemRefs.current[prev]?.scrollIntoView({ block: 'nearest' })
        return prev
      })
    } else if (e.key === 'Enter') {
      if (results[focusedIdx]) onSelect(results[focusedIdx])
    } else if (e.key === 'Escape') {
      onQueryChange('')
      inputRef.current?.blur()
    }
  }, [q, results, focusedIdx, onSelect, onQueryChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search input */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: '#1A2230', border: '1px solid #1F2937', borderRadius: 8,
          padding: '6px 10px',
        }}>
          <Search size={13} color="#7C8A99" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Cari satuan / korwil…  ↑↓ Enter"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#E8EDF2', fontSize: 12, fontFamily: 'Inter',
            }}
          />
          {query && (
            <button onClick={() => onQueryChange('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X size={12} color="#7C8A99" />
            </button>
          )}
        </div>
        {q && (
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '5px 4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {results.length} hasil
          </p>
        )}
      </div>

      {/* Results or tree */}
      {q ? (
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 16px', color: '#7C8A99' }}>
              <Search size={20} style={{ opacity: 0.2, marginBottom: 8 }} />
              <p style={{ fontSize: 12 }}>Tidak ditemukan</p>
            </div>
          ) : results.map((node, i) => {
            const isFocused = i === focusedIdx
            const isSelected = selected?.id === node.id
            const dotColor = STATUS_DOT_CFG[node.status] || '#374151'
            return (
              <div
                key={node.id}
                ref={el => { itemRefs.current[i] = el }}
                onClick={() => onSelect(node)}
                onMouseEnter={() => setFocusedIdx(i)}
                style={{
                  padding: '9px 11px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                  border: `1px solid ${isFocused || isSelected ? 'rgba(59,130,246,0.35)' : '#1F2937'}`,
                  background: isFocused || isSelected ? 'rgba(59,130,246,0.1)' : 'transparent',
                  transition: 'all 100ms',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {node.status && <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, boxShadow: node.status === 'online' ? `0 0 5px ${dotColor}88` : 'none' }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {node.nama}
                    </p>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#7C8A99', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {node._path}
                    </p>
                  </div>
                  <span style={{ fontSize: 9, color: '#374151', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {node.type}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <OrgTreeViewer data={jaringan} selected={selected} onSelect={onSelect} />
        </div>
      )}
    </div>
  )
}

export default function JaringanIntelijen() {
  const [jaringan, setJaringan] = useState(jaringanRaw)
  const [selected, setSelected] = useState(null)
  const [filterWil, setFilterWil] = useState('Semua Wilayah')
  const [showModal, setShowModal] = useState(false)
  const [syncingId, setSyncingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const totalOnline  = jaringan.wilayah.flatMap(w => w.satuan).filter(s => s.status === 'online').length
  const totalDelay   = jaringan.wilayah.flatMap(w => w.satuan).filter(s => s.status === 'delay').length
  const totalOffline = jaringan.wilayah.flatMap(w => w.satuan).filter(s => s.status === 'offline').length
  const totalSatuan  = jaringan.wilayah.reduce((n, w) => n + w.satuan.length, 0)

  const filteredWilayah = filterWil === 'Semua Wilayah'
    ? jaringan.wilayah
    : jaringan.wilayah.filter(w => w.wilayah === filterWil)

  const handleSync = (id) => {
    setSyncingId(id)
    setTimeout(() => {
      setJaringan(prev => ({
        ...prev,
        wilayah: prev.wilayah.map(w => ({
          ...w,
          satuan: w.satuan.map(s => s.id === id
            ? { ...s, status: 'online', syncAt: new Date().toISOString() }
            : s
          ),
          status: w.satuan.some(s => s.id === id) ? 'online' : w.status,
        })),
      }))
      setSelected(sel => sel?.id === id ? { ...sel, status: 'online', syncAt: new Date().toISOString() } : sel)
      setSyncingId(null)
    }, 1500)
  }

  const handleSyncAll = () => {
    jaringan.wilayah.forEach(w => w.satuan.forEach(s => {
      if (s.status !== 'online') handleSync(s.id)
    }))
  }

  const handleRegister = (form) => {
    const newId = `SAT-D-${String(totalSatuan + 1).padStart(3, '0')}`
    const newSatuan = {
      id: newId, nama: form.nama, status: 'online',
      personel: parseInt(form.personel) || 0,
      syncAt: new Date().toISOString(),
      wilayahId: 'WIL-001', indikator: 0,
    }
    setJaringan(prev => ({
      ...prev,
      wilayah: prev.wilayah.map(w =>
        w.wilayah === form.wilayah
          ? { ...w, satuan: [...w.satuan, newSatuan] }
          : w
      ),
    }))
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: '1px solid #1F2937',
        background: '#131922', flexShrink: 0, gap: 12,
      }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#E8EDF2', margin: 0 }}>
            Manajemen Jaringan Intelijen
          </h1>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
            A.1 • {totalSatuan} satuan terdaftar
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Status summary */}
          <div style={{ display: 'flex', gap: 6, marginRight: 4 }}>
            {[
              { n: totalOnline,  c: '#22C55E', l: 'Online'  },
              { n: totalDelay,   c: '#F59E0B', l: 'Delay'   },
              { n: totalOffline, c: '#EF4444', l: 'Offline' },
            ].map(p => (
              <span key={p.l} style={{
                padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                background: p.c + '15', color: p.c, border: `1px solid ${p.c}33`,
              }}>{p.n} {p.l}</span>
            ))}
          </div>

          {/* Filter wilayah */}
          <select value={filterWil} onChange={e => setFilterWil(e.target.value)}
                  style={{
                    padding: '6px 10px', borderRadius: 8,
                    background: '#1A2230', border: '1px solid #1F2937',
                    color: '#E8EDF2', fontSize: 11, cursor: 'pointer', outline: 'none',
                  }}>
            {WILAYAH_OPTS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>

          <button onClick={handleSyncAll}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    borderRadius: 8, border: '1px solid rgba(34,211,216,0.3)',
                    background: 'rgba(34,211,216,0.08)', color: '#22D3D8',
                    fontSize: 11, cursor: 'pointer',
                  }}>
            <RefreshCw size={12} /> Sinkronkan Semua
          </button>

          <button onClick={() => setShowModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                    borderRadius: 8, border: 'none',
                    background: 'linear-gradient(135deg,#3B82F6,#2563EB)',
                    color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(59,130,246,0.25)',
                  }}>
            <PlusCircle size={13} /> Registrasi Satuan Baru
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Org tree with search */}
        <div style={{
          width: 320, borderRight: '1px solid #1F2937',
          background: '#0A0E13', flexShrink: 0, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <TreeSearch
            jaringan={{ ...jaringan, wilayah: filteredWilayah }}
            selected={selected}
            onSelect={setSelected}
            query={searchQuery}
            onQueryChange={setSearchQuery}
          />
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, background: '#131922', overflow: 'hidden' }}>
          <DetailPanel
            node={selected}
            onSync={handleSync}
            onClose={() => setSelected(null)}
          />
        </div>
      </div>

      {showModal && (
        <RegistrasiModal
          onClose={() => setShowModal(false)}
          onSubmit={handleRegister}
        />
      )}
    </div>
  )
}
