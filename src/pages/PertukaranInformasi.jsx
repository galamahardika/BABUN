import { useState } from 'react'
import { ArrowLeftRight, CheckCircle, Clock, XCircle, Plus, Building2, ChevronRight, X, Send } from 'lucide-react'
import data from '../data/pertukaran.json'

const STATUS_META = {
  Disetujui: { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
  Menunggu:  { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Clock },
  Ditolak:   { color: 'text-danger', bg: 'bg-danger/10', icon: XCircle },
}

const JENIS_OPTS = ['Data Analisis', 'Laporan Intelijen', 'Log Anomali', 'Asesmen Ancaman', 'Laporan Observasi', 'Data Koordinasi']

const KLASIFIKASI_OPTS = [
  { value: 'TERBUKA',        color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   desc: 'Dapat dibagikan secara umum' },
  { value: 'TERBATAS',       color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  desc: 'Hanya untuk personel berwenang' },
  { value: 'RAHASIA',        color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  desc: 'Sangat dibatasi, need-to-know' },
  { value: 'SANGAT RAHASIA', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   desc: 'Klasifikasi tertinggi — akses khusus' },
]

function KlasifikasiBadge({ value }) {
  const k = KLASIFIKASI_OPTS.find(o => o.value === value) || KLASIFIKASI_OPTS[0]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
      background: k.bg, color: k.color, border: `1px solid ${k.border}`,
      fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
    }}>
      ▲ {value || 'TERBATAS'}
    </span>
  )
}

