const _BASE = {
  critical: { bg: 'rgba(239,68,68,0.15)',  border: '#EF4444', color: '#EF4444',  label: 'Kritis' },
  high:     { bg: 'rgba(245,158,11,0.15)', border: '#F59E0B', color: '#F59E0B',  label: 'Tinggi' },
  moderate: { bg: 'rgba(250,204,21,0.12)', border: '#FACC15', color: '#FACC15',  label: 'Sedang' },
  low:      { bg: 'rgba(34,197,94,0.12)',  border: '#22C55E', color: '#22C55E',  label: 'Rendah' },
  success:  { bg: 'rgba(34,197,94,0.12)',  border: '#22C55E', color: '#22C55E',  label: 'Terverifikasi' },
  info:     { bg: 'rgba(59,130,246,0.12)', border: '#3B82F6', color: '#3B82F6',  label: 'Info' },
}

const CONFIG = {
  ..._BASE,
  warning: _BASE.high,
  medium:  _BASE.moderate,
  danger:  _BASE.critical,
}

export default function SeverityBadge({ level = 'info', label, size = 'sm' }) {
  const cfg = CONFIG[level] || CONFIG.info
  const text = label ?? cfg.label
  const px = size === 'xs' ? '6px' : '8px'
  const py = size === 'xs' ? '1px' : '3px'
  const fontSize = size === 'xs' ? 9 : 10

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      color: cfg.color, borderRadius: 4,
      padding: `${py} ${px}`, fontSize, fontWeight: 600,
      fontFamily: 'Inter', letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {text}
    </span>
  )
}
