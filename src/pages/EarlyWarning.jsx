import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, Filter, Settings, ChevronDown, MapPin, Radio } from 'lucide-react'
import SeverityBadge from '../components/common/SeverityBadge'
import ThreatPulse from '../components/common/ThreatPulse'
import DetailDrawer from '../components/common/DetailDrawer'
import Stepper from '../components/common/Stepper'
import Toast from '../components/common/Toast'
import peringatanData from '../data/peringatan.json'

const LEVEL_COLOR = { critical: '#EF4444', high: '#F59E0B', moderate: '#FACC15', low: '#22C55E' }

const STATUS_COLOR = {
  'Baru': '#EF4444',
  'Ditinjau': '#F59E0B',
  'Eskalasi': '#3B82F6',
  'Selesai': '#22C55E',
}

// Indikator config mock
const INDIKATOR_CONFIG = [
  { kode: 'A-104', nama: 'Pola Pergerakan Abnormal', ambang: 75, aktif: true },
  { kode: 'A-089', nama: 'Frekuensi Kontak Jaringan', ambang: 50, aktif: true },
  { kode: 'B-115', nama: 'Aktivitas Observasi Terlewat', ambang: 45, aktif: true },
  { kode: 'B-227', nama: 'Anomali Komunikasi Jaringan', ambang: 60, aktif: true },
  { kode: 'C-312', nama: 'Lonjakan Volume Data Observasi', ambang: 65, aktif: false },
  { kode: 'D-441', nama: 'Pola Waktu Aktivitas Tidak Lazim', ambang: 70, aktif: true },
]

let nextIdCounter = 42

function generateAlert() {
  const levels = ['critical', 'high', 'moderate']
  const level = levels[Math.floor(Math.random() * levels.length)]
  const wids = ['WIL-001','WIL-002','WIL-003','WIL-004','WIL-005','WIL-006','WIL-007','WIL-008','WIL-009','WIL-010','WIL-011','WIL-012']
  const wilayahId = wids[Math.floor(Math.random() * wids.length)]
  const indikators = ['A-104','A-089','B-115','B-227','C-312','D-441']
  const ind = indikators[Math.floor(Math.random() * indikators.length)]
  const id = `EWS-2024-00${nextIdCounter++}`
  return {
    id,
    wilayahId,
    wilayah: `Wilayah Simulasi ${wilayahId.split('-')[1]}`,
    provinsi: 'Simulasi',
    indikator: `Indikator ${ind}: Deteksi baru sistem otomatis`,
    level,
    waktu: new Date().toISOString(),
    status: 'Baru',
    penerima: ['Analis Pusat'],
    eskalasi: [
      { title: `Indikator ${ind} terpicu`, time: new Date().toLocaleTimeString('id-ID'), level, desc: 'Nilai melampaui ambang batas' },
      { title: 'Notifikasi dikirim', time: new Date().toLocaleTimeString('id-ID'), level: 'info', desc: null },
      { title: 'Menunggu konfirmasi', time: new Date().toLocaleTimeString('id-ID'), level: 'moderate', desc: null },
    ],
  }
}

