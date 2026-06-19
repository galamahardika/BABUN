import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { ShieldCheck, Search, Download, Filter, X, ChevronRight, AlertTriangle, Activity, Lock, Database, Settings } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import auditSeed from '../data/audit.json'

const ROW_HEIGHT = 40
const OVERSCAN = 5
const VIRTUAL_TOTAL = 10000

// Expand 20 seed rows to 10k by cycling + mutating timestamps/IDs
const auditData = (() => {
  const rows = []
  const now = Date.now()
  for (let i = 0; i < VIRTUAL_TOTAL; i++) {
    const seed = auditSeed[i % auditSeed.length]
    const minsAgo = i * 0.5
    rows.push({
      ...seed,
      id: `AUD-${String(VIRTUAL_TOTAL - i).padStart(6, '0')}`,
      waktu: new Date(now - minsAgo * 60 * 1000).toISOString(),
    })
  }
  return rows
})()

const RISIKO_META = {
  Kritis: { color: 'text-danger',    bg: 'bg-danger/10',    dot: 'bg-danger' },
  Tinggi: { color: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400' },
  Sedang: { color: 'text-yellow-300',bg: 'bg-yellow-300/10',dot: 'bg-yellow-300' },
  Rendah: { color: 'text-success',   bg: 'bg-success/10',   dot: 'bg-success' },
}

const KATEGORI_META = {
  'Autentikasi':     { icon: Lock,     color: 'text-accent' },
  'Akses Data':      { icon: Database, color: 'text-cyan-400' },
  'Modifikasi Data': { icon: Activity, color: 'text-amber-400' },
  'Tindakan Kritis': { icon: AlertTriangle, color: 'text-danger' },
  'Keputusan':       { icon: ShieldCheck, color: 'text-purple-400' },
  'Administrasi':    { icon: Settings, color: 'text-text-secondary' },
}

const AKSI_OPTS = ['Semua', 'LOGIN', 'LOGIN_GAGAL', 'AKSES_MODUL', 'TAMBAH_LAPORAN', 'DISTRIBUSI_LAPORAN',
  'KIRIM_DSS', 'ADOPT_REKOMENDASI', 'REJECT_REKOMENDASI', 'SETUJUI_PERTUKARAN', 'TOLAK_PERTUKARAN',
  'AJUKAN_PERTUKARAN', 'ESKALASI_PERINGATAN', 'TAMBAH_PENGGUNA', 'NONAKTIFKAN_PENGGUNA', 'UBAH_HAK_AKSES']
const RISIKO_OPTS = ['Semua', 'Kritis', 'Tinggi', 'Sedang', 'Rendah']
const KATEGORI_OPTS = ['Semua', 'Autentikasi', 'Akses Data', 'Modifikasi Data', 'Tindakan Kritis', 'Keputusan', 'Administrasi']

function RisikoChip({ level }) {
  const m = RISIKO_META[level] || RISIKO_META.Rendah
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${m.color} ${m.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} /> {level}
    </span>
  )
}

