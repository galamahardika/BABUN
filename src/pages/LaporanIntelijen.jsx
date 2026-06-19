import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, Plus, Send, CheckCircle, Clock, Edit3, X, ChevronRight, Users, Save, AlertCircle, RotateCcw } from 'lucide-react'

const DRAFT_KEY = 'sistema_laporan_draft'

function useDraftAutosave(form, enabled) {
  const timer = useRef(null)
  const [savedAt, setSavedAt] = useState(null)

  const save = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, at: new Date().toISOString() }))
      setSavedAt(new Date())
    } catch {}
  }, [form])

  useEffect(() => {
    if (!enabled) return
    clearTimeout(timer.current)
    timer.current = setTimeout(save, 30000) // 30s debounce
    return () => clearTimeout(timer.current)
  }, [form, enabled, save])

  // beforeunload warning when draft has content
  useEffect(() => {
    if (!enabled) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [enabled])

  const saveNow = () => save()
  return { savedAt, saveNow }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY) } catch {}
}
import dataLaporan from '../data/laporanIntelijen.json'

const STATUS_META = {
  Terdistribusi:      { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
  'Menunggu Tinjauan':{ color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Clock },
  Draft:              { color: 'text-text-muted', bg: 'bg-white/5', icon: Edit3 },
}

const TEMPLATES = [
  { id: 'mingguan', label: 'Laporan Mingguan', seksi: ['Ringkasan Eksekutif', 'Analisis Per Wilayah', 'Status Early Warning', 'Rekomendasi Strategis'] },
  { id: 'situasi', label: 'Laporan Situasi', seksi: ['Status Terkini', 'Perkembangan Indikator', 'Status Satuan', 'Langkah Selanjutnya'] },
  { id: 'tematik', label: 'Laporan Analisis Tematik', seksi: ['Metodologi Analisis', 'Temuan Utama', 'Pola Historis', 'Implikasi', 'Rekomendasi'] },
  { id: 'bulanan', label: 'Laporan Bulanan', seksi: ['Statistik Bulanan', 'Tren Per Wilayah', 'Kinerja Satuan', 'Catatan Khusus'] },
]

const PENERIMA_OPTS = ['Pimpinan BNPT', 'Koordinator Wilayah Jawa', 'Koordinator Wilayah Timur', 'Koordinator Wilayah Barat', 'Seluruh Koordinator Wilayah', 'Lembaga Mitra A']

function StatusChip({ status }) {
  const m = STATUS_META[status] || STATUS_META.Draft
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${m.color} ${m.bg}`}>
      <Icon size={11} /> {status}
    </span>
  )
}

function DetailDrawer({ item, onClose }) {
  const [activeSeksi, setActiveSeksi] = useState(item.seksi[0])
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="drawer-enter ml-auto w-[520px] h-full bg-surface border-l border-border flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-xs font-mono text-text-muted">{item.id}</p>
            <h3 className="font-semibold text-text-primary mt-0.5 leading-snug">{item.judul}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-text-muted"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center gap-3 flex-wrap">
            <StatusChip status={item.status} />
            <span className="text-xs text-text-muted px-2 py-0.5 bg-white/5 rounded">{item.template}</span>
            <span className="text-xs text-text-muted px-2 py-0.5 bg-white/5 rounded">{item.lingkup}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Wilayah</p>
              <p className="text-sm text-text-primary">{item.wilayah}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Periode</p>
              <p className="text-sm text-text-primary">{item.periode}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Penyusun</p>
              <p className="text-sm text-text-primary font-mono">{item.penyusun}</p>
            </div>
            {item.distribusiAt && (
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted mb-1">Didistribusikan</p>
                <p className="text-sm text-text-primary font-mono">{new Date(item.distribusiAt).toLocaleDateString('id-ID')}</p>
              </div>
            )}
          </div>

          {item.penerima.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={13} className="text-text-muted" />
                <p className="text-xs text-text-muted">Penerima</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.penerima.map(p => (
                  <span key={p} className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded">{p}</span>
                ))}
              </div>
            </div>
          )}

          {item.ringkasan && (
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-xs text-text-muted mb-2">Ringkasan</p>
              <p className="text-sm text-text-secondary leading-relaxed">{item.ringkasan}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-text-muted mb-3">Seksi Laporan</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {item.seksi.map(s => (
                <button key={s} onClick={() => setActiveSeksi(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${activeSeksi === s ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="bg-white/5 border border-border rounded-lg p-4 min-h-[120px]">
              <p className="text-xs text-text-muted mb-1">{activeSeksi}</p>
              <p className="text-sm text-text-muted/60 italic">
                {item.status === 'Draft' ? '[Konten belum diisi]' : '[Konten tersedia di versi lengkap]'}
              </p>
            </div>
          </div>
        </div>
        {item.status === 'Draft' && (
          <div className="px-6 py-4 border-t border-border flex gap-3">
            <button className="flex-1 py-2 rounded-lg bg-white/5 text-text-primary text-sm font-medium hover:bg-white/10 transition-colors">
              Edit Draft
            </button>
            <button className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Send size={13} /> Distribusikan
            </button>
          </div>
        )}
        {item.status === 'Menunggu Tinjauan' && (
          <div className="px-6 py-4 border-t border-border flex gap-3">
            <button className="flex-1 py-2 rounded-lg bg-success/20 text-success text-sm font-medium hover:bg-success/30 transition-colors flex items-center justify-center gap-2">
              <CheckCircle size={13} /> Setujui & Distribusikan
            </button>
            <button className="flex-1 py-2 rounded-lg bg-white/5 text-text-muted text-sm font-medium hover:bg-white/10 transition-colors">
              Kembalikan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function BuatModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ templateId: '', judul: '', wilayah: '', periode: '', penerima: [], ringkasan: '' })
  const [showRecovery, setShowRecovery] = useState(() => !!loadDraft())
  const tpl = TEMPLATES.find(t => t.id === form.templateId)
  const hasContent = form.judul.trim() || form.ringkasan.trim()
  const { savedAt, saveNow } = useDraftAutosave(form, !!hasContent)

  const togglePenerima = p => setForm(f => ({
    ...f, penerima: f.penerima.includes(p) ? f.penerima.filter(x => x !== p) : [...f.penerima, p]
  }))

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const canNext1 = form.templateId && form.judul.trim()
  const canSubmit = form.wilayah && form.penerima.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[600px] bg-surface border border-border rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold text-text-primary">Buat Laporan Baru</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Langkah {step} dari 2
              {savedAt && <span style={{ marginLeft: 8, color: '#22C55E', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}>✓ Tersimpan {savedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {hasContent && (
              <button onClick={saveNow} title="Simpan draft sekarang" style={{ padding: 6, borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E', cursor: 'pointer' }}>
                <Save size={13} />
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-text-muted"><X size={18} /></button>
          </div>
        </div>

        {/* Draft recovery banner */}
        {showRecovery && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
            <RotateCcw size={13} color="#F59E0B" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 11, color: '#F59E0B', fontFamily: 'Inter' }}>Draft belum disimpan ditemukan — pulihkan?</span>
            <button onClick={() => { const d = loadDraft(); if (d?.form) setForm(d.form); setShowRecovery(false) }} style={{ fontSize: 11, color: '#F59E0B', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600 }}>Pulihkan</button>
            <button onClick={() => { clearDraft(); setShowRecovery(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: 3 }}><X size={12} /></button>
          </div>
        )}

        {step === 1 ? (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-2">Pilih Template</label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setForm(f => ({ ...f, templateId: t.id }))}
                    className={`text-left p-3 rounded-lg border transition-colors ${form.templateId === t.id ? 'border-accent bg-accent/10' : 'border-border bg-white/5 hover:bg-white/10'}`}>
                    <p className="text-sm font-medium text-text-primary">{t.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{t.seksi.length} seksi</p>
                  </button>
                ))}
              </div>
            </div>
            {tpl && (
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-text-muted mb-2">Seksi yang akan dibuat:</p>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.seksi.map(s => <span key={s} className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded">{s}</span>)}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Judul Laporan</label>
              <input value={form.judul} onChange={set('judul')} placeholder="Masukkan judul laporan..."
                className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/40" />
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1.5">Wilayah</label>
                <input value={form.wilayah} onChange={set('wilayah')} placeholder="cth: Nasional, WIL-004..."
                  className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/40" />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1.5">Periode</label>
                <input value={form.periode} onChange={set('periode')} placeholder="cth: 2024-03-15"
                  className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/40" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-2">Penerima Distribusi</label>
              <div className="grid grid-cols-2 gap-2">
                {PENERIMA_OPTS.map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.penerima.includes(p)} onChange={() => togglePenerima(p)}
                      className="rounded border-border" />
                    <span className="text-xs text-text-secondary">{p}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Ringkasan Awal (opsional)</label>
              <textarea value={form.ringkasan} onChange={set('ringkasan')} rows={3}
                placeholder="Ringkasan eksekutif singkat..."
                className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-accent placeholder:text-text-muted/40" />
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-border flex justify-between">
          {step === 1 ? (
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-white/5 transition-colors">Batal</button>
          ) : (
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-white/5 transition-colors">← Kembali</button>
          )}
          {step === 1 ? (
            <button onClick={() => canNext1 && setStep(2)} disabled={!canNext1}
              className="px-4 py-2 rounded-lg text-sm bg-accent text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
              Lanjut →
            </button>
          ) : (
            <button onClick={() => { if (canSubmit) { clearDraft(); onSubmit(form) } }} disabled={!canSubmit}
              className="px-4 py-2 rounded-lg text-sm bg-accent text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2">
              <FileText size={14} /> Simpan sebagai Draft
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LaporanIntelijen() {
  const [laporan, setLaporan] = useState(dataLaporan)
  const [selected, setSelected] = useState(null)
  const [showBuat, setShowBuat] = useState(false)
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [toast, setToast] = useState(null)

  const showToast = msg => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleBuat = form => {
    const tpl = TEMPLATES.find(t => t.id === form.templateId)
    const newLap = {
      id: `LAP-INT-2024-${String(laporan.length + 48).padStart(4, '0')}`,
      judul: form.judul,
      template: tpl?.label || '-',
      wilayah: form.wilayah || 'Nasional',
      lingkup: 'Nasional',
      periode: form.periode || new Date().toISOString().slice(0, 10),
      status: 'Draft',
      penerima: form.penerima,
      distribusiAt: null,
      penyusun: 'AP-Analis-Aktif',
      ringkasan: form.ringkasan,
      seksi: tpl?.seksi || [],
    }
    setLaporan(prev => [newLap, ...prev])
    setShowBuat(false)
    showToast(`Draft ${newLap.id} berhasil dibuat.`)
  }

  const filtered = filterStatus === 'Semua' ? laporan : laporan.filter(l => l.status === filterStatus)

  const stats = {
    total: laporan.length,
    distribusi: laporan.filter(l => l.status === 'Terdistribusi').length,
    menunggu: laporan.filter(l => l.status === 'Menunggu Tinjauan').length,
    draft: laporan.filter(l => l.status === 'Draft').length,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-success/20 border border-success/40 text-success text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary font-display">Manajemen Laporan Intelijen</h1>
            <p className="text-sm text-text-muted mt-1">Modul A.9 — Penyusunan, tinjauan, dan distribusi laporan</p>
          </div>
          <button onClick={() => setShowBuat(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> Buat Laporan Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Laporan', val: stats.total, color: 'text-text-primary' },
            { label: 'Terdistribusi', val: stats.distribusi, color: 'text-success' },
            { label: 'Menunggu Tinjauan', val: stats.menunggu, color: 'text-amber-400' },
            { label: 'Draft', val: stats.draft, color: 'text-text-muted' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color} font-display`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <FileText size={15} className="text-accent" /> Daftar Laporan
            </h3>
            <div className="flex gap-1">
              {['Semua', 'Terdistribusi', 'Menunggu Tinjauan', 'Draft'].map(s => (
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
                  <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Judul</th>
                  <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Template</th>
                  <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Wilayah</th>
                  <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Penyusun</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}
                    className="border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelected(item)}>
                    <td className="px-4 py-3 font-mono text-xs text-accent">{item.id}</td>
                    <td className="px-4 py-3 text-xs text-text-primary max-w-[240px]">
                      <p className="truncate">{item.judul}</p>
                      <p className="text-text-muted mt-0.5">{item.periode}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{item.template}</td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{item.wilayah}</td>
                    <td className="px-4 py-3"><StatusChip status={item.status} /></td>
                    <td className="px-4 py-3 text-xs text-text-muted font-mono">{item.penyusun}</td>
                    <td className="px-4 py-3 text-text-muted"><ChevronRight size={14} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-text-muted text-sm">Tidak ada laporan ditemukan.</div>
            )}
          </div>
        </div>
      </div>

      {selected && <DetailDrawer item={selected} onClose={() => setSelected(null)} />}
      {showBuat && <BuatModal onClose={() => setShowBuat(false)} onSubmit={handleBuat} />}
    </div>
  )
}