function AlertCard({ alert, onClick }) {
  const color = LEVEL_COLOR[alert.level] || '#7C8A99'
  const isNew = alert.status === 'Baru'
  const isCritical = alert.level === 'critical'

  return (
    <div
      onClick={onClick}
      style={{
        background: '#131922',
        border: `1px solid ${color}${isNew ? '44' : '22'}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 10,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#1A2230'}
      onMouseLeave={e => e.currentTarget.style.background = '#131922'}>
      {/* New badge */}
      {isNew && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: color, color: '#0A0E13',
          fontSize: 8, fontWeight: 700, padding: '2px 8px',
          borderBottomLeftRadius: 6, letterSpacing: '0.08em',
        }}>
          BARU
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icon / ThreatPulse */}
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          {isCritical
            ? <ThreatPulse size={28} color={color} />
            : <AlertTriangle size={16} style={{ color }} />
          }
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <SeverityBadge level={alert.level} />
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 4, fontWeight: 600,
              background: STATUS_COLOR[alert.status] + '1A',
              color: STATUS_COLOR[alert.status],
              border: `1px solid ${STATUS_COLOR[alert.status]}44`,
            }}>
              {alert.status}
            </span>
          </div>

          <p style={{ fontSize: 13, color: '#E8EDF2', margin: '4px 0', lineHeight: 1.4, fontWeight: 500 }}>
            {alert.indikator}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#7C8A99' }}>
              <MapPin size={11} /> {alert.wilayah}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#7C8A99', fontFamily: 'JetBrains Mono, monospace' }}>
              <Clock size={11} /> {new Date(alert.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ fontSize: 10, color: '#7C8A99', fontFamily: 'JetBrains Mono, monospace' }}>{alert.id}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          {alert.status === 'Baru' && (
            <>
              <QuickBtn color="#F59E0B" onClick={(e) => { e.stopPropagation() }}>Tinjau</QuickBtn>
              <QuickBtn color="#3B82F6" onClick={(e) => { e.stopPropagation() }}>Eskalasi</QuickBtn>
            </>
          )}
          {alert.status === 'Ditinjau' && (
            <QuickBtn color="#22C55E" onClick={(e) => { e.stopPropagation() }}>Tutup</QuickBtn>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickBtn({ color, onClick, children }) {
  return (
    <button onClick={onClick}
            style={{
              padding: '4px 10px', borderRadius: 6, border: `1px solid ${color}44`,
              background: color + '15', color, fontSize: 10, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
      {children}
    </button>
  )
}

function AlertDrawer({ open, onClose, alert, onAction }) {
  if (!alert) return null
  const color = LEVEL_COLOR[alert.level] || '#7C8A99'
  const steps = alert.eskalasi.map(e => ({
    title: e.title, time: e.time, desc: e.desc, level: e.level,
  }))

  return (
    <DetailDrawer open={open} onClose={onClose} title={`Detail Peringatan — ${alert.id}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {alert.level === 'critical' && <ThreatPulse size={36} color={color} />}
          <div>
            <SeverityBadge level={alert.level} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF2', margin: '6px 0 0', lineHeight: 1.4 }}>
              {alert.indikator}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Wilayah', value: alert.wilayah },
            { label: 'Status', value: alert.status },
            { label: 'ID Peringatan', value: alert.id, mono: true },
            { label: 'Waktu Muncul', value: new Date(alert.waktu).toLocaleString('id-ID'), mono: true },
          ].map(m => (
            <div key={m.label} style={{ background: '#0A0E13', borderRadius: 8, padding: '10px 12px', border: '1px solid #1F2937' }}>
              <p style={{ fontSize: 9, color: '#7C8A99', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.label}</p>
              <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0, fontFamily: m.mono ? 'JetBrains Mono, monospace' : 'Inter', fontWeight: 500 }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Eskalasi timeline */}
        <div>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Kronologi Eskalasi
          </p>
          <Stepper steps={steps} />
        </div>

        {/* Penerima */}
        <div>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Penerima Notifikasi
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {alert.penerima.map(p => (
              <span key={p} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 10,
                background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                border: '1px solid rgba(59,130,246,0.2)',
              }}>{p}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        {alert.status !== 'Selesai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {alert.status === 'Baru' && (
              <button onClick={() => onAction(alert.id, 'Ditinjau')}
                      style={{
                        padding: '10px', borderRadius: 8, border: '1px solid rgba(245,158,11,0.3)',
                        background: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      }}>
                Tandai Ditinjau
              </button>
            )}
            {(alert.status === 'Baru' || alert.status === 'Ditinjau') && (
              <button onClick={() => onAction(alert.id, 'Eskalasi')}
                      style={{
                        padding: '10px', borderRadius: 8, border: '1px solid rgba(59,130,246,0.3)',
                        background: 'rgba(59,130,246,0.1)', color: '#3B82F6',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      }}>
                Eskalasikan ke Pimpinan
              </button>
            )}
            <button onClick={() => onAction(alert.id, 'Selesai')}
                    style={{
                      padding: '10px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.3)',
                      background: 'rgba(34,197,94,0.1)', color: '#22C55E',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    }}>
              Tutup Peringatan
            </button>
          </div>
        )}
      </div>
    </DetailDrawer>
  )
}

