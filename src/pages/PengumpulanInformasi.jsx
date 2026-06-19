import { useState, useRef } from 'react'
import { Send, Paperclip, CheckCircle, XCircle, Clock, FileText, ChevronRight, AlertCircle, Trash2 } from 'lucide-react'
import DataTable from '../components/common/DataTable'
import SeverityBadge from '../components/common/SeverityBadge'
import DetailDrawer from '../components/common/DetailDrawer'
import Stepper from '../components/common/Stepper'
import laporanAwal from '../data/laporan.json'
import wilayah from '../data/wilayah.json'

const KATEGORI_OPTS = ['Pola Aktivitas','Anomali Komunikasi','Pola Pergerakan','Observasi Rutin','Pola Waktu','Laporan Insidentil']
const KEYAKINAN_OPTS = ['Tinggi','Sedang','Rendah']
const STATUS_LEVEL = { 'Terverifikasi': 'success', 'Dalam Validasi': 'moderate', 'Baru': 'info', 'Ditolak': 'critical' }

const MAX_NARASI = 1000

function Badge({ status }) {
  const level = STATUS_LEVEL[status] || 'info'
  return <SeverityBadge level={level} label={status} />
}

function InputForm({ onSubmit }) {
  const [form, setForm] = useState({ wilayahId: 'WIL-004', kategori: 'Pola Aktivitas', keyakinan: 'Sedang', narasi: '', lampiran: 0 })
  const [submitted, setSubmitted] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.narasi.trim()) return
    onSubmit(form)
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm({ wilayahId: 'WIL-004', kategori: 'Pola Aktivitas', keyakinan: 'Sedang', narasi: '', lampiran: 0 })
    }, 2500)
  }

  if (submitted) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 360, gap: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle size={28} color="#22C55E" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#22C55E', margin: 0 }}>Laporan Terkirim</p>
        <p style={{ fontSize: 12, color: '#7C8A99', margin: '6px 0 0' }}>Laporan masuk ke antrian validasi dengan status <strong>Baru</strong></p>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px', maxWidth: 720 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {/* Wilayah */}
        <div>
          <label style={labelStyle}>Wilayah Asal Laporan</label>
          <select value={form.wilayahId} onChange={e => set('wilayahId', e.target.value)} style={selectStyle}>
            {wilayah.map(w => <option key={w.id} value={w.id}>{w.nama}</option>)}
          </select>
        </div>
        {/* Kategori */}
        <div>
          <label style={labelStyle}>Kategori Aktivitas</label>
          <select value={form.kategori} onChange={e => set('kategori', e.target.value)} style={selectStyle}>
            {KATEGORI_OPTS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        {/* Keyakinan */}
        <div>
          <label style={labelStyle}>Tingkat Keyakinan Sumber</label>
          <select value={form.keyakinan} onChange={e => set('keyakinan', e.target.value)} style={selectStyle}>
            {KEYAKINAN_OPTS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '4px 0 0' }}>
            {form.keyakinan === 'Tinggi' ? '≥3 sumber primer konsisten' : form.keyakinan === 'Sedang' ? '1–2 sumber atau sumber sekunder' : 'Sumber tunggal belum terverifikasi'}
          </p>
        </div>
      </div>

      {/* Narasi */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={labelStyle}>Narasi Laporan</label>
          <span style={{ fontSize: 10, color: form.narasi.length > MAX_NARASI * 0.9 ? '#F59E0B' : '#7C8A99' }}>
            {form.narasi.length}/{MAX_NARASI}
          </span>
        </div>
        <textarea
          value={form.narasi}
          onChange={e => e.target.value.length <= MAX_NARASI && set('narasi', e.target.value)}
          placeholder="Deskripsikan observasi secara lengkap. Gunakan bahasa faktual — hindari spekulasi. Sertakan: lokasi (generik), waktu, pola yang diamati, jumlah sumber, dan basis keyakinan."
          rows={7}
          style={{
            width: '100%', background: '#1A2230', border: '1px solid #1F2937',
            borderRadius: 8, padding: '10px 14px', color: '#E8EDF2',
            fontSize: 13, fontFamily: 'Inter', outline: 'none',
            resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
          }}
          onFocus={e => e.target.style.borderColor = '#3B82F6'}
          onBlur={e => e.target.style.borderColor = '#1F2937'}
        />
      </div>

      {/* Lampiran */}
      <div>
        <label style={labelStyle}>Lampiran (Opsional)</label>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          background: '#1A2230', border: '1px dashed #1F2937', borderRadius: 8, cursor: 'pointer',
        }}
        onClick={() => set('lampiran', form.lampiran + 1)}>
          <Paperclip size={14} color="#7C8A99" />
          <span style={{ fontSize: 12, color: '#7C8A99' }}>
            {form.lampiran === 0 ? 'Klik untuk menambah lampiran (simulasi)' : `${form.lampiran} file dilampirkan`}
          </span>
          {form.lampiran > 0 && (
            <span style={{ marginLeft: 'auto', padding: '2px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', fontSize: 10, fontWeight: 600 }}>
              +{form.lampiran}
            </span>
          )}
        </div>
      </div>

      {/* Warning */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 8, background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}>
        <AlertCircle size={13} color="#FACC15" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 11, color: '#FACC15', margin: 0, lineHeight: 1.5 }}>
          Pastikan data yang dimasukkan berupa data simulasi. Jangan gunakan nama, lokasi, atau organisasi nyata. Semua laporan tercatat dalam jejak audit dan dapat ditelusuri.
        </p>
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={!form.narasi.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 8, border: 'none',
                  background: form.narasi.trim() ? 'linear-gradient(135deg,#3B82F6,#2563EB)' : '#1F2937',
                  color: form.narasi.trim() ? '#fff' : '#7C8A99',
                  fontSize: 13, fontWeight: 600, cursor: form.narasi.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: form.narasi.trim() ? '0 0 14px rgba(59,130,246,0.3)' : 'none',
                }}>
          <Send size={14} /> Kirim Laporan
        </button>
      </div>
    </form>
  )
}