function StatusChip({ status }) {
  const m = STATUS_META[status] || STATUS_META.Menunggu
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${m.color} ${m.bg}`}>
      <Icon size={11} /> {status}
    </span>
  )
}

function LogDetail({ item, lembaga, onClose }) {
  const lmb = lembaga.find(l => l.id === item.tujuanId || l.id === item.asalId)
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="drawer-enter ml-auto w-[480px] h-full bg-surface border-l border-border flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-xs text-text-muted font-mono">{item.id}</p>
            <h3 className="font-semibold text-text-primary mt-0.5">{item.jenis}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-text-muted"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <StatusChip status={item.status} />
            {item.klasifikasi && <KlasifikasiBadge value={item.klasifikasi} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Asal</p>
              <p className="text-sm font-medium text-text-primary">{item.asal}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Tujuan</p>
              <p className="text-sm font-medium text-text-primary">{item.tujuan}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-text-muted mb-1">Diajukan</p>
              <p className="text-sm text-text-secondary font-mono">{new Date(item.pengajuAt).toLocaleString('id-ID')}</p>
            </div>
            {item.persetujuanAt && (
              <div>
                <p className="text-xs text-text-muted mb-1">{item.status === 'Ditolak' ? 'Ditolak' : 'Disetujui'} Pada</p>
                <p className="text-sm text-text-secondary font-mono">{new Date(item.persetujuanAt).toLocaleString('id-ID')}</p>
              </div>
            )}
            {item.penyetuju && (
              <div>
                <p className="text-xs text-text-muted mb-1">Oleh</p>
                <p className="text-sm text-text-secondary font-mono">{item.penyetuju}</p>
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs text-text-muted mb-2">Justifikasi Pertukaran</p>
            <p className="text-sm text-text-secondary leading-relaxed">{item.justifikasi}</p>
          </div>

          {item.alasanTolak && (
            <div className="bg-danger/10 border border-danger/20 rounded-lg p-4">
              <p className="text-xs text-danger mb-2">Alasan Penolakan</p>
              <p className="text-sm text-text-secondary leading-relaxed">{item.alasanTolak}</p>
            </div>
          )}
        </div>

        {item.status === 'Menunggu' && (
          <div className="px-6 py-4 border-t border-border flex gap-3">
            <button className="flex-1 py-2 rounded-lg bg-success/20 text-success text-sm font-medium hover:bg-success/30 transition-colors">
              Setujui
            </button>
            <button className="flex-1 py-2 rounded-lg bg-danger/20 text-danger text-sm font-medium hover:bg-danger/30 transition-colors">
              Tolak
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AjukanModal({ lembaga, onClose, onSubmit }) {
  const [form, setForm] = useState({ tujuanId: '', jenis: '', justifikasi: '', klasifikasi: 'TERBATAS' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const valid = form.tujuanId && form.jenis && form.justifikasi.trim().length > 10

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[520px] bg-surface border border-border rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Ajukan Pertukaran Informasi Baru</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-text-muted"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Lembaga Tujuan</label>
            <select value={form.tujuanId} onChange={set('tujuanId')}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent">
              <option value="">-- Pilih Lembaga --</option>
              {lembaga.filter(l => l.status === 'Terhubung').map(l => (
                <option key={l.id} value={l.id}>{l.nama} ({l.singkatan})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5">Jenis Data</label>
            <select value={form.jenis} onChange={set('jenis')}
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent">
              <option value="">-- Pilih Jenis --</option>
              {JENIS_OPTS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          {/* Klasifikasi data */}
          <div>
            <label className="block text-xs text-text-muted mb-2">Klasifikasi Data <span className="text-danger">*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {KLASIFIKASI_OPTS.map(k => (
                <label key={k.value} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px',
                  border: `1px solid ${form.klasifikasi === k.value ? k.border : 'rgba(31,41,55,0.8)'}`,
                  borderRadius: 8, cursor: 'pointer',
                  background: form.klasifikasi === k.value ? k.bg : 'transparent',
                  transition: 'all 120ms',
                }}>
                  <input type="radio" name="klasifikasi" value={k.value}
                         checked={form.klasifikasi === k.value}
                         onChange={e => setForm(f => ({ ...f, klasifikasi: e.target.value }))}
                         style={{ marginTop: 2, accentColor: k.color, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: k.color, fontFamily: 'JetBrains Mono, monospace', margin: 0, letterSpacing: '0.04em' }}>
                      {k.value}
                    </p>
                    <p style={{ fontSize: 9, color: '#7C8A99', margin: '2px 0 0', lineHeight: 1.3 }}>{k.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1.5">Justifikasi <span className="text-text-muted">({form.justifikasi.length}/300)</span></label>
            <textarea value={form.justifikasi} onChange={set('justifikasi')} maxLength={300} rows={4}
              placeholder="Jelaskan tujuan dan dasar hukum pertukaran informasi ini..."
              className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-accent placeholder:text-text-muted/40" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-white/5 transition-colors">Batal</button>
          <button onClick={() => valid && onSubmit(form)} disabled={!valid}
            className="px-4 py-2 rounded-lg text-sm bg-accent text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2">
            <Send size={14} /> Ajukan
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PertukaranInformasi() {
  const [log, setLog] = useState(data.log)
  const [lembaga] = useState(data.lembaga)
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [toast, setToast] = useState(null)

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleSubmit = form => {
    const lmb = lembaga.find(l => l.id === form.tujuanId)
    const newItem = {
      id: `PTK-2024-${String(log.length + 89).padStart(4, '0')}`,
      asalId: 'BNPT', asal: 'BNPT Pusat',
      tujuanId: form.tujuanId, tujuan: lmb?.nama || '-',
      jenis: form.jenis, status: 'Menunggu',
      klasifikasi: form.klasifikasi,
      pengajuAt: new Date().toISOString(),
      persetujuanAt: null, penyetuju: null,
      justifikasi: form.justifikasi,
    }
    setLog(prev => [newItem, ...prev])
    setShowModal(false)
    showToast(`Pengajuan ${newItem.id} berhasil dikirim.`)
  }

  const filtered = filterStatus === 'Semua' ? log : log.filter(l => l.status === filterStatus)
  const stats = {
    total: log.length,
    disetujui: log.filter(l => l.status === 'Disetujui').length,
    menunggu: log.filter(l => l.status === 'Menunggu').length,
    ditolak: log.filter(l => l.status === 'Ditolak').length,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-success/20 border border-success/40 text-success text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary font-display">Pertukaran Informasi Antar Lembaga</h1>
            <p className="text-sm text-text-muted mt-1">Modul A.7 — Koordinasi data intelijen dengan lembaga mitra</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> Ajukan Pertukaran Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Pertukaran', val: stats.total, color: 'text-text-primary' },
            { label: 'Disetujui', val: stats.disetujui, color: 'text-success' },
            { label: 'Menunggu', val: stats.menunggu, color: 'text-amber-400' },
            { label: 'Ditolak', val: stats.ditolak, color: 'text-danger' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color} font-display`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[280px_1fr] gap-6">
          {/* Lembaga Panel */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-accent" />
              <h3 className="text-sm font-semibold text-text-primary">Lembaga Mitra</h3>
            </div>
            <div className="space-y-2">
              {lembaga.map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{l.singkatan}</p>
                    <p className="text-xs text-text-muted">{l.jenis}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${l.status === 'Terhubung' ? 'bg-success/10 text-success' : 'bg-white/5 text-text-muted'}`}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Log Table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <ArrowLeftRight size={15} className="text-accent" /> Log Pertukaran
              </h3>
              <div className="flex gap-1">
                {['Semua', 'Disetujui', 'Menunggu', 'Ditolak'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${filterStatus === s ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">ID</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Asal → Tujuan</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Jenis Data</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Diajukan</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id}
                      className="border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setSelected(item)}>
                      <td className="px-4 py-3 font-mono text-xs text-accent">{item.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <span className="font-medium text-text-primary">{item.asal}</span>
                          <ChevronRight size={12} className="text-text-muted" />
                          <span>{item.tujuan}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-secondary max-w-[200px] truncate">{item.jenis}</td>
                      <td className="px-4 py-3"><StatusChip status={item.status} /></td>
                      <td className="px-4 py-3 text-xs text-text-muted font-mono">
                        {new Date(item.pengajuAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-text-muted"><ChevronRight size={14} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-text-muted text-sm">Tidak ada data pertukaran.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selected && <LogDetail item={selected} lembaga={lembaga} onClose={() => setSelected(null)} />}
      {showModal && <AjukanModal lembaga={lembaga} onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
    </div>
  )
}
