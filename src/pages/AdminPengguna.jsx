import { useState } from 'react'
import { Users, Shield, Plus, Search, X, CheckCircle, XCircle, AlertCircle, Edit2, ShieldCheck, ShieldOff } from 'lucide-react'
import data from '../data/pengguna.json'

const STATUS_META = {
  Aktif:        { color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
  Nonaktif:     { color: 'text-text-muted', bg: 'bg-white/5', icon: XCircle },
  Ditangguhkan: { color: 'text-danger', bg: 'bg-danger/10', icon: AlertCircle },
}

const PERAN_COLOR = {
  Administrator:       'text-purple-400 bg-purple-400/10',
  Pimpinan:            'text-accent bg-accent/10',
  'Analis Senior':     'text-amber-400 bg-amber-400/10',
  Analis:              'text-text-secondary bg-white/5',
  'Koordinator Wilayah': 'text-cyan-400 bg-cyan-400/10',
  Operator:            'text-text-muted bg-white/5',
  Auditor:             'text-green-400 bg-green-400/10',
}

const MODUL_LABELS = {
  'A.1':'Jaringan Intelijen', 'A.2':'Pengumpulan Informasi', 'A.3':'Analisis Ancaman',
  'A.4':'Early Warning', 'A.5':'Peta Monitoring', 'A.6':'Daftar Wilayah',
  'A.7':'Pertukaran Informasi', 'A.8':'Dashboard Pimpinan', 'A.9':'Laporan Intelijen',
  'A.10':'Repository Data', 'A.11':'Decision Support', 'A.12':'Pengguna & Hak Akses', 'A.13':'Audit Keamanan',
}

function StatusChip({ status }) {
  const m = STATUS_META[status] || STATUS_META.Nonaktif
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${m.color} ${m.bg}`}>
      <Icon size={11} /> {status}
    </span>
  )
}

function PeranChip({ peran }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${PERAN_COLOR[peran] || 'text-text-muted bg-white/5'}`}>
      {peran}
    </span>
  )
}