function TolakModal({ open, onClose, onConfirm }) {
  const [alasan, setAlasan] = useState('')
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,14,19,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#131922', border: '1px solid #EF444444', borderRadius: 14, padding: 24, width: 400 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#EF4444', margin: '0 0 16px' }}>Tolak Laporan</h3>
        <label style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>Alasan Penolakan (Wajib)</label>
        <textarea value={alasan} onChange={e => setAlasan(e.target.value)}
                  placeholder="Jelaskan alasan penolakan secara spesifik…"
                  rows={4}
                  style={{ width: '100%', background: '#1A2230', border: '1px solid #1F2937', borderRadius: 8, padding: '9px 12px', color: '#E8EDF2', fontSize: 12, fontFamily: 'Inter', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#EF4444'}
                  onBlur={e => e.target.style.borderColor = '#1F2937'} />
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid #1F2937', background: 'transparent', color: '#7C8A99', fontSize: 12, cursor: 'pointer' }}>Batal</button>
          <button onClick={() => { if (alasan.trim()) { onConfirm(alasan); onClose() } }}
                  disabled={!alasan.trim()}
                  style={{ flex: 2, padding: '9px', borderRadius: 8, border: 'none', background: alasan.trim() ? '#EF4444' : '#1F2937', color: alasan.trim() ? '#fff' : '#7C8A99', fontSize: 12, fontWeight: 600, cursor: alasan.trim() ? 'pointer' : 'not-allowed' }}>
            Konfirmasi Tolak
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 11, color: '#7C8A99', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }
const selectStyle = {
  width: '100%', background: '#1A2230', border: '1px solid #1F2937',
  borderRadius: 8, padding: '9px 12px', color: '#E8EDF2',
  fontSize: 13, fontFamily: 'Inter', outline: 'none', cursor: 'pointer',
}

const ANTRIAN_COLS = [
  { key: 'id', label: 'ID', type: 'mono' },
  { key: 'judul', label: 'Judul', sortable: true,
    render: (v) => <span style={{ fontSize: 12, color: '#E8EDF2', fontWeight: 500 }}>{v}</span> },
  { key: 'wilayah', label: 'Wilayah', type: 'muted' },
  { key: 'kategori', label: 'Kategori', type: 'muted' },
  { key: 'keyakinan', label: 'Keyakinan', sortable: true,
    render: (v) => {
      const c = v === 'Tinggi' ? '#22C55E' : v === 'Sedang' ? '#F59E0B' : '#7C8A99'
      return <span style={{ fontSize: 10, fontWeight: 600, color: c }}>{v}</span>
    }
  },
  { key: 'status', label: 'Status', sortable: true,
    render: (v) => <Badge status={v} /> },
  { key: 'submitAt', label: 'Dikirim', type: 'muted',
    render: (v) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ color: '#7C8A99', fontSize: 11 }}>{new Date(v).toLocaleString('id-ID', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</span>
        {ageBadge(v)}
      </div>
    ) },
  { key: 'aksi', label: 'Aksi', sortable: false,
    render: (_, row) => row.status === 'Baru' || row.status === 'Dalam Validasi'
      ? <span style={{ fontSize: 10, color: '#3B82F6' }}>Klik untuk tinjau →</span>
      : null
  },
]

function ageText(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${mins}m lalu`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}j lalu`
  return `${Math.floor(h / 24)}h lalu`
}

function ageBadge(iso) {
  const hours = (Date.now() - new Date(iso).getTime()) / 3600000
  const color = hours > 48 ? '#EF4444' : hours > 24 ? '#F59E0B' : '#22C55E'
  return <span style={{ fontSize: 9, color, fontFamily: 'JetBrains Mono, monospace' }}>{ageText(iso)}</span>
}

export default function PengumpulanInformasi() {
  const [tab, setTab] = useState('input')
  const [laporan, setLaporan] = useState(laporanAwal)
  const [drawerItem, setDrawerItem] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [tolakOpen, setTolakOpen] = useState(false)
  const [tolakTarget, setTolakTarget] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [statusFilter, setStatusFilter] = useState('semua')

  const handleSubmit = (form) => {
    const wil = wilayah.find(w => w.id === form.wilayahId)
    const newId = `LAP-2024-0${892 + laporan.length}`
    const newLap = {
      id: newId,
      judul: `Laporan ${form.kategori} — ${wil?.nama || form.wilayahId}`,
      wilayahId: form.wilayahId,
      wilayah: wil?.nama || form.wilayahId,
      kategori: form.kategori,
      keyakinan: form.keyakinan,
      status: 'Baru',
      narasi: form.narasi,
      pengirim: 'AP-Analis-001',
      pemvalidasi: null,
      submitAt: new Date().toISOString(),
      validasiAt: null,
      lampiran: form.lampiran,
      riwayat: [
        { title: 'Laporan dikirim', time: new Date().toLocaleTimeString('id-ID'), level: 'info', desc: 'Oleh AP-Analis-001' },
        { title: 'Masuk antrian validasi', time: new Date().toLocaleTimeString('id-ID'), level: 'info', desc: null },
      ],
    }
    setLaporan(prev => [newLap, ...prev])
    setTimeout(() => setTab('antrian'), 300)
  }

  const handleVerifikasi = (id) => {
    setLaporan(prev => prev.map(l => l.id === id
      ? { ...l, status: 'Terverifikasi', pemvalidasi: 'AP-Analis-001', validasiAt: new Date().toISOString(),
          riwayat: [...l.riwayat, { title: 'Divalidasi', time: new Date().toLocaleTimeString('id-ID'), level: 'success', desc: 'Oleh AP-Analis-001' }] }
      : l
    ))
    setDrawerOpen(false)
  }

  const handleTolak = (alasan) => {
    if (!tolakTarget) return
    setLaporan(prev => prev.map(l => l.id === tolakTarget
      ? { ...l, status: 'Ditolak', alasanTolak: alasan,
          riwayat: [...l.riwayat, { title: 'Ditolak', time: new Date().toLocaleTimeString('id-ID'), level: 'critical', desc: alasan }] }
      : l
    ))
    setDrawerOpen(false)
  }

  const handleBulkVerifikasi = () => {
    setLaporan(prev => prev.map(l =>
      selectedIds.has(l.id) && (l.status === 'Baru' || l.status === 'Dalam Validasi')
        ? { ...l, status: 'Terverifikasi', pemvalidasi: 'AP-Analis-001', validasiAt: new Date().toISOString(),
            riwayat: [...l.riwayat, { title: 'Divalidasi (bulk)', time: new Date().toLocaleTimeString('id-ID'), level: 'success', desc: 'Bulk oleh AP-Analis-001' }] }
        : l
    ))
    setSelectedIds(new Set())
  }

  const handleBulkTolak = () => {
    setLaporan(prev => prev.map(l =>
      selectedIds.has(l.id) && (l.status === 'Baru' || l.status === 'Dalam Validasi')
        ? { ...l, status: 'Ditolak', alasanTolak: 'Ditolak via aksi massal.',
            riwayat: [...l.riwayat, { title: 'Ditolak (bulk)', time: new Date().toLocaleTimeString('id-ID'), level: 'critical', desc: 'Bulk oleh AP-Analis-001' }] }
        : l
    ))
    setSelectedIds(new Set())
  }

  const filtered = statusFilter === 'semua' ? laporan : laporan.filter(l => l.status === statusFilter)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: '1px solid #1F2937',
        background: '#131922', flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#E8EDF2', margin: 0 }}>
            Pengumpulan & Validasi Informasi
          </h1>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
            A.2 • {laporan.filter(l => l.status === 'Baru').length} menunggu validasi
          </p>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { id: 'input', label: 'Input Laporan', icon: FileText },
            { id: 'antrian', label: 'Antrian Validasi', icon: Clock,
              badge: laporan.filter(l => l.status === 'Baru').length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      background: tab === t.id ? 'rgba(59,130,246,0.15)' : 'transparent',
                      color: tab === t.id ? '#3B82F6' : '#7C8A99',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      boxShadow: tab === t.id ? '0 0 12px rgba(59,130,246,0.2)' : 'none',
                    }}>
              <t.icon size={13} /> {t.label}
              {t.badge > 0 && (
                <span style={{ minWidth: 16, height: 16, borderRadius: 8, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Input */}
      {tab === 'input' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <InputForm onSubmit={handleSubmit} />
        </div>
      )}

      {/* Tab: Antrian */}
      {tab === 'antrian' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', position: 'relative' }}>
          {/* Quick filter chips */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            {['semua', 'Baru','Dalam Validasi','Terverifikasi','Ditolak'].map(s => {
              const n = s === 'semua' ? laporan.length : laporan.filter(l => l.status === s).length
              const level = STATUS_LEVEL[s]
              const c = s === 'semua' ? '#7C8A99' : { success:'#22C55E', moderate:'#FACC15', info:'#3B82F6', critical:'#EF4444' }[level] || '#7C8A99'
              const active = statusFilter === s
              return (
                <button key={s} onClick={() => { setStatusFilter(s); setSelectedIds(new Set()) }}
                  style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: active ? c + '25' : 'transparent', color: c, border: `1px solid ${active ? c + '66' : c + '22'}`, cursor: 'pointer', transition: 'all 150ms' }}>
                  {n} {s === 'semua' ? 'Semua' : s}
                </button>
              )
            })}
          </div>

          <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 12, overflow: 'hidden' }}>
            <DataTable
              columns={ANTRIAN_COLS}
              data={filtered}
              onRowClick={row => { setDrawerItem(row); setDrawerOpen(true) }}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              pagination
              pageSize={15}
            />
          </div>

          {/* Floating bulk action bar */}
          {selectedIds.size > 0 && (
            <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 500, display: 'flex', alignItems: 'center', gap: 12, background: '#1A2230', border: '1px solid #3B82F688', borderRadius: 12, padding: '10px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
              <span style={{ fontSize: 12, color: '#E8EDF2', fontFamily: 'Inter', fontWeight: 500 }}>
                {selectedIds.size} dipilih
              </span>
              <div style={{ width: 1, height: 16, background: '#1F2937' }} />
              <button onClick={handleBulkVerifikasi} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
                <CheckCircle size={13} /> Verifikasi Semua
              </button>
              <button onClick={handleBulkTolak} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>
                <XCircle size={13} /> Tolak Semua
              </button>
              <button onClick={() => setSelectedIds(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', padding: 4 }}>
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detail drawer */}
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={drawerItem ? `Detail — ${drawerItem.id}` : ''}>
        {drawerItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <Badge status={drawerItem.status} />
              <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: '#E8EDF2', margin: '8px 0 0', lineHeight: 1.4 }}>
                {drawerItem.judul}
              </h3>
            </div>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Wilayah', value: drawerItem.wilayah },
                { label: 'Kategori', value: drawerItem.kategori },
                { label: 'Keyakinan', value: drawerItem.keyakinan },
                { label: 'Pengirim', value: drawerItem.pengirim, mono: true },
                { label: 'Dikirim', value: new Date(drawerItem.submitAt).toLocaleString('id-ID'), mono: true },
                { label: 'Lampiran', value: `${drawerItem.lampiran} file` },
              ].map(m => (
                <div key={m.label} style={{ background: '#0A0E13', borderRadius: 8, padding: '9px 11px', border: '1px solid #1F2937' }}>
                  <p style={{ fontSize: 9, color: '#7C8A99', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</p>
                  <p style={{ fontSize: 11, color: '#E8EDF2', margin: 0, fontFamily: m.mono ? 'JetBrains Mono, monospace' : 'Inter', fontWeight: 500 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Narasi */}
            <div>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Narasi</p>
              <p style={{ fontSize: 12, color: '#E8EDF2', lineHeight: 1.6, margin: 0, background: '#0A0E13', padding: '12px', borderRadius: 8, border: '1px solid #1F2937' }}>
                {drawerItem.narasi}
              </p>
            </div>

            {/* Alasan tolak */}
            {drawerItem.status === 'Ditolak' && drawerItem.alasanTolak && (
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px' }}>
                <p style={{ fontSize: 10, color: '#EF4444', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Alasan Penolakan</p>
                <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0, lineHeight: 1.5 }}>{drawerItem.alasanTolak}</p>
              </div>
            )}

            {/* Riwayat */}
            <div>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Riwayat Status</p>
              <Stepper steps={drawerItem.riwayat} />
            </div>

            {/* Actions */}
            {(drawerItem.status === 'Baru' || drawerItem.status === 'Dalam Validasi') && (
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => { setTolakTarget(drawerItem.id); setTolakOpen(true) }}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <XCircle size={14} /> Tolak
                </button>
                <button
                  onClick={() => handleVerifikasi(drawerItem.id)}
                  style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#22C55E,#16A34A)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 0 12px rgba(34,197,94,0.3)' }}>
                  <CheckCircle size={14} /> Verifikasi Laporan
                </button>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      <TolakModal
        open={tolakOpen}
        onClose={() => setTolakOpen(false)}
        onConfirm={handleTolak}
      />
    </div>
  )
}
