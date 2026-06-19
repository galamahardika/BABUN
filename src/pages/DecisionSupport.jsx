import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Brain, CheckCircle, XCircle, Clock, ChevronRight, TrendingDown, AlertTriangle, ArrowLeft } from 'lucide-react'
import SeverityBadge from '../components/common/SeverityBadge'
import { useDSS } from '../context/DSSContext'

const STATUS_CFG = {
  'Baru':     { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)'  },
  'Ditinjau': { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  'Diadopsi': { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
  'Ditolak':  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
}

const PARAM_LABELS = {
  intensitasPatroli: 'Intensitas Patroli',
  alokasiSumber:     'Alokasi Sumber Daya',
  alokasiBerbagi:    'Alokasi Berbagi Data',
  intensitasValidasi:'Intensitas Validasi',
  unitDipindah:      'Unit Dipindah',
  durasiHari:        'Durasi (Hari)',
}

function ScenarioPanel({ rec, onClose, onAdopt, onReject }) {
  const [params, setParams] = useState({ ...rec.parameter })
  const navigate = useNavigate()

  // Recompute projected scores based on slider deltas
  const computedProyeksi = rec.proyeksi.map((base, i) => {
    const intensityFactor = (params.intensitasPatroli ?? params.intensitasValidasi ?? 50) / 100
    const delta = (rec.proyeksi[0] - rec.proyeksi[rec.proyeksi.length - 1]) * intensityFactor
    const val = rec.proyeksi[0] - (delta / (rec.proyeksi.length - 1)) * i
    return Math.round(Math.max(20, val))
  })

  const chartData = computedProyeksi.map((v, i) => ({ hari: `H+${i * 2}`, skor: v, baseline: rec.proyeksi[i] }))
  const finalSkor = computedProyeksi[computedProyeksi.length - 1]
  const reduction = rec.proyeksi[0] - finalSkor
  const confidenceAdj = Math.min(95, Math.max(40,
    rec.confidence + Math.round(((params.intensitasPatroli ?? params.intensitasValidasi ?? 50) - 50) / 10)
  ))

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(10,14,19,0.8)',
      display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: 520, height: '100%', background: '#131922',
        borderLeft: '1px solid #1F2937', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.5)',
        animation: 'slide-in-right 200ms ease forwards',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <ArrowLeft size={16} color="#7C8A99" />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: '#E8EDF2', margin: 0 }}>
                Simulasi Skenario
              </p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7C8A99', margin: '2px 0 0' }}>
                {rec.id} · {rec.wilayah}
              </p>
            </div>
            <div style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: confidenceAdj >= 80 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
              color: confidenceAdj >= 80 ? '#22C55E' : '#F59E0B',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              Conf: {confidenceAdj}%
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0, lineHeight: 1.4 }}>{rec.ringkasan}</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* Proyeksi chart */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Proyeksi Skor Risiko
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 10, color: '#7C8A99' }}>Skor awal: <b style={{ color: '#E8EDF2', fontFamily: 'JetBrains Mono, monospace' }}>{computedProyeksi[0]}</b></span>
                <span style={{ fontSize: 10, color: '#22C55E' }}>
                  Proyeksi: <b style={{ fontFamily: 'JetBrains Mono, monospace' }}>{finalSkor}</b>
                  <span style={{ marginLeft: 4 }}>↓{reduction}</span>
                </span>
              </div>
            </div>
            <div style={{ background: '#0A0E13', borderRadius: 10, padding: '12px 8px 4px', border: '1px solid #1F2937' }}>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad-proj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad-base" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C8A99" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#7C8A99" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hari" tick={{ fill: '#7C8A99', fontSize: 8, fontFamily: 'JetBrains Mono' }} />
                  <YAxis domain={[20, rec.proyeksi[0] + 5]} tick={{ fill: '#7C8A99', fontSize: 8 }} />
                  <Tooltip
                    contentStyle={{ background: '#1A2230', border: '1px solid #1F2937', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: '#7C8A99' }}
                  />
                  <Area type="monotone" dataKey="baseline" stroke="#7C8A99" strokeWidth={1}
                        fill="url(#grad-base)" dot={false} strokeDasharray="4 3" name="Tanpa intervensi" />
                  <Area type="monotone" dataKey="skor" stroke="#3B82F6" strokeWidth={2}
                        fill="url(#grad-proj)" dot={false} name="Dengan intervensi" />
                  <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="3 3" strokeWidth={1} />
                  <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {[['#3B82F6','Proyeksi intervensi'],['#7C8A99','Tanpa intervensi'],['#F59E0B','Ambang Tinggi (60)'],['#EF4444','Ambang Kritis (80)']].map(([c,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 16, height: 2, background: c }} />
                  <span style={{ fontSize: 9, color: '#7C8A99' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parameter sliders */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Parameter Skenario
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(params).map(([key, val]) => {
                const label = PARAM_LABELS[key] || key
                const max = key === 'durasiHari' ? 30 : key === 'unitDipindah' ? 10 : 100
                const pct = (val / max) * 100
                const sliderColor = pct >= 70 ? '#22C55E' : pct >= 40 ? '#3B82F6' : '#F59E0B'
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#E8EDF2' }}>{label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sliderColor, fontWeight: 700 }}>
                        {val}{key === 'durasiHari' || key === 'unitDipindah' ? '' : '%'}
                      </span>
                    </div>
                    <div style={{ position: 'relative', height: 6 }}>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 3, background: '#1F2937' }} />
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${pct}%`, borderRadius: 3,
                        background: `linear-gradient(90deg, ${sliderColor}88, ${sliderColor})`,
                      }} />
                      <input type="range" min={0} max={max} value={val}
                             onChange={e => setParams(p => ({ ...p, [key]: parseInt(e.target.value) }))}
                             style={{
                               position: 'absolute', inset: 0, width: '100%',
                               opacity: 0, cursor: 'pointer', height: '100%', margin: 0,
                             }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rasional */}
          <div style={{ background: '#0A0E13', borderRadius: 10, padding: '12px 14px', border: '1px solid #1F2937', marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Rasional Analis</p>
            <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0, lineHeight: 1.6 }}>{rec.rasional}</p>
            <p style={{ fontSize: 10, color: '#7C8A99', margin: '8px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
              Analis: {rec.analis} · {new Date(rec.tanggal).toLocaleDateString('id-ID')}
            </p>
          </div>

          {/* Tolak modal inline */}
          {rec.alasanTolak && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
              <p style={{ fontSize: 10, color: '#EF4444', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Alasan Ditolak</p>
              <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0 }}>{rec.alasanTolak}</p>
            </div>
          )}
        </div>

        {/* Action footer */}
        {rec.status !== 'Diadopsi' && rec.status !== 'Ditolak' && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid #1F2937', flexShrink: 0, display: 'flex', gap: 10 }}>
            <button onClick={() => onReject(rec.id)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)', color: '#EF4444',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
              <XCircle size={14} /> Tolak
            </button>
            <button onClick={() => onAdopt(rec.id)}
                    style={{
                      flex: 2, padding: '10px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg,#22C55E,#16A34A)',
                      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      boxShadow: '0 0 12px rgba(34,197,94,0.3)',
                    }}>
              <CheckCircle size={14} /> Diadopsi
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function RekCard({ rec, onView }) {
  const cfg = STATUS_CFG[rec.status] || STATUS_CFG['Baru']
  const confColor = rec.confidence >= 80 ? '#22C55E' : rec.confidence >= 65 ? '#F59E0B' : '#7C8A99'

  return (
    <div style={{
      background: '#131922', border: `1px solid ${cfg.border}`,
      borderRadius: 12, padding: '16px',
      display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'box-shadow 150ms',
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 16px ${cfg.color}22`}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
            }}>{rec.status}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#7C8A99', alignSelf: 'center' }}>{rec.id}</span>
          </div>
          <p style={{ fontSize: 13, color: '#E8EDF2', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
            {rec.ringkasan}
          </p>
        </div>
        {/* Confidence ring */}
        <div style={{ flexShrink: 0, textAlign: 'center', width: 52 }}>
          <svg width={52} height={52} viewBox="0 0 52 52">
            <circle cx={26} cy={26} r={22} fill="none" stroke="#1F2937" strokeWidth={4} />
            <circle cx={26} cy={26} r={22} fill="none" stroke={confColor} strokeWidth={4}
                    strokeDasharray={`${2 * Math.PI * 22 * rec.confidence / 100} 999`}
                    strokeLinecap="round"
                    transform="rotate(-90 26 26)"
                    style={{ transition: 'stroke-dasharray 500ms ease' }} />
            <text x={26} y={30} textAnchor="middle" fill={confColor}
                  fontSize={11} fontWeight="700" fontFamily="JetBrains Mono, monospace">
              {rec.confidence}%
            </text>
          </svg>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: '#7C8A99', background: '#0A0E13', padding: '3px 8px', borderRadius: 4, border: '1px solid #1F2937' }}>
          {rec.wilayah}
        </span>
        <span style={{ fontSize: 10, color: '#7C8A99' }}>
          Analis: <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E8EDF2' }}>{rec.analis}</span>
        </span>
        <span style={{ fontSize: 10, color: '#7C8A99', marginLeft: 'auto' }}>
          {new Date(rec.tanggal).toLocaleDateString('id-ID')}
        </span>
      </div>

      {/* Footer */}
      {rec.alasanTolak && (
        <p style={{ fontSize: 10, color: '#EF4444', margin: 0, background: 'rgba(239,68,68,0.06)', padding: '6px 8px', borderRadius: 6 }}>
          Ditolak: {rec.alasanTolak}
        </p>
      )}

      <button onClick={() => onView(rec)}
              style={{
                padding: '8px', borderRadius: 8,
                border: `1px solid ${cfg.color}44`,
                background: `${cfg.color}0D`,
                color: cfg.color, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
        Lihat Skenario <ChevronRight size={12} />
      </button>
    </div>
  )
}

const STATUS_FILTER = ['Semua', 'Baru', 'Ditinjau', 'Diadopsi', 'Ditolak']

export default function DecisionSupport() {
  const navigate = useNavigate()
  const { rekomendasi, updateStatus } = useDSS()
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [scenarioRec, setScenarioRec] = useState(null)

  const filtered = filterStatus === 'Semua'
    ? rekomendasi
    : rekomendasi.filter(r => r.status === filterStatus)

  const counts = {
    Baru:     rekomendasi.filter(r => r.status === 'Baru').length,
    Diadopsi: rekomendasi.filter(r => r.status === 'Diadopsi').length,
    Ditolak:  rekomendasi.filter(r => r.status === 'Ditolak').length,
  }

  const handleAdopt = (id) => {
    updateStatus(id, 'Diadopsi')
    setScenarioRec(null)
  }

  const handleReject = (id) => {
    updateStatus(id, 'Ditolak', 'Tidak sesuai prioritas operasional saat ini.')
    setScenarioRec(null)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: '1px solid #1F2937',
        background: '#131922', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3B82F6,#22D3D8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(59,130,246,0.3)' }}>
            <Brain size={16} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#E8EDF2', margin: 0 }}>
              Decision Support System
            </h1>
            <p style={{ fontSize: 10, color: '#7C8A99', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
              A.11 • {rekomendasi.length} rekomendasi total
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[['#3B82F6', counts.Baru, 'Baru'], ['#22C55E', counts.Diadopsi, 'Diadopsi'], ['#EF4444', counts.Ditolak, 'Ditolak']].map(([c, n, l]) => (
              <span key={l} style={{ padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: c + '15', color: c, border: `1px solid ${c}33` }}>
                {n} {l}
              </span>
            ))}
          </div>
          <button onClick={() => navigate('/analisis-ancaman')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                    borderRadius: 8, border: '1px solid #1F2937',
                    background: 'transparent', color: '#7C8A99', fontSize: 11, cursor: 'pointer',
                  }}>
            <ArrowLeft size={12} /> Kembali ke Analisis
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, padding: '8px 20px',
        borderBottom: '1px solid #1F2937', background: '#0A0E13', flexShrink: 0,
      }}>
        {STATUS_FILTER.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '4px 12px', borderRadius: 6, border: 'none',
                    background: filterStatus === s ? 'rgba(59,130,246,0.15)' : 'transparent',
                    color: filterStatus === s ? '#3B82F6' : '#7C8A99',
                    fontSize: 11, cursor: 'pointer',
                  }}>
            {s} {s !== 'Semua' && `(${rekomendasi.filter(r => r.status === s).length})`}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#7C8A99' }}>
          Klik "Lihat Skenario" untuk simulasi interaktif
        </span>
      </div>

      {/* Cards grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#7C8A99' }}>
            <Brain size={32} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p style={{ fontSize: 13 }}>Tidak ada rekomendasi di kategori ini</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
            {filtered.map(r => (
              <RekCard key={r.id} rec={r} onView={setScenarioRec} />
            ))}
          </div>
        )}

        {/* Info note */}
        <div style={{ marginTop: 20, padding: '10px 16px', borderRadius: 8, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={12} color="#3B82F6" />
          <p style={{ fontSize: 11, color: '#7C8A99', margin: 0 }}>
            Confidence score merepresentasikan tingkat keyakinan analis berdasarkan data historis — bukan keputusan otomatis sistem. Setiap keputusan "Diadopsi" atau "Ditolak" tercatat di jejak audit (A.13).
          </p>
        </div>
      </div>

      {/* Scenario panel */}
      {scenarioRec && (
        <ScenarioPanel
          rec={scenarioRec}
          onClose={() => setScenarioRec(null)}
          onAdopt={handleAdopt}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
