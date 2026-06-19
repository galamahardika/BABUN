import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Send, FileText, Link, TrendingUp, AlertTriangle, ChevronRight, CheckCircle, MessageSquare, RotateCcw } from 'lucide-react'
import SeverityBadge from '../components/common/SeverityBadge'
import { useDSS } from '../context/DSSContext'
import analisisData from '../data/analisis.json'
import laporanData from '../data/laporan.json'

const LEVEL_COLOR = { critical: '#EF4444', high: '#F59E0B', moderate: '#FACC15', low: '#22C55E' }

// Build chart data from trenMultiWilayah
function buildChartData(tren) {
  return tren.labels.map((label, i) => {
    const row = { label }
    tren.series.forEach(s => { row[s.wilayahId] = s.data[i] })
    return row
  })
}

function KasusList({ kasus, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {kasus.map(k => {
        const isSelected = selected?.id === k.id
        const color = LEVEL_COLOR[k.level] || '#7C8A99'
        return (
          <div key={k.id} onClick={() => onSelect(k)}
               style={{
                 padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                 border: isSelected ? `1px solid ${color}66` : '1px solid #1F2937',
                 background: isSelected ? `${color}0D` : 'transparent',
                 transition: 'all 120ms',
               }}
               onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
               onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <SeverityBadge level={k.level} size="xs" />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#7C8A99' }}>{k.id}</span>
            </div>
            <p style={{ fontSize: 12, fontWeight: isSelected ? 600 : 400, color: '#E8EDF2', margin: '0 0 2px' }}>
              {k.wilayah}
            </p>
            <p style={{ fontSize: 10, color: '#7C8A99', margin: 0 }}>{k.provinsi}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color }}>
                {k.skorRisiko}
              </span>
              <span style={{ fontSize: 9, color: '#7C8A99', textAlign: 'right', lineHeight: 1.3 }}>{k.pola}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1A2230', border: '1px solid #1F2937', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 6px' }}>Hari {label}</p>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: 11, color: '#E8EDF2' }}>{analisisData.trenMultiWilayah.series.find(s => s.wilayahId === p.dataKey)?.nama}: </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: p.color, fontFamily: 'JetBrains Mono, monospace' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalisisAncaman() {
  const navigate = useNavigate()
  const { tambahRekomendasi, rekomendasi } = useDSS()
  const menungguRevisi = rekomendasi.filter(r => r.status === 'Ditolak' && r.alasanTolak)
  const [selected, setSelected] = useState(analisisData.kasusAktif[0])
  const [narasiRek, setNarasiRek] = useState('')
  const [kirimSuccess, setKirimSuccess] = useState(false)
  const rekIdRef = useRef(5)

  const chartData = buildChartData(analisisData.trenMultiWilayah)
  const { trenMultiWilayah } = analisisData

  const laporanTerkait = laporanData.filter(l => selected?.laporanSumber?.includes(l.id))
  const color = LEVEL_COLOR[selected?.level] || '#7C8A99'

  const handleKirimDSS = () => {
    if (!narasiRek.trim() || !selected) return
    const newId = `RK-2024-00${rekIdRef.current++}`
    tambahRekomendasi({
      id: newId,
      ringkasan: narasiRek.trim(),
      rasional: `Rekomendasi berdasarkan analisis ${selected.wilayah} — pola ${selected.pola}. Skor risiko saat ini: ${selected.skorRisiko}.`,
      confidence: Math.round(60 + Math.random() * 20),
      wilayahId: selected.wilayahId,
      wilayah: selected.wilayah,
      analis: 'AP-Analis-001',
      tanggal: new Date().toISOString(),
      status: 'Baru',
      parameter: { intensitasPatroli: 60, alokasiSumber: 50, durasiHari: 3 },
      proyeksi: Array.from({ length: 15 }, (_, i) =>
        Math.max(20, selected.skorRisiko - i * ((selected.skorRisiko - 45) / 14))
      ).map(v => Math.round(v)),
    })
    setNarasiRek('')
    setKirimSuccess(true)
    setTimeout(() => setKirimSuccess(false), 3000)
  }

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
            Analisis Ancaman & Threat Assessment
          </h1>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
            A.3 • {analisisData.kasusAktif.length} kasus aktif
          </p>
        </div>
        <button onClick={() => navigate('/decision-support')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                  borderRadius: 8, border: '1px solid rgba(59,130,246,0.3)',
                  background: 'rgba(59,130,246,0.08)', color: '#3B82F6',
                  fontSize: 11, cursor: 'pointer',
                }}>
          Lihat Decision Support System <ChevronRight size={12} />
        </button>
      </div>

      {/* 3-column workbench */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr 280px', overflow: 'hidden' }}>

        {/* ── Kolom Kiri: Daftar Kasus ── */}
        <div style={{
          borderRight: '1px solid #1F2937', background: '#0A0E13',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
            <p style={{ fontSize: 9, color: '#7C8A99', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Wilayah / Kasus Aktif
            </p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <KasusList
              kasus={analisisData.kasusAktif}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </div>

        {/* ── Kolom Tengah: Chart + Skor + Editor Rekomendasi ── */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0A0E13' }}>
          {/* Skor risiko besar */}
          {selected && (
            <div style={{
              flexShrink: 0, padding: '16px 20px',
              borderBottom: '1px solid #1F2937',
              background: '#131922',
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <div>
                <p style={{ fontSize: 9, color: '#7C8A99', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Skor Risiko — {selected.wilayah}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 48, color, lineHeight: 1 }}>
                    {selected.skorRisiko}
                  </span>
                  <span style={{ fontSize: 16, color: '#7C8A99' }}>/100</span>
                  <SeverityBadge level={selected.level} />
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 9, color: '#7C8A99', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Pola Teridentifikasi</p>
                <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0 }}>{selected.pola}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7C8A99', margin: '2px 0 0' }}>
                  {selected.id} · Analis: {selected.analis}
                </p>
              </div>
            </div>
          )}

          {/* Multi-wilayah trend chart */}
          <div style={{ flex: 1, padding: '16px 20px 8px', overflow: 'hidden', minHeight: 0 }}>
            <p style={{ fontSize: 9, color: '#7C8A99', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Tren Skor Risiko Multi-Wilayah (30 Hari)
            </p>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="label" tick={{ fill: '#7C8A99', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                <YAxis domain={[20, 100]} tick={{ fill: '#7C8A99', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => {
                    const s = trenMultiWilayah.series.find(x => x.wilayahId === val)
                    return <span style={{ color: '#7C8A99', fontSize: 10 }}>{s?.nama || val}</span>
                  }}
                  wrapperStyle={{ fontSize: 10 }}
                />
                {trenMultiWilayah.series.map(s => (
                  <Line key={s.wilayahId} type="monotone" dataKey={s.wilayahId}
                        stroke={s.color} strokeWidth={selected?.wilayahId === s.wilayahId ? 2.5 : 1.2}
                        dot={false} activeDot={{ r: 4, fill: s.color }}
                        strokeOpacity={selected?.wilayahId === s.wilayahId ? 1 : 0.4} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Rekomendasi strategis editor */}
          <div style={{
            flexShrink: 0, borderTop: '1px solid #1F2937',
            padding: '14px 20px', background: '#131922',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 9, color: '#7C8A99', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
                Rekomendasi Strategis
              </p>
              {kirimSuccess && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#22C55E' }}>
                  <CheckCircle size={13} /> Terkirim ke DSS
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <textarea
                value={narasiRek}
                onChange={e => setNarasiRek(e.target.value)}
                placeholder={`Tulis rekomendasi strategis untuk ${selected?.wilayah || 'wilayah terpilih'}…`}
                rows={3}
                style={{
                  flex: 1, background: '#1A2230', border: '1px solid #1F2937',
                  borderRadius: 8, padding: '9px 12px', color: '#E8EDF2',
                  fontSize: 12, fontFamily: 'Inter', outline: 'none',
                  resize: 'none', lineHeight: 1.5,
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#1F2937'}
              />
              <button onClick={handleKirimDSS} disabled={!narasiRek.trim()}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '0 16px', borderRadius: 8, border: 'none',
                        background: narasiRek.trim() ? 'linear-gradient(135deg,#3B82F6,#2563EB)' : '#1F2937',
                        color: narasiRek.trim() ? '#fff' : '#7C8A99',
                        fontSize: 11, fontWeight: 600, cursor: narasiRek.trim() ? 'pointer' : 'not-allowed',
                        boxShadow: narasiRek.trim() ? '0 0 14px rgba(59,130,246,0.3)' : 'none',
                        minWidth: 90, alignSelf: 'stretch',
                      }}>
                <Send size={14} />
                Kirim ke<br />DSS
              </button>
            </div>
          </div>
        </div>

        {/* ── Kolom Kanan: Korelasi & Sumber ── */}
        <div style={{
          borderLeft: '1px solid #1F2937', background: '#131922',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
            <p style={{ fontSize: 9, color: '#7C8A99', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Korelasi & Sumber
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {/* Korelasi wilayah */}
            <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 8px', fontWeight: 600 }}>Korelasi Wilayah Terkait</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {analisisData.kasusAktif
                .filter(k => k.id !== selected?.id)
                .slice(0, 4)
                .map(k => {
                  const c = LEVEL_COLOR[k.level] || '#7C8A99'
                  const corr = Math.round(40 + Math.random() * 50)
                  return (
                    <div key={k.id} onClick={() => setSelected(k)}
                         style={{
                           padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
                           border: '1px solid #1F2937', background: 'rgba(26,34,48,0.5)',
                           transition: 'border-color 120ms',
                         }}
                         onMouseEnter={e => e.currentTarget.style.borderColor = c + '44'}
                         onMouseLeave={e => e.currentTarget.style.borderColor = '#1F2937'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#E8EDF2', fontWeight: 500 }}>{k.wilayah}</span>
                        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: c, fontWeight: 700 }}>{corr}%</span>
                      </div>
                      <div style={{ marginTop: 5, height: 3, borderRadius: 2, background: '#1F2937', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${corr}%`, background: c, borderRadius: 2 }} />
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Laporan sumber */}
            <div style={{ borderTop: '1px solid #1F2937', paddingTop: 14 }}>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 8px', fontWeight: 600 }}>
                Laporan Sumber ({laporanTerkait.length})
              </p>
              {laporanTerkait.length === 0 ? (
                <p style={{ fontSize: 11, color: '#7C8A99', textAlign: 'center', padding: '12px 0' }}>
                  Belum ada laporan terverifikasi untuk wilayah ini
                </p>
              ) : laporanTerkait.map(l => {
                const statusColor = { 'Terverifikasi': '#22C55E', 'Dalam Validasi': '#FACC15', 'Baru': '#3B82F6' }[l.status] || '#7C8A99'
                return (
                  <div key={l.id} style={{
                    padding: '9px 10px', borderRadius: 7, marginBottom: 6,
                    border: '1px solid #1F2937', background: 'rgba(26,34,48,0.4)',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/pengumpulan-informasi?tab=antrian')}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <Link size={11} style={{ color: '#7C8A99', flexShrink: 0, marginTop: 1 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, color: '#E8EDF2', margin: '0 0 3px', lineHeight: 1.3 }}>{l.judul}</p>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#7C8A99' }}>{l.id}</span>
                          <span style={{ fontSize: 9, color: statusColor, fontWeight: 600 }}>● {l.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <button onClick={() => navigate('/pengumpulan-informasi?tab=antrian')}
                      style={{
                        width: '100%', marginTop: 4, padding: '7px', borderRadius: 7,
                        border: '1px solid #1F2937', background: 'transparent',
                        color: '#3B82F6', fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                      }}>
                <FileText size={12} /> Lihat Antrian Validasi
              </button>
            </div>

            {/* Menunggu Revisi — feedback loop dari A.11 */}
            <div style={{ borderTop: '1px solid #1F2937', paddingTop: 14, marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <RotateCcw size={11} color="#F59E0B" />
                <p style={{ fontSize: 10, color: '#F59E0B', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Menunggu Revisi
                </p>
                {menungguRevisi.length > 0 && (
                  <span style={{ marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9, background: 'rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
                    {menungguRevisi.length}
                  </span>
                )}
              </div>
              {menungguRevisi.length === 0 ? (
                <p style={{ fontSize: 11, color: '#7C8A99', textAlign: 'center', padding: '10px 0', fontStyle: 'italic' }}>
                  Tidak ada rekomendasi yang perlu direvisi
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {menungguRevisi.map(r => (
                    <div key={r.id} style={{
                      padding: '10px 11px', borderRadius: 8,
                      border: '1px solid rgba(245,158,11,0.25)',
                      background: 'rgba(245,158,11,0.05)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#F59E0B' }}>{r.id}</span>
                        <span style={{ fontSize: 9, color: '#7C8A99' }}>{new Date(r.tanggal).toLocaleDateString('id-ID')}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#E8EDF2', margin: '0 0 7px', lineHeight: 1.35 }}>{r.ringkasan}</p>
                      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '6px 8px', display: 'flex', gap: 6 }}>
                        <MessageSquare size={10} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 10, color: '#EF4444', margin: 0, lineHeight: 1.4 }}>{r.alasanTolak}</p>
                      </div>
                      <button onClick={() => setNarasiRek(r.ringkasan)}
                              style={{
                                marginTop: 7, width: '100%', padding: '5px', borderRadius: 6,
                                border: '1px solid rgba(245,158,11,0.3)', background: 'transparent',
                                color: '#F59E0B', fontSize: 10, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                              }}>
                        <RotateCcw size={10} /> Buka untuk Revisi
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kategori pola */}
            <div style={{ borderTop: '1px solid #1F2937', paddingTop: 14, marginTop: 14 }}>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 8px', fontWeight: 600 }}>Kategori Pola Ancaman</p>
              {[
                { pola: 'Pola Aktivitas', n: 3, color: '#EF4444' },
                { pola: 'Anomali Komunikasi', n: 2, color: '#F59E0B' },
                { pola: 'Pola Pergerakan', n: 2, color: '#FACC15' },
                { pola: 'Observasi Rutin', n: 1, color: '#22C55E' },
              ].map(p => (
                <div key={p.pola} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: '#E8EDF2', flex: 1 }}>{p.pola}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7C8A99' }}>{p.n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