export default function EarlyWarning() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(peringatanData)
  const [selected, setSelected] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterLevel, setFilterLevel] = useState('Semua')
  const [showConfig, setShowConfig] = useState(false)
  const toastIdRef = useRef(1000)

  // Simulate new incoming alert every 25 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = generateAlert()
      setAlerts(prev => [newAlert, ...prev])
      toastIdRef.current += 1
      setToasts(prev => [...prev, {
        id: toastIdRef.current,
        title: `Peringatan ${newAlert.level === 'critical' ? 'Kritis' : newAlert.level === 'high' ? 'Tinggi' : 'Sedang'} Baru`,
        body: `${newAlert.wilayah} — ${newAlert.indikator.split(':')[0]}`,
        level: newAlert.level,
        alertId: newAlert.id,
      }])
    }, 25000)
    return () => clearInterval(interval)
  }, [])

  const handleAction = (id, newStatus) => {
    setAlerts(prev => prev.map(a => a.id === id
      ? {
          ...a, status: newStatus,
          eskalasi: [...a.eskalasi, {
            title: newStatus === 'Ditinjau' ? 'Ditandai Ditinjau' : newStatus === 'Eskalasi' ? 'Dieskalasi ke Pimpinan' : 'Peringatan Ditutup',
            time: new Date().toLocaleTimeString('id-ID'),
            level: newStatus === 'Selesai' ? 'success' : newStatus === 'Eskalasi' ? 'high' : 'moderate',
            desc: null,
          }],
        }
      : a
    ))
    setDrawerOpen(false)
  }

  const filtered = alerts.filter(a => {
    if (filterStatus !== 'Semua' && a.status !== filterStatus) return false
    if (filterLevel !== 'Semua' && a.level !== filterLevel) return false
    return true
  })

  const counts = {
    critical: alerts.filter(a => a.level === 'critical' && a.status !== 'Selesai').length,
    high: alerts.filter(a => a.level === 'high' && a.status !== 'Selesai').length,
    moderate: alerts.filter(a => a.level === 'moderate' && a.status !== 'Selesai').length,
    baru: alerts.filter(a => a.status === 'Baru').length,
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', borderBottom: '1px solid #1F2937',
        background: '#131922', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Radio size={16} color="#22D3D8" />
            <div>
              <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#E8EDF2', margin: 0 }}>
                Early Warning System
              </h1>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                A.4 • Live Monitor
              </p>
            </div>
          </div>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(34,211,216,0.1)', border: '1px solid rgba(34,211,216,0.3)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3D8',
                           boxShadow: '0 0 8px #22D3D8', animation: 'pulse-ring 2s ease-out infinite' }} />
            <span style={{ fontSize: 10, color: '#22D3D8', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Summary pills */}
          {[
            { label: `${counts.critical} Kritis`, color: '#EF4444' },
            { label: `${counts.high} Tinggi`, color: '#F59E0B' },
            { label: `${counts.baru} Baru`, color: '#3B82F6' },
          ].map(p => (
            <span key={p.label} style={{
              padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
              background: p.color + '15', color: p.color, border: `1px solid ${p.color}33`,
            }}>{p.label}</span>
          ))}

          {/* Config toggle */}
          <button onClick={() => setShowConfig(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                    borderRadius: 8, border: '1px solid #1F2937',
                    background: showConfig ? 'rgba(59,130,246,0.1)' : 'transparent',
                    color: showConfig ? '#3B82F6' : '#7C8A99',
                    fontSize: 11, cursor: 'pointer',
                  }}>
            <Settings size={12} /> Konfigurasi Indikator
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main feed */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Filters */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
            borderBottom: '1px solid #1F2937', background: '#0A0E13', flexShrink: 0,
          }}>
            <Filter size={12} color="#7C8A99" />
            <span style={{ fontSize: 11, color: '#7C8A99' }}>Filter:</span>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {['Semua', 'Baru', 'Ditinjau', 'Eskalasi', 'Selesai'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                        style={{
                          padding: '3px 10px', borderRadius: 6, border: 'none',
                          background: filterStatus === s ? 'rgba(59,130,246,0.15)' : 'transparent',
                          color: filterStatus === s ? '#3B82F6' : '#7C8A99',
                          fontSize: 11, cursor: 'pointer',
                        }}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{ width: 1, height: 16, background: '#1F2937' }} />

            {/* Level filter */}
            <div style={{ display: 'flex', gap: 4 }}>
              {['Semua', 'critical', 'high', 'moderate'].map(l => (
                <button key={l} onClick={() => setFilterLevel(l)}
                        style={{
                          padding: '3px 10px', borderRadius: 6, border: 'none',
                          background: filterLevel === l ? (LEVEL_COLOR[l] || '#3B82F6') + '22' : 'transparent',
                          color: filterLevel === l ? (LEVEL_COLOR[l] || '#3B82F6') : '#7C8A99',
                          fontSize: 11, cursor: 'pointer', textTransform: 'capitalize',
                        }}>
                  {l === 'Semua' ? 'Semua Level' : l}
                </button>
              ))}
            </div>

            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#7C8A99' }}>
              {filtered.length} peringatan
            </span>
          </div>

          {/* Alert feed */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#7C8A99', fontSize: 13 }}>
                Tidak ada peringatan sesuai filter
              </div>
            ) : filtered.map(a => (
              <AlertCard key={a.id} alert={a}
                         onClick={() => { setSelected(a); setDrawerOpen(true) }} />
            ))}
          </div>
        </div>

        {/* Config panel */}
        {showConfig && (
          <div style={{
            width: 300, borderLeft: '1px solid #1F2937', background: '#131922',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1F2937' }}>
              <p style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 13, color: '#E8EDF2', margin: 0 }}>
                Konfigurasi Indikator
              </p>
              <p style={{ fontSize: 10, color: '#7C8A99', margin: '2px 0 0' }}>Atur ambang batas & status aktif</p>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {INDIKATOR_CONFIG.map(ind => (
                <div key={ind.kode} style={{
                  background: '#0A0E13', borderRadius: 8, padding: '12px',
                  border: ind.aktif ? '1px solid rgba(34,211,216,0.2)' : '1px solid #1F2937',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#22D3D8', fontWeight: 600 }}>
                      {ind.kode}
                    </span>
                    <div style={{
                      width: 32, height: 16, borderRadius: 8, cursor: 'pointer',
                      background: ind.aktif ? 'rgba(34,211,216,0.3)' : '#1F2937',
                      position: 'relative', border: ind.aktif ? '1px solid #22D3D8' : '1px solid #7C8A99',
                    }}>
                      <div style={{
                        position: 'absolute', top: 2,
                        left: ind.aktif ? 16 : 2,
                        width: 10, height: 10, borderRadius: '50%',
                        background: ind.aktif ? '#22D3D8' : '#7C8A99',
                        transition: 'left 150ms ease',
                      }} />
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#E8EDF2', margin: '0 0 8px' }}>{ind.nama}</p>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: '#7C8A99' }}>Ambang batas</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#E8EDF2' }}>{ind.ambang}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: '#1F2937', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${ind.ambang}%`,
                        background: ind.ambang >= 70 ? '#EF4444' : ind.ambang >= 55 ? '#F59E0B' : '#22D3D8',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <AlertDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        alert={selected}
        onAction={handleAction}
      />

      {/* Toast notifications */}
      <Toast
        toasts={toasts}
        onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        onView={(t) => {
          const alert = alerts.find(a => a.id === t.alertId)
          if (alert) { setSelected(alert); setDrawerOpen(true) }
          setToasts(prev => prev.filter(x => x.id !== t.id))
        }}
      />
    </div>
  )
}