function AuditDetail({ item, onClose }) {
  const katMeta = KATEGORI_META[item.kategori]
  const KatIcon = katMeta?.icon || Activity
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="drawer-enter ml-auto w-[440px] h-full bg-surface border-l border-border flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-xs font-mono text-text-muted">{item.id}</p>
            <h3 className="font-semibold text-text-primary mt-0.5">{item.aksi}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-text-muted"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <RisikoChip level={item.risiko} />
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-white/5 ${katMeta?.color || 'text-text-muted'}`}>
              <KatIcon size={11} /> {item.kategori}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Waktu', val: new Date(item.waktu).toLocaleString('id-ID', { timeZoneName: 'short' }) },
              { label: 'Pengguna', val: item.pengguna },
              { label: 'ID Pengguna', val: item.penggunaId },
              { label: 'Modul', val: item.modul },
              { label: 'Alamat IP', val: item.ip },
            ].map(f => (
              <div key={f.label} className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted mb-1">{f.label}</p>
                <p className="text-sm text-text-primary font-mono">{f.val}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs text-text-muted mb-2">Detail Aksi</p>
            <p className="text-sm text-text-secondary leading-relaxed">{item.detail}</p>
          </div>

          {(item.risiko === 'Kritis' || item.risiko === 'Tinggi') && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle size={13} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger/80">Aksi berisiko {item.risiko.toLowerCase()} — tindakan ini telah dicatat untuk tinjauan kepatuhan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TREND_DATA = [
  { tgl: '9 Mar', total: 12, kritis: 0 },
  { tgl: '10 Mar', total: 18, kritis: 1 },
  { tgl: '11 Mar', total: 9, kritis: 0 },
  { tgl: '12 Mar', total: 15, kritis: 2 },
  { tgl: '13 Mar', total: 14, kritis: 1 },
  { tgl: '14 Mar', total: 22, kritis: 3 },
  { tgl: '15 Mar', total: 8, kritis: 1 },
]

const AKSI_DIST = [
  { name: 'Login', val: 3 }, { name: 'Mod. Data', val: 7 }, { name: 'Keputusan', val: 2 },
  { name: 'Admin', val: 3 }, { name: 'Kritis', val: 1 }, { name: 'Akses', val: 1 },
]
const BAR_COLORS = ['#3B82F6','#F59E0B','#A855F7','#6B7280','#EF4444','#22D3EE']

function VirtualTable({ rows, onSelect }) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(480)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setContainerHeight(entries[0].contentRect.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const totalHeight = rows.length * ROW_HEIGHT
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN)
  const endIdx = Math.min(rows.length - 1, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN)
  const visible = rows.slice(startIdx, endIdx + 1)
  const paddingTop = startIdx * ROW_HEIGHT
  const paddingBottom = Math.max(0, (rows.length - endIdx - 1) * ROW_HEIGHT)

  return (
    <div ref={containerRef} style={{ height: 480, overflowY: 'auto', overflowX: 'auto', position: 'relative' }}
         onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 900 }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-surface, #131922)' }}>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium" style={{ width: 140 }}>Waktu</th>
            <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium" style={{ width: 120 }}>Pengguna</th>
            <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium" style={{ width: 170 }}>Aksi</th>
            <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium" style={{ width: 130 }}>Kategori</th>
            <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium" style={{ width: 110 }}>Modul</th>
            <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium" style={{ width: 90 }}>Risiko</th>
            <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium" style={{ width: 100 }}>IP</th>
            <th style={{ width: 32 }} />
          </tr>
        </thead>
        <tbody>
          <tr style={{ height: paddingTop }}><td colSpan={8} /></tr>
          {visible.map(item => {
            const katMeta = KATEGORI_META[item.kategori]
            const KatIcon = katMeta?.icon || Activity
            return (
              <tr key={item.id}
                  style={{ height: ROW_HEIGHT }}
                  className="border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => onSelect(item)}>
                <td className="px-4 text-xs text-text-muted font-mono whitespace-nowrap">
                  {new Date(item.waktu).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td className="px-4 text-xs text-text-primary font-mono">{item.pengguna}</td>
                <td className="px-4 text-xs font-mono text-text-secondary">{item.aksi}</td>
                <td className="px-4">
                  <span className={`inline-flex items-center gap-1 text-xs ${katMeta?.color || 'text-text-muted'}`}>
                    <KatIcon size={11} /> {item.kategori}
                  </span>
                </td>
                <td className="px-4 text-xs text-text-muted">{item.modul}</td>
                <td className="px-4"><RisikoChip level={item.risiko} /></td>
                <td className="px-4 text-xs text-text-muted font-mono">{item.ip}</td>
                <td className="px-4 text-text-muted"><ChevronRight size={14} /></td>
              </tr>
            )
          })}
          <tr style={{ height: paddingBottom }}><td colSpan={8} /></tr>
        </tbody>
      </table>
      {rows.length === 0 && <div className="text-center py-12 text-text-muted text-sm">Tidak ada log ditemukan.</div>}
    </div>
  )
}

export default function AuditKeamanan() {
  const [query, setQuery] = useState('')
  const [filterRisiko, setFilterRisiko] = useState('Semua')
  const [filterKategori, setFilterKategori] = useState('Semua')
  const [filterAksi, setFilterAksi] = useState('Semua')
  const [selected, setSelected] = useState(null)
  const [showFilter, setShowFilter] = useState(false)

  const results = useMemo(() => {
    let list = auditData
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(r => r.pengguna.includes(q) || r.aksi.includes(q.toUpperCase()) || r.detail.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
    }
    if (filterRisiko !== 'Semua') list = list.filter(r => r.risiko === filterRisiko)
    if (filterKategori !== 'Semua') list = list.filter(r => r.kategori === filterKategori)
    if (filterAksi !== 'Semua') list = list.filter(r => r.aksi === filterAksi)
    return list
  }, [query, filterRisiko, filterKategori, filterAksi])

  const stats = {
    total: auditData.length,
    kritis: auditData.filter(r => r.risiko === 'Kritis').length,
    tinggi: auditData.filter(r => r.risiko === 'Tinggi').length,
    pengguna: [...new Set(auditData.map(r => r.penggunaId))].length,
  }

  const hasFilter = filterRisiko !== 'Semua' || filterKategori !== 'Semua' || filterAksi !== 'Semua'

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface border border-border rounded-lg p-2 text-xs">
        <p className="text-text-primary font-medium mb-1">{label}</p>
        <p className="text-accent">Total: {payload[0]?.value}</p>
        <p className="text-danger">Kritis: {payload[1]?.value}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary font-display">Audit & Kepatuhan Keamanan</h1>
            <p className="text-sm text-text-muted mt-1">Modul A.13 — Log aktivitas sistem dan pemantauan kepatuhan</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-border text-text-secondary rounded-lg text-sm hover:bg-white/10 transition-colors">
            <Download size={14} /> Ekspor Log
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Log', val: stats.total, color: 'text-text-primary' },
            { label: 'Aksi Kritis', val: stats.kritis, color: 'text-danger' },
            { label: 'Risiko Tinggi', val: stats.tinggi, color: 'text-amber-400' },
            { label: 'Pengguna Aktif', val: stats.pengguna, color: 'text-accent' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color} font-display`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Tren Aktivitas 7 Hari</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={TREND_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradKritis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="tgl" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={1.5} fill="url(#gradTotal)" />
                <Area type="monotone" dataKey="kritis" stroke="#EF4444" strokeWidth={1.5} fill="url(#gradKritis)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-text-muted"><span className="w-3 h-0.5 bg-accent inline-block" /> Total Aksi</span>
              <span className="flex items-center gap-1.5 text-xs text-text-muted"><span className="w-3 h-0.5 bg-danger inline-block" /> Aksi Kritis</span>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Distribusi Kategori</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={AKSI_DIST} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} width={68} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 11 }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="val" radius={[0, 3, 3, 0]}>
                  {AKSI_DIST.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} fillOpacity={0.8} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Log Table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border gap-3">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari pengguna, aksi, atau detail..."
                className="w-full bg-white/5 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/40" />
            </div>
            <div className="flex gap-1">
              {RISIKO_OPTS.map(o => (
                <button key={o} onClick={() => setFilterRisiko(o)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${filterRisiko === o ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'}`}>
                  {o}
                </button>
              ))}
            </div>
            <button onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${hasFilter ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text-primary'}`}>
              <Filter size={12} /> Filter
            </button>
            {hasFilter && (
              <button onClick={() => { setFilterRisiko('Semua'); setFilterKategori('Semua'); setFilterAksi('Semua') }}
                className="text-xs text-text-muted hover:text-text-primary flex items-center gap-1">
                <X size={12} /> Reset
              </button>
            )}
          </div>

          {showFilter && (
            <div className="px-5 py-3 border-b border-border bg-white/3 flex gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted whitespace-nowrap">Kategori:</span>
                <div className="flex gap-1 flex-wrap">
                  {KATEGORI_OPTS.map(o => (
                    <button key={o} onClick={() => setFilterKategori(o)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${filterKategori === o ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <VirtualTable rows={results} onSelect={setSelected} />
          <div className="px-5 py-2.5 border-t border-border text-xs text-text-muted flex items-center justify-between">
            <span>Menampilkan {results.length.toLocaleString()} dari {auditData.length.toLocaleString()} entri log</span>
            <span className="text-text-muted/50">Virtual scroll aktif · hanya baris yang terlihat di-render</span>
          </div>
        </div>
      </div>

      {selected && <AuditDetail item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
