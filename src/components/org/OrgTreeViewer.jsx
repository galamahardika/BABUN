import { useState } from 'react'
import { ChevronRight, ChevronDown, Wifi, WifiOff, AlertCircle, Users, Clock } from 'lucide-react'

const STATUS_CFG = {
  online:  { color: '#22C55E', label: 'Online',  Icon: Wifi },
  delay:   { color: '#F59E0B', label: 'Delay',   Icon: AlertCircle },
  offline: { color: '#EF4444', label: 'Offline', Icon: WifiOff },
}

function StatusDot({ status, size = 8 }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.offline
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: cfg.color, flexShrink: 0,
      boxShadow: status === 'online' ? `0 0 6px ${cfg.color}88` : 'none',
    }} />
  )
}

function SatuanNode({ satuan, selected, onSelect }) {
  const cfg = STATUS_CFG[satuan.status] || STATUS_CFG.offline
  const isSelected = selected?.id === satuan.id

  return (
    <div
      onClick={() => onSelect(satuan)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px 8px 40px',
        cursor: 'pointer', borderRadius: 8,
        background: isSelected ? 'rgba(59,130,246,0.12)' : 'transparent',
        border: isSelected ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
        transition: 'all 120ms ease',
        marginBottom: 2,
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
      {/* Tree connector */}
      <span style={{ width: 12, height: 1, background: '#1F2937', flexShrink: 0 }} />
      <StatusDot status={satuan.status} size={7} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: '#E8EDF2', margin: 0, fontWeight: isSelected ? 600 : 400, truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {satuan.nama}
        </p>
        <p style={{ fontSize: 10, color: '#7C8A99', margin: '1px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
          {satuan.id}
        </p>
      </div>
      {satuan.indikator > 0 && (
        <span style={{
          minWidth: 18, height: 18, borderRadius: 9,
          background: satuan.indikator >= 5 ? '#EF4444' : '#F59E0B',
          color: '#0A0E13', fontSize: 9, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {satuan.indikator}
        </span>
      )}
      <span style={{ fontSize: 10, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
    </div>
  )
}

function WilayahGroup({ grup, selected, onSelect, onSelectWil }) {
  const [open, setOpen] = useState(true)
  const cfg = STATUS_CFG[grup.status] || STATUS_CFG.offline
  const isSelected = selected?.id === grup.id

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        onClick={() => { setOpen(v => !v); onSelectWil(grup) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
          cursor: 'pointer', borderRadius: 8,
          background: isSelected ? 'rgba(59,130,246,0.1)' : 'transparent',
          border: isSelected ? '1px solid rgba(59,130,246,0.25)' : '1px solid transparent',
          transition: 'all 120ms',
        }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
        <span style={{ color: '#7C8A99', flexShrink: 0 }}>
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </span>
        <StatusDot status={grup.status} size={9} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, color: '#E8EDF2', margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {grup.singkatan}
          </p>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '1px 0 0' }}>{grup.nama}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: '#7C8A99' }}>{grup.satuan.length} sat.</span>
          <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
        </div>
      </div>

      {open && (
        <div style={{ marginLeft: 16, borderLeft: '1px dashed #1F2937', paddingLeft: 4, marginTop: 2 }}>
          {grup.satuan.map(sat => (
            <SatuanNode key={sat.id} satuan={sat} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrgTreeViewer({ data, selected, onSelect }) {
  const { pusat, wilayah } = data
  const pusatCfg = STATUS_CFG[pusat.status]

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 8px' }}>
      {/* Pusat node */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 10, marginBottom: 12, cursor: 'pointer',
      }}
      onClick={() => onSelect({ ...pusat, type: 'pusat' })}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg,#3B82F6,#22D3D8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 0 10px rgba(59,130,246,0.3)',
        }}>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#fff' }}>P</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#E8EDF2', margin: 0, fontFamily: 'Space Grotesk' }}>
            {pusat.singkatan}
          </p>
          <p style={{ fontSize: 10, color: '#7C8A99', margin: '1px 0 0' }}>{pusat.nama}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <StatusDot status={pusat.status} size={8} />
          <span style={{ fontSize: 10, color: pusatCfg.color, fontWeight: 600 }}>{pusatCfg.label}</span>
        </div>
      </div>

      {/* Wilayah groups */}
      <div style={{ borderLeft: '2px solid #1F2937', marginLeft: 14, paddingLeft: 12 }}>
        {wilayah.map(grup => (
          <WilayahGroup
            key={grup.id}
            grup={grup}
            selected={selected}
            onSelect={onSelect}
            onSelectWil={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
