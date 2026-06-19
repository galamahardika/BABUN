import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Radio, Users, ChevronRight, TrendingUp, Map,
  FileInput, BarChart3, Brain, Network, FileText, Shield,
  Activity, Wifi, Database, Clock, Bell,
} from 'lucide-react'
import { formatRelative } from '../utils/time'
import SeverityBadge from '../components/common/SeverityBadge'
import IndonesiaMap from '../components/map/IndonesiaMap'
import { useNotifications } from '../context/NotificationContext'
import dashboard from '../data/dashboard.json'
import wilayah from '../data/wilayah.json'

const LEVEL_COLOR = { critical: '#EF4444', high: '#F59E0B', moderate: '#FACC15', low: '#22C55E' }

function MiniMap({ onViewFull }) {
  const mapData = useMemo(() => {
    const d = {}
    wilayah.forEach(w => { d[w.id] = w })
    return d
  }, [])

  return (
    <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Map size={13} color="#3B82F6" />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#7C8A99', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Peta Ancaman Nasional
          </span>
        </div>
        <button onClick={onViewFull}
                style={{ fontSize: 11, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          Peta Lengkap <ChevronRight size={11} />
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <IndonesiaMap data={mapData} compact />
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '7px 14px', borderTop: '1px solid #1F2937', flexWrap: 'wrap', flexShrink: 0 }}>
        {[['#EF4444','Kritis'],['#F59E0B','Tinggi'],['#FACC15','Sedang'],['#22C55E','Rendah']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
            <span style={{ fontSize: 9, color: '#7C8A99' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertFeed({ onViewAll }) {
  const { alerts, markRead } = useNotifications()
  const recent = alerts.slice(0, 6)

  const LEVEL_CFG = {
    critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    high:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    moderate: { color: '#FACC15', bg: 'rgba(250,204,21,0.06)', border: 'rgba(250,204,21,0.15)' },
    info:     { color: '#3B82F6', bg: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.15)' },
  }

  return (
    <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #1F2937', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Bell size={13} color="#EF4444" />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#7C8A99', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Feed Peringatan
          </span>
        </div>
        <button onClick={onViewAll}
                style={{ fontSize: 11, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          Semua <ChevronRight size={11} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#7C8A99' }}>
            <Bell size={22} style={{ opacity: 0.2, marginBottom: 8 }} />
            <p style={{ fontSize: 12 }}>Tidak ada peringatan aktif</p>
          </div>
        ) : recent.map(a => {
          const cfg = LEVEL_CFG[a.level] || LEVEL_CFG.info
          return (
            <div key={a.id}
                 onClick={() => markRead(a.id)}
                 style={{
                   padding: '9px 10px', borderRadius: 8, marginBottom: 6, cursor: 'default',
                   border: `1px solid ${cfg.border}`, background: cfg.bg,
                   opacity: a.read ? 0.6 : 1, transition: 'opacity 150ms',
                 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                {!a.read && <div style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0, marginTop: 4 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: '#E8EDF2', margin: '0 0 3px', lineHeight: 1.35 }}>{a.pesan}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, color: cfg.color, fontWeight: 700, textTransform: 'uppercase' }}>{a.level}</span>
                    <span style={{ fontSize: 9, color: '#374151' }}>•</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#7C8A99' }}>{formatRelative(a.waktu)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const QUICK_MODULES = [
  { label: 'Pengumpulan', sub: 'A.2', path: '/pengumpulan-informasi', icon: FileInput, color: '#3B82F6' },
  { label: 'Analisis', sub: 'A.3', path: '/analisis-ancaman', icon: BarChart3, color: '#F59E0B' },
  { label: 'Early Warning', sub: 'A.4', path: '/early-warning', icon: AlertTriangle, color: '#EF4444' },
  { label: 'Peta Monitor', sub: 'A.5', path: '/peta-monitoring', icon: Map, color: '#22D3D8' },
  { label: 'Decision Support', sub: 'A.11', path: '/decision-support', icon: Brain, color: '#A78BFA' },
  { label: 'Laporan Intel', sub: 'A.9', path: '/laporan-intelijen', icon: FileText, color: '#22C55E' },
  { label: 'Jaringan Intel', sub: 'A.1', path: '/jaringan-intelijen', icon: Network, color: '#60A5FA' },
  { label: 'Audit & Patuh', sub: 'A.13', path: '/admin/audit-keamanan', icon: Shield, color: '#FB923C' },
]

export default function DashboardPimpinan() {
  const nav = useNavigate()
  const { alerts } = useNotifications()
  const { ancamanNasional, peringatanAktif, satuanOnline, rekomendasiTeratas, laporanTerbaru } = dashboard

  const skorColor = LEVEL_COLOR[ancamanNasional.level] || '#7C8A99'
  const unreadCritical = alerts.filter(a => !a.read && a.level === 'critical').length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── ZONE 1: Hero Score ── */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(135deg, #0A0E13 0%, #131922 60%, rgba(59,130,246,0.04) 100%)',
        borderBottom: '1px solid #1F2937',
        padding: '20px 28px',
        display: 'flex', alignItems: 'center', gap: 32,
      }}>
        {/* Big score */}
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontSize: 9, color: '#7C8A99', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Skor Ancaman Nasional
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 72, color: skorColor, lineHeight: 1, letterSpacing: '-2px' }}>
              {ancamanNasional.skor}
            </span>
            <div>
              <span style={{ fontSize: 18, color: '#374151', fontFamily: 'Space Grotesk' }}>/100</span>
              <div style={{ marginTop: 4 }}>
                <SeverityBadge level={ancamanNasional.level} />
              </div>
            </div>
          </div>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '6px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
            Update: {new Date(ancamanNasional.updateAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 80, background: '#1F2937', flexShrink: 0 }} />

        {/* KPI strip */}
        <div style={{ display: 'flex', gap: 24, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Peringatan */}
          <div onClick={() => nav('/early-warning')} style={{ cursor: 'pointer', minWidth: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <AlertTriangle size={12} color="#EF4444" />
              <span style={{ fontSize: 9, color: '#7C8A99', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Peringatan Aktif</span>
            </div>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 28, color: '#EF4444', margin: 0, lineHeight: 1 }}>
              {peringatanAktif.total}
            </p>
            <div style={{ display: 'flex', gap: 4, marginTop: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, color: '#EF4444', fontWeight: 600 }}>{peringatanAktif.critical}K</span>
              <span style={{ fontSize: 9, color: '#F59E0B', fontWeight: 600 }}>{peringatanAktif.high}T</span>
              <span style={{ fontSize: 9, color: '#FACC15', fontWeight: 600 }}>{peringatanAktif.moderate}S</span>
            </div>
          </div>

          <div style={{ width: 1, height: 50, background: '#1F2937', flexShrink: 0 }} />

          {/* Satuan online */}
          <div onClick={() => nav('/jaringan-intelijen')} style={{ cursor: 'pointer', minWidth: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Wifi size={12} color="#22C55E" />
              <span style={{ fontSize: 9, color: '#7C8A99', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Satuan Online</span>
            </div>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 28, color: '#22C55E', margin: 0, lineHeight: 1 }}>
              {satuanOnline.online}
              <span style={{ fontSize: 14, color: '#374151', fontWeight: 400 }}>/{satuanOnline.total}</span>
            </p>
            <p style={{ fontSize: 9, color: '#7C8A99', margin: '5px 0 0' }}>Delay: {satuanOnline.delay} · Offline: {satuanOnline.offline}</p>
          </div>

          <div style={{ width: 1, height: 50, background: '#1F2937', flexShrink: 0 }} />

          {/* Laporan baru */}
          <div onClick={() => nav('/pengumpulan-informasi')} style={{ cursor: 'pointer', minWidth: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <FileInput size={12} color="#3B82F6" />
              <span style={{ fontSize: 9, color: '#7C8A99', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Laporan Masuk</span>
            </div>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 28, color: '#3B82F6', margin: 0, lineHeight: 1 }}>
              {laporanTerbaru.length}
            </p>
            <p style={{ fontSize: 9, color: '#7C8A99', margin: '5px 0 0' }}>Laporan terbaru</p>
          </div>

          <div style={{ width: 1, height: 50, background: '#1F2937', flexShrink: 0 }} />

          {/* Alert unread */}
          <div onClick={() => nav('/early-warning')} style={{ cursor: 'pointer', minWidth: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Bell size={12} color={unreadCritical > 0 ? '#EF4444' : '#7C8A99'} />
              <span style={{ fontSize: 9, color: '#7C8A99', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Notifikasi Kritis</span>
            </div>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 28, color: unreadCritical > 0 ? '#EF4444' : '#374151', margin: 0, lineHeight: 1 }}>
              {unreadCritical}
            </p>
            <p style={{ fontSize: 9, color: '#7C8A99', margin: '5px 0 0' }}>Belum dibaca</p>
          </div>
        </div>

        {/* Status dot */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
            <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 600 }}>LIVE</span>
          </div>
          <p style={{ fontSize: 9, color: '#374151', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>MODE LATIHAN</p>
          <p style={{ fontSize: 9, color: '#374151', margin: '1px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>DATA SIMULASI</p>
        </div>
      </div>

      {/* ── ZONE 2: Mini-map + Alert Feed ── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0, overflow: 'hidden', minHeight: 0 }}>
        <div style={{ padding: '14px 12px 14px 20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <MiniMap onViewFull={() => nav('/peta-monitoring')} />
          </div>
        </div>

        <div style={{ borderLeft: '1px solid #1F2937', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <AlertFeed onViewAll={() => nav('/early-warning')} />
        </div>
      </div>

      {/* ── ZONE 3: Quick Access + DSS + Laporan ── */}
      <div style={{
        flexShrink: 0, borderTop: '1px solid #1F2937',
        background: '#0A0E13', padding: '14px 20px',
        display: 'grid', gridTemplateColumns: '1fr 280px 280px', gap: 16,
      }}>
        {/* Quick access grid */}
        <div>
          <p style={{ fontSize: 9, color: '#374151', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Akses Cepat Modul</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {QUICK_MODULES.map(m => {
              const Icon = m.icon
              return (
                <button key={m.path} onClick={() => nav(m.path)}
                        style={{
                          padding: '10px 8px', borderRadius: 9,
                          border: `1px solid ${m.color}22`,
                          background: `${m.color}09`, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                          transition: 'all 120ms',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${m.color}18`; e.currentTarget.style.borderColor = `${m.color}44` }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${m.color}09`; e.currentTarget.style.borderColor = `${m.color}22` }}>
                  <Icon size={16} color={m.color} />
                  <span style={{ fontSize: 9, color: '#E8EDF2', textAlign: 'center', lineHeight: 1.3, fontWeight: 500 }}>{m.label}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#374151' }}>{m.sub}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* DSS Teratas */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 9, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>DSS Teratas</p>
            <button onClick={() => nav('/decision-support')}
                    style={{ fontSize: 10, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
              Semua <ChevronRight size={10} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {rekomendasiTeratas.slice(0, 3).map(r => (
              <div key={r.id} onClick={() => nav('/decision-support')}
                   style={{
                     padding: '9px 10px', borderRadius: 7, cursor: 'pointer',
                     background: 'rgba(26,34,48,0.6)', border: '1px solid #1F2937',
                     transition: 'border-color 150ms',
                   }}
                   onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F644'}
                   onMouseLeave={e => e.currentTarget.style.borderColor = '#1F2937'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <p style={{ fontSize: 10, color: '#E8EDF2', margin: 0, lineHeight: 1.35, flex: 1 }}>{r.ringkasan}</p>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, flexShrink: 0, color: r.confidence >= 80 ? '#22C55E' : r.confidence >= 65 ? '#F59E0B' : '#7C8A99' }}>
                    {r.confidence}%
                  </span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#374151', marginTop: 3, display: 'block' }}>{r.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Laporan Terbaru */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 9, color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Laporan Terbaru</p>
            <button onClick={() => nav('/laporan-intelijen')}
                    style={{ fontSize: 10, color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
              Semua <ChevronRight size={10} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {laporanTerbaru.slice(0, 3).map(l => (
              <div key={l.id} onClick={() => nav('/laporan-intelijen')}
                   style={{
                     padding: '9px 10px', borderRadius: 7, cursor: 'pointer',
                     background: 'rgba(26,34,48,0.6)', border: '1px solid #1F2937',
                     transition: 'border-color 150ms',
                   }}
                   onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F644'}
                   onMouseLeave={e => e.currentTarget.style.borderColor = '#1F2937'}>
                <p style={{ fontSize: 10, color: '#E8EDF2', margin: '0 0 5px', lineHeight: 1.35 }}>{l.judul}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#374151' }}>{l.id}</span>
                  <span style={{
                    fontSize: 9, padding: '2px 5px', borderRadius: 3, fontWeight: 600,
                    background: l.status === 'Terdistribusi' ? 'rgba(34,197,94,0.12)' : 'rgba(250,204,21,0.10)',
                    color: l.status === 'Terdistribusi' ? '#22C55E' : '#FACC15',
                  }}>
                    {l.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
