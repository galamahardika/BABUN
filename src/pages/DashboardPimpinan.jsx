import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Radio, Users, ChevronRight, TrendingUp, Map } from 'lucide-react'
import HudCard from '../components/common/HudCard'
import SeverityBadge from '../components/common/SeverityBadge'
import IndonesiaMap from '../components/map/IndonesiaMap'
import dashboard from '../data/dashboard.json'
import wilayah from '../data/wilayah.json'

function MiniMap({ onViewFull }) {
  const mapData = useMemo(() => {
    const d = {}
    wilayah.forEach(w => { d[w.id] = w })
    return d
  }, [])

  return (
    <div style={{
      background: '#131922', border: '1px solid #1F2937', borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid #1F2937',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Map size={14} color="#3B82F6" />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#7C8A99', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Peta Ancaman Nasional
          </span>
        </div>
        <button onClick={onViewFull}
                style={{ fontSize: 11, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          Lihat Peta Lengkap <ChevronRight size={12} />
        </button>
      </div>

      {/* Real SVG map — compact mode (no legend, no click-to-detail hint) */}
      <IndonesiaMap data={mapData} compact />

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, padding: '8px 16px', borderTop: '1px solid #1F2937', flexWrap: 'wrap' }}>
        {[['#EF4444','Kritis'],['#F59E0B','Tinggi'],['#FACC15','Sedang'],['#22C55E','Rendah']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
            <span style={{ fontSize: 9, color: '#7C8A99' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPimpinan() {
  const nav = useNavigate()
  const { ancamanNasional, peringatanAktif, satuanOnline, rekomendasiTeratas, laporanTerbaru } = dashboard

  const skorColor = { critical: '#EF4444', high: '#F59E0B', moderate: '#FACC15', low: '#22C55E' }[ancamanNasional.level]

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Page title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#E8EDF2', margin: 0 }}>
          Dashboard Pimpinan
        </h1>
        <p style={{ fontSize: 11, color: '#7C8A99', margin: '4px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
          Sistem A • Update terakhir: {new Date(ancamanNasional.updateAt).toLocaleString('id-ID')}
        </p>
      </div>

      {/* Layout: 3 cols top */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Skor Ancaman */}
        <HudCard
          title="Skor Ancaman Nasional"
          value={`${ancamanNasional.skor}/100`}
          sub={`Status: ${ancamanNasional.label}`}
          accent={skorColor}
          icon={TrendingUp}
          onClick={() => nav('/analisis-ancaman')}
        />
        {/* Peringatan */}
        <div style={{
          background: 'rgba(26,34,48,0.85)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10, padding: 16, cursor: 'pointer',
          boxShadow: '0 0 12px rgba(239,68,68,0.1)',
        }} onClick={() => nav('/early-warning')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#7C8A99', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              Peringatan Aktif
            </p>
            <AlertTriangle size={14} color="#EF4444" />
          </div>
          <p style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 700, color: '#EF4444', margin: '8px 0 4px' }}>
            {peringatanAktif.total}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <SeverityBadge level="critical" label={`${peringatanAktif.critical} Kritis`} size="xs" />
            <SeverityBadge level="high" label={`${peringatanAktif.high} Tinggi`} size="xs" />
            <SeverityBadge level="moderate" label={`${peringatanAktif.moderate} Sedang`} size="xs" />
          </div>
        </div>
        {/* Satuan Online */}
        <HudCard
          title="Satuan Online"
          value={`${satuanOnline.online}/${satuanOnline.total}`}
          sub={`Delay: ${satuanOnline.delay} • Offline: ${satuanOnline.offline}`}
          accent="#22C55E"
          icon={Users}
          onClick={() => nav('/jaringan-intelijen')}
        />
      </div>

      {/* Main layout: 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
        {/* Left: Mini map + Rekomendasi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MiniMap onViewFull={() => nav('/peta-monitoring')} />

          {/* Rekomendasi Teratas */}
          <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#7C8A99', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Rekomendasi DSS Teratas
              </span>
              <button onClick={() => nav('/decision-support')}
                      style={{ fontSize: 11, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Lihat Semua <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rekomendasiTeratas.map(r => (
                <div key={r.id} onClick={() => nav('/decision-support')}
                     style={{
                       padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                       background: 'rgba(26,34,48,0.6)', border: '1px solid #1F2937',
                       transition: 'border-color 150ms',
                     }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F644'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#1F2937'}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0, lineHeight: 1.4, flex: 1 }}>
                      {r.ringkasan}
                    </p>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: r.confidence >= 80 ? '#22C55E' : r.confidence >= 65 ? '#F59E0B' : '#7C8A99',
                      fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
                    }}>
                      {r.confidence}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7C8A99' }}>{r.id}</span>
                    <span style={{ fontSize: 10, color: '#7C8A99' }}>•</span>
                    <span style={{ fontSize: 10, color: '#7C8A99' }}>{r.wilayah}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Laporan terbaru + Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Laporan */}
          <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#7C8A99', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Laporan Terbaru
              </span>
              <button onClick={() => nav('/laporan-intelijen')}
                      style={{ fontSize: 11, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Lihat Semua <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {laporanTerbaru.map(l => (
                <div key={l.id} onClick={() => nav('/laporan-intelijen')}
                     style={{
                       padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                       background: 'rgba(26,34,48,0.6)', border: '1px solid #1F2937',
                       transition: 'border-color 150ms',
                     }}
                     onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F644'}
                     onMouseLeave={e => e.currentTarget.style.borderColor = '#1F2937'}>
                  <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0, lineHeight: 1.4 }}>{l.judul}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#7C8A99' }}>{l.id}</span>
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 3,
                      background: l.status === 'Terdistribusi' ? 'rgba(34,197,94,0.12)' : 'rgba(250,204,21,0.12)',
                      color: l.status === 'Terdistribusi' ? '#22C55E' : '#FACC15',
                      fontWeight: 600,
                    }}>
                      {l.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 12, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#7C8A99', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Akses Cepat
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Input Laporan Baru', path: '/pengumpulan-informasi', color: '#3B82F6' },
                { label: 'Pantau Early Warning', path: '/early-warning', color: '#EF4444' },
                { label: 'Lihat Analisis Ancaman', path: '/analisis-ancaman', color: '#F59E0B' },
                { label: 'Audit Log Terkini', path: '/admin/audit-keamanan', color: '#22C55E' },
              ].map(a => (
                <button key={a.path} onClick={() => nav(a.path)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '9px 12px', borderRadius: 8, border: `1px solid ${a.color}22`,
                          background: `${a.color}0D`, cursor: 'pointer',
                          color: a.color, fontSize: 12, fontWeight: 500,
                          transition: 'background 150ms',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${a.color}1A`}
                        onMouseLeave={e => e.currentTarget.style.background = `${a.color}0D`}>
                  {a.label}
                  <ChevronRight size={12} />
                </button>
              ))}
            </div>
          </div>

          {/* Status bar */}
          <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#7C8A99', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Status Sistem
            </p>
            {[
              { label: 'Koneksi Jaringan', status: 'Operasional', ok: true },
              { label: 'Database Terpusat', status: 'Operasional', ok: true },
              { label: 'Early Warning Engine', status: 'Operasional', ok: true },
              { label: 'Backup Otomatis', status: 'Berjalan (04:00)', ok: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#7C8A99' }}>{s.label}</span>
                <span style={{ fontSize: 10, color: s.ok ? '#22C55E' : '#EF4444', fontWeight: 600 }}>● {s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
