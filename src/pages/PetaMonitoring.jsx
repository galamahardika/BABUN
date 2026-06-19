import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, TrendingUp, Users, RefreshCw, List, Map as MapIcon, ChevronRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import IndonesiaMap from '../components/map/IndonesiaMap'
import HudCard from '../components/common/HudCard'
import SeverityBadge from '../components/common/SeverityBadge'
import DetailDrawer from '../components/common/DetailDrawer'
import DataTable from '../components/common/DataTable'
import wilayah from '../data/wilayah.json'
import tren from '../data/tren.json'

const LEVEL_COLOR = { critical: '#EF4444', high: '#F59E0B', moderate: '#FACC15', low: '#22C55E' }

function Sparkline({ data, color }) {
  const pts = data.slice(-14)
  const min = Math.min(...pts)
  const max = Math.max(...pts)
  const w = 80, h = 28, pad = 2
  const points = pts.map((v, i) => {
    const x = pad + (i / (pts.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - min) / (max - min + 1)) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={points.split(' ').pop().split(',')[0]} cy={points.split(' ').pop().split(',')[1]}
              r="2.5" fill={color} />
    </svg>
  )
}

function WilayahDrawer({ open, onClose, wilayahId, onViewTren }) {
  const w = wilayah.find(x => x.id === wilayahId)
  if (!w) return null
  const trenData = (tren[wilayahId] || []).map((v, i) => ({ day: i + 1, skor: v }))
  const color = LEVEL_COLOR[w.level] || '#7C8A99'

  return (
    <DetailDrawer open={open} onClose={onClose} title={`Ringkasan — ${w.nama}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#E8EDF2', margin: 0 }}>
              {w.nama}
            </p>
            <p style={{ fontSize: 11, color: '#7C8A99', margin: '2px 0 0' }}>{w.provinsi}</p>
          </div>
          <SeverityBadge level={w.level} />
        </div>

        {/* Score */}
        <div style={{ background: '#0A0E13', borderRadius: 10, padding: '16px', border: `1px solid ${color}33` }}>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Skor Risiko Saat Ini
          </p>
          <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 36, color, margin: 0, lineHeight: 1 }}>
            {w.skorRisiko}
            <span style={{ fontSize: 16, color: '#7C8A99', marginLeft: 4 }}>/100</span>
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Laporan Terkait', value: w.laporan },
            { label: 'Update Terakhir', value: new Date(w.updateAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
          ].map(s => (
            <div key={s.label} style={{ background: '#0A0E13', borderRadius: 8, padding: '12px', border: '1px solid #1F2937' }}>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14, color: '#E8EDF2', margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Tren 30 Hari
          </p>
          <div style={{ background: '#0A0E13', borderRadius: 10, padding: '12px 8px 4px', border: '1px solid #1F2937' }}>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={trenData}>
                <defs>
                  <linearGradient id={`grad-drawer-${wilayahId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ background: '#1A2230', border: '1px solid #1F2937', borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: '#7C8A99' }}
                  itemStyle={{ color }}
                  formatter={(v) => [`${v}`, 'Skor']}
                />
                <Area type="monotone" dataKey="skor" stroke={color} strokeWidth={1.5}
                      fill={`url(#grad-drawer-${wilayahId})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onViewTren}
                  style={{
                    padding: '10px 16px', borderRadius: 8, border: '1px solid #3B82F644',
                    background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
            Lihat Tren Lengkap di Tab Daftar <ChevronRight size={14} />
          </button>
          <button style={{
                    padding: '10px 16px', borderRadius: 8, border: '1px solid #1F2937',
                    background: 'transparent', color: '#7C8A99',
                    fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
            Lihat Laporan Wilayah <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </DetailDrawer>
  )
}

const TABLE_COLS = [
  { key: 'id', label: 'ID', type: 'mono', sortable: true },
  { key: 'nama', label: 'Wilayah', sortable: true },
  { key: 'provinsi', label: 'Provinsi', type: 'muted', sortable: true },
  { key: 'level', label: 'Status', type: 'severity', sortable: true },
  { key: 'skorRisiko', label: 'Skor', sortable: true,
    render: (v, row) => (
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                     color: LEVEL_COLOR[row.level] || '#7C8A99', fontSize: 12 }}>
        {v}
      </span>
    )
  },
  { key: 'tren', label: 'Tren 14H', sortable: false,
    render: (_, row) => {
      const pts = (tren[row.id] || [])
      const color = LEVEL_COLOR[row.level] || '#7C8A99'
      return <Sparkline data={pts} color={color} />
    }
  },
  { key: 'laporan', label: 'Laporan', sortable: true, type: 'muted' },
  { key: 'updateAt', label: 'Update', sortable: true, type: 'muted',
    render: (v) => new Date(v).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  },
]

export default function PetaMonitoring() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'peta'
  const setTab = (t) => setParams({ tab: t })

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedWilayahId, setSelectedWilayahId] = useState(null)

  const mapData = useMemo(() => {
    const d = {}
    wilayah.forEach(w => { d[w.id] = w })
    return d
  }, [])

  const totalKritis = wilayah.filter(w => w.level === 'critical').length
  const totalTinggi = wilayah.filter(w => w.level === 'high').length
  const avgSkor = Math.round(wilayah.reduce((s, w) => s + w.skorRisiko, 0) / wilayah.length)

  const handleNodeClick = (id) => {
    setSelectedWilayahId(id)
    setDrawerOpen(true)
  }

  const handleViewTren = () => {
    setDrawerOpen(false)
    setTab('daftar')
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid #1F2937', background: '#131922', flexShrink: 0,
      }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#E8EDF2', margin: 0 }}>
            Peta Ancaman & Monitoring Wilayah
          </h1>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
            A.5 / A.6 • {wilayah.length} wilayah aktif
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Tabs */}
          {[
            { id: 'peta', label: 'Peta', icon: MapIcon },
            { id: 'daftar', label: 'Daftar & Tren', icon: List },
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
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            borderRadius: 8, border: '1px solid #1F2937', background: 'transparent',
            color: '#7C8A99', fontSize: 11, cursor: 'pointer',
          }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Tab: Peta */}
      {tab === 'peta' && (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Full-bleed map */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <IndonesiaMap data={mapData} onProvinceClick={handleNodeClick} />
          </div>

          {/* HUD overlay — top left */}
          <div style={{
            position: 'absolute', top: 16, left: 16,
            display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10, width: 200,
          }}>
            <HudCard title="Avg Skor Nasional" value={avgSkor} sub="Dari 12 wilayah aktif"
                     accent="#3B82F6" icon={TrendingUp} />
            <HudCard title="Wilayah Kritis" value={totalKritis}
                     sub={`+ ${totalTinggi} wilayah tinggi`}
                     accent="#EF4444" icon={AlertTriangle} />
          </div>

          {/* HUD overlay — top right */}
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10, width: 200,
          }}>
            <HudCard title="Wilayah Terpantau" value={`${wilayah.length}/12`}
                     sub="Semua terhubung" accent="#22C55E" icon={Users} />
          </div>

          {/* Legend — bottom left */}
          <div style={{
            position: 'absolute', bottom: 16, left: 16, zIndex: 10,
            background: 'rgba(19,25,34,0.92)', borderRadius: 10,
            border: '1px solid #1F2937', padding: '10px 14px',
          }}>
            <p style={{ fontSize: 9, color: '#7C8A99', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Tingkat Risiko
            </p>
            {[['critical','#EF4444','Kritis (>80)'],['high','#F59E0B','Tinggi (60–80)'],
              ['moderate','#FACC15','Sedang (40–59)'],['low','#22C55E','Rendah (<40)']].map(([,c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 10, color: '#E8EDF2' }}>{l}</span>
              </div>
            ))}
          </div>

          {/* Instruction */}
          <div style={{
            position: 'absolute', bottom: 16, right: 16, zIndex: 10,
            background: 'rgba(19,25,34,0.8)', borderRadius: 8,
            border: '1px solid #1F2937', padding: '8px 12px',
            fontSize: 10, color: '#7C8A99',
          }}>
            Klik wilayah untuk melihat ringkasan
          </div>
        </div>
      )}

      {/* Tab: Daftar & Tren */}
      {tab === 'daftar' && (
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Rata-rata Skor', value: avgSkor, color: '#3B82F6' },
              { label: 'Wilayah Kritis', value: wilayah.filter(w=>w.level==='critical').length, color: '#EF4444' },
              { label: 'Wilayah Tinggi', value: wilayah.filter(w=>w.level==='high').length, color: '#F59E0B' },
              { label: 'Wilayah Rendah', value: wilayah.filter(w=>w.level==='low').length, color: '#22C55E' },
            ].map(c => (
              <div key={c.label} style={{
                background: '#131922', border: `1px solid ${c.color}22`,
                borderRadius: 10, padding: '12px 16px',
              }}>
                <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</p>
                <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 22, color: c.color, margin: 0 }}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 12, overflow: 'hidden' }}>
            <DataTable
              columns={TABLE_COLS}
              data={wilayah}
              onRowClick={row => { setSelectedWilayahId(row.id); setDrawerOpen(true) }}
            />
          </div>
        </div>
      )}

      {/* Drawer */}
      <WilayahDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        wilayahId={selectedWilayahId}
        onViewTren={handleViewTren}
      />
    </div>
  )
}
