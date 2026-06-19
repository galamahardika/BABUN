export default function ThreatPulse({ size = 32, color = '#22D3D8' }) {
  const c = size / 2
  const r = size * 0.18

  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulse rings */}
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`pulse-ring${i === 0 ? '' : `-${i + 1}`}`}
          style={{
            position: 'absolute',
            width: r * 2, height: r * 2,
            borderRadius: '50%',
            border: `1.5px solid ${color}`,
          }}
        />
      ))}
      {/* Core dot */}
      <span style={{
        width: r * 1.2, height: r * 1.2, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}`,
        position: 'relative', zIndex: 1,
      }} />
    </span>
  )
}
