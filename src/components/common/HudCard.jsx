export default function HudCard({ title, value, sub, accent = '#3B82F6', icon: Icon, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 border backdrop-blur-sm ${onClick ? 'cursor-pointer hover:border-opacity-80' : ''} ${className}`}
      style={{
        background: 'rgba(26,34,48,0.85)',
        borderColor: accent + '33',
        boxShadow: `0 0 12px ${accent}22`,
        transition: 'box-shadow 150ms ease',
      }}
      onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = `0 0 20px ${accent}44`)}
      onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = `0 0 12px ${accent}22`)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#7C8A99', letterSpacing: '0.08em' }}>
          {title}
        </p>
        {Icon && <Icon size={14} style={{ color: accent, flexShrink: 0 }} />}
      </div>
      <p className="mt-2 text-2xl font-bold" style={{ fontFamily: 'Space Grotesk', color: accent }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs" style={{ color: '#7C8A99' }}>{sub}</p>}
    </div>
  )
}
