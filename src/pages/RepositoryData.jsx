import { useState, useMemo } from 'react'
import { Database, Search, Tag, X, ChevronRight, Download, RefreshCw, Shield, Clock } from 'lucide-react'
import repoData from '../data/repository.json'

const JENIS_OPTS = ['Semua', 'Laporan Validasi', 'Laporan Intelijen', 'Hasil Analisis', 'Data Mentah', 'Data Eksternal']
const KLASIFIKASI_OPTS = ['Semua', 'Biasa', 'Terbatas', 'Rahasia']
const BACKUP_OPTS = ['Semua', 'Tersinkron', 'Tertunda']

const KLASIFIKASI_META = {
  Biasa:    { color: 'text-text-muted', bg: 'bg-white/5' },
  Terbatas: { color: 'text-amber-400',  bg: 'bg-amber-400/10' },
  Rahasia:  { color: 'text-danger',     bg: 'bg-danger/10' },
}

function KlasifikasiChip({ level }) {
  const m = KLASIFIKASI_META[level] || KLASIFIKASI_META.Biasa
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${m.color} ${m.bg}`}>
      <Shield size={10} /> {level}
    </span>
  )
}

function BackupChip({ status }) {
  if (status === 'Tersinkron') return (
    <span className="inline-flex items-center gap-1 text-xs text-success"><RefreshCw size={10} /> Tersinkron</span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-400"><Clock size={10} /> Tertunda</span>
  )
}

function DetailDrawer({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="drawer-enter ml-auto w-[460px] h-full bg-surface border-l border-border flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-xs font-mono text-text-muted">{item.id}</p>
            <h3 className="font-semibold text-text-primary mt-0.5 leading-snug pr-4">{item.judul}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5 text-text-muted flex-shrink-0"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            <KlasifikasiChip level={item.klasifikasi} />
            <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded">{item.jenis}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Wilayah</p>
              <p className="text-sm text-text-primary">{item.wilayah}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Ukuran</p>
              <p className="text-sm text-text-primary">{item.ukuran}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Versi</p>
              <p className="text-sm text-text-primary">v{item.versi}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-text-muted mb-1">Tanggal Masuk</p>
              <p className="text-sm text-text-primary">{new Date(item.tanggalMasuk).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-xs text-text-muted mb-2 flex items-center gap-1.5">
              <RefreshCw size={11} /> Status Backup
            </p>
            <BackupChip status={item.statusBackup} />
          </div>

          {item.tags.length > 0 && (
            <div>
              <p className="text-xs text-text-muted mb-2 flex items-center gap-1.5"><Tag size={11} /> Tag</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-white/5 border border-border rounded text-text-secondary">#{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button className="flex-1 py-2 rounded-lg bg-white/5 text-text-primary text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <Download size={14} /> Unduh
          </button>
          <button className="flex-1 py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
            Lihat Versi
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RepositoryData() {
  const [query, setQuery] = useState('')
  const [filterJenis, setFilterJenis] = useState('Semua')
  const [filterKlas, setFilterKlas] = useState('Semua')
  const [filterBackup, setFilterBackup] = useState('Semua')
  const [selected, setSelected] = useState(null)

  const results = useMemo(() => {
    let list = repoData
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(r =>
        r.judul.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    if (filterJenis !== 'Semua') list = list.filter(r => r.jenis === filterJenis)
    if (filterKlas !== 'Semua') list = list.filter(r => r.klasifikasi === filterKlas)
    if (filterBackup !== 'Semua') list = list.filter(r => r.statusBackup === filterBackup)
    return list
  }, [query, filterJenis, filterKlas, filterBackup])

  const stats = {
    total: repoData.length,
    tersinkron: repoData.filter(r => r.statusBackup === 'Tersinkron').length,
    tertunda: repoData.filter(r => r.statusBackup === 'Tertunda').length,
    ukuranTotal: '43.5 MB',
  }

  const hasFilter = filterJenis !== 'Semua' || filterKlas !== 'Semua' || filterBackup !== 'Semua' || query.trim()
  const clearAll = () => { setQuery(''); setFilterJenis('Semua'); setFilterKlas('Semua'); setFilterBackup('Semua') }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary font-display">Repository Data Intelijen</h1>
            <p className="text-sm text-text-muted mt-1">Modul A.10 — Pencarian dan manajemen data intelijen tersimpan</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Entri', val: stats.total, color: 'text-text-primary' },
            { label: 'Tersinkron', val: stats.tersinkron, color: 'text-success' },
            { label: 'Backup Tertunda', val: stats.tertunda, color: 'text-amber-400' },
            { label: 'Total Ukuran', val: stats.ukuranTotal, color: 'text-accent' },
          ].map(s => (
            <div key={s.label} className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color} font-display`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Cari berdasarkan ID, judul, atau tag..."
              className="w-full bg-white/5 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted/40"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Jenis:</span>
              <div className="flex gap-1 flex-wrap">
                {JENIS_OPTS.map(o => (
                  <button key={o} onClick={() => setFilterJenis(o)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${filterJenis === o ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Klasifikasi:</span>
              <div className="flex gap-1">
                {KLASIFIKASI_OPTS.map(o => (
                  <button key={o} onClick={() => setFilterKlas(o)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${filterKlas === o ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Backup:</span>
              <div className="flex gap-1">
                {BACKUP_OPTS.map(o => (
                  <button key={o} onClick={() => setFilterBackup(o)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${filterBackup === o ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            {hasFilter && (
              <button onClick={clearAll} className="ml-auto flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors">
                <X size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Database size={15} className="text-accent" /> Hasil Pencarian
            </h3>
            <span className="text-xs text-text-muted">{results.length} entri ditemukan</span>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16">
              <Database size={32} className="text-text-muted/30 mx-auto mb-3" />
              <p className="text-sm text-text-muted">Tidak ada data yang cocok dengan filter.</p>
              <button onClick={clearAll} className="mt-3 text-xs text-accent hover:underline">Reset filter</button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {results.map(item => (
                <div key={item.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 cursor-pointer transition-colors group"
                  onClick={() => setSelected(item)}>
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Database size={14} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-mono text-accent">{item.id}</p>
                      <KlasifikasiChip level={item.klasifikasi} />
                      <span className="text-xs text-text-muted px-1.5 py-0.5 bg-white/5 rounded">{item.jenis}</span>
                    </div>
                    <p className="text-sm text-text-primary truncate">{item.judul}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-text-muted">{item.wilayah}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">{item.ukuran}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <span className="text-xs text-text-muted">v{item.versi}</span>
                      <span className="text-xs text-text-muted">·</span>
                      <BackupChip status={item.statusBackup} />
                    </div>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {item.tags.map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 bg-white/5 text-text-muted rounded">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-text-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && <DetailDrawer item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