function UserDrawer({ user, onClose, onStatusChange }) {
  const [tab, setTab] = useState('profil')
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="drawer-enter ml-auto w-[480px] h-full bg-surface border-l border-border flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-xs font-mono text-text-muted">{user.id}</p>
            <h3 className="font-semibold text-text-primary mt-0.5">{user.nama}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-text-muted"><X size={18} /></button>
        </div>

        <div className="flex border-b border-border px-6">
          {['profil', 'hak-akses'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 px-4 text-xs font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
              {t === 'hak-akses' ? 'Hak Akses' : 'Profil'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'profil' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusChip status={user.status} />
                <PeranChip peran={user.peran} />
                {user.mfa && (
                  <span className="inline-flex items-center gap-1 text-xs text-success px-2 py-0.5 bg-success/10 rounded">
                    <ShieldCheck size={11} /> MFA Aktif
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { label: 'Username', val: user.username },
                  { label: 'Email', val: user.email },
                  { label: 'Satuan', val: user.satuan },
                  { label: 'Dibuat', val: new Date(user.dibuatAt).toLocaleDateString('id-ID') },
                  { label: 'Terakhir Aktif', val: new Date(user.terakhirAktif).toLocaleString('id-ID') },
                ].map(f => (
                  <div key={f.label} className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-text-muted mb-1">{f.label}</p>
                    <p className="text-sm text-text-primary font-mono">{f.val}</p>
                  </div>
                ))}
              </div>
              {!user.mfa && (
                <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300">MFA belum diaktifkan. Disarankan untuk mengaktifkan autentikasi dua faktor.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-xs text-text-muted mb-2">Peran Saat Ini</p>
                <PeranChip peran={user.peran} />
              </div>
              <div>
                <p className="text-xs text-text-muted mb-3">Akses Modul</p>
                <div className="space-y-1.5">
                  {Object.entries(MODUL_LABELS).map(([code, nama]) => {
                    const peranData = data.peran.find(p => p.nama === user.peran)
                    const hasAccess = peranData?.modul.includes(code)
                    return (
                      <div key={code} className={`flex items-center justify-between px-3 py-2 rounded-lg ${hasAccess ? 'bg-success/5' : 'bg-white/3 opacity-40'}`}>
                        <span className="text-xs text-text-secondary">{code} — {nama}</span>
                        {hasAccess
                          ? <CheckCircle size={13} className="text-success flex-shrink-0" />
                          : <XCircle size={13} className="text-text-muted flex-shrink-0" />
                        }
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button className="flex-1 py-2 rounded-lg bg-white/5 text-text-primary text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <Edit2 size={13} /> Edit
          </button>
          {user.status === 'Aktif' ? (
            <button onClick={() => onStatusChange(user.id, 'Ditangguhkan')}
              className="flex-1 py-2 rounded-lg bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors flex items-center justify-center gap-2">
              <ShieldOff size={13} /> Tangguhkan
            </button>
          ) : (
            <button onClick={() => onStatusChange(user.id, 'Aktif')}
              className="flex-1 py-2 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors flex items-center justify-center gap-2">
              <ShieldCheck size={13} /> Aktifkan
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TambahModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ nama: '', username: '', email: '', peran: '', satuan: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const valid = form.nama && form.username && form.email && form.peran && form.satuan

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[520px] bg-surface border border-border rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Tambah Pengguna Baru</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-text-muted"><X size={18} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { key: 'nama', label: 'Nama Lengkap', ph: 'Nama pengguna' },
            { key: 'username', label: 'Username', ph: 'format: nama.unit' },
            { key: 'email', label: 'Email', ph: 'nama@sim-latihan.internal' },
            { key: 'satuan', label: 'Satuan / Unit', ph: 'cth: Pusat BNPT, SAT-W-02' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-text-muted mb-1.5">{f.label}</label>
              <input value={form[f.key]} onChange={set(f.key)} placeholder={f.ph}
                className="w-full bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/40" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-xs text-text-muted mb-1.5">Peran</label>
            <div className="grid grid-cols-4 gap-2">
              {data.peran.map(p => (
                <button key={p.id} onClick={() => setForm(f => ({ ...f, peran: p.nama }))}
                  className={`text-xs px-2 py-2 rounded-lg border transition-colors text-left ${form.peran === p.nama ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                  {p.nama}
                </button>
              ))}
            </div>
          </div>
          {form.peran && (
            <div className="col-span-2 bg-accent/5 border border-accent/20 rounded-lg p-3">
              <p className="text-xs text-accent">{data.peran.find(p => p.nama === form.peran)?.deskripsi}</p>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-text-muted hover:bg-white/5 transition-colors">Batal</button>
          <button onClick={() => valid && onSubmit(form)} disabled={!valid}
            className="px-4 py-2 rounded-lg text-sm bg-accent text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus size={14} /> Tambahkan
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPengguna() {
  const [pengguna, setPengguna] = useState(data.pengguna)
  const [selected, setSelected] = useState(null)
  const [showTambah, setShowTambah] = useState(false)
  const [query, setQuery] = useState('')
  const [filterPeran, setFilterPeran] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [activeTab, setActiveTab] = useState('pengguna')
  const [toast, setToast] = useState(null)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const handleStatusChange = (id, newStatus) => {
    setPengguna(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
    setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    showToast(`Status pengguna diperbarui menjadi ${newStatus}.`)
  }

  const handleTambah = form => {
    const newUser = {
      id: `USR-${String(pengguna.length + 1).padStart(3, '0')}`,
      ...form,
      status: 'Aktif',
      terakhirAktif: null,
      dibuatAt: new Date().toISOString(),
      mfa: false,
    }
    setPengguna(prev => [newUser, ...prev])
    setShowTambah(false)
    showToast(`Pengguna ${newUser.username} berhasil ditambahkan.`)
  }

  const filtered = pengguna.filter(u => {
    const matchQ = !query.trim() || u.nama.toLowerCase().includes(query.toLowerCase()) || u.username.toLowerCase().includes(query.toLowerCase())
    const matchP = filterPeran === 'Semua' || u.peran === filterPeran
    const matchS = filterStatus === 'Semua' || u.status === filterStatus
    return matchQ && matchP && matchS
  })

  const stats = {
    total: pengguna.length,
    aktif: pengguna.filter(u => u.status === 'Aktif').length,
    mfa: pengguna.filter(u => u.mfa).length,
    tangguh: pengguna.filter(u => u.status === 'Ditangguhkan').length,
  }

  const peranList = ['Semua', ...data.peran.map(p => p.nama)]
  const statusList = ['Semua', 'Aktif', 'Nonaktif', 'Ditangguhkan']

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-success/20 border border-success/40 text-success text-sm px-4 py-2 rounded-lg shadow-lg">{toast}</div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary font-display">Pengguna & Hak Akses</h1>
            <p className="text-sm text-text-muted mt-1">Modul A.12 — Manajemen akun dan kontrol akses berbasis peran</p>
          </div>
          <button onClick={() => setShowTambah(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus size={16} /> Tambah Pengguna
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Pengguna', val: stats.total, color: 'text-text-primary' },
            { label: 'Aktif', val: stats.aktif, color: 'text-success' },
            { label: 'MFA Aktif', val: stats.mfa, color: 'text-accent' },
            { label: 'Ditangguhkan', val: stats.tangguh, color: 'text-danger' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color} font-display`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {[{ id: 'pengguna', label: 'Daftar Pengguna', icon: Users }, { id: 'peran', label: 'Manajemen Peran', icon: Shield }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'pengguna' ? (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-3 flex-wrap items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama atau username..."
                  className="w-full bg-surface border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/40" />
              </div>
              <div className="flex gap-1 flex-wrap">
                {statusList.map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-1.5 rounded text-xs transition-colors ${filterStatus === s ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">ID</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Nama / Username</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Peran</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Satuan</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">MFA</th>
                    <th className="text-left px-4 py-2.5 text-xs text-text-muted font-medium">Terakhir Aktif</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id} onClick={() => setSelected(u)}
                      className="border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-accent">{u.id}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-primary">{u.nama}</p>
                        <p className="text-xs text-text-muted font-mono">{u.username}</p>
                      </td>
                      <td className="px-4 py-3"><PeranChip peran={u.peran} /></td>
                      <td className="px-4 py-3 text-xs text-text-secondary">{u.satuan}</td>
                      <td className="px-4 py-3"><StatusChip status={u.status} /></td>
                      <td className="px-4 py-3">
                        {u.mfa
                          ? <ShieldCheck size={14} className="text-success" />
                          : <ShieldOff size={14} className="text-text-muted/40" />
                        }
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted font-mono">
                        {u.terakhirAktif ? new Date(u.terakhirAktif).toLocaleDateString('id-ID') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-12 text-text-muted text-sm">Tidak ada pengguna ditemukan.</div>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {data.peran.map(p => (
              <div key={p.id} className="bg-surface border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <PeranChip peran={p.nama} />
                    <p className="text-xs text-text-muted mt-2">{p.deskripsi}</p>
                  </div>
                  <span className="text-xs font-mono text-text-muted">{p.jumlahPengguna} user</span>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-2">Akses Modul:</p>
                  <div className="flex flex-wrap gap-1">
                    {p.modul.map(m => (
                      <span key={m} className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent rounded">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <UserDrawer user={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />}
      {showTambah && <TambahModal onClose={() => setShowTambah(false)} onSubmit={handleTambah} />}
    </div>
  )
}
