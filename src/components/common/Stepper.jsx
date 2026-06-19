const levelColor = {
  critical: '#EF4444', high: '#F59E0B', moderate: '#FACC15',
  success: '#22C55E', info: '#3B82F6', default: '#7C8A99',
}

export default function Stepper({ steps = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step, i) => {
        const color = levelColor[step.level] || levelColor.default
        const isLast = i === steps.length - 1
        return (
          <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            {/* Line + dot */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: color, flexShrink: 0,
                boxShadow: `0 0 6px ${color}66`,
                border: `2px solid ${color}33`,
                marginTop: 2,
              }} />
              {!isLast && (
                <div style={{ flex: 1, width: 1.5, background: '#1F2937', minHeight: 24, marginTop: 4 }} />
              )}
            </div>
            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 16, flex: 1 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#E8EDF2', margin: 0 }}>{step.title}</p>
              {step.time && (
                <p style={{ fontSize: 10, color: '#7C8A99', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
                  {step.time}
                </p>
              )}
              {step.desc && (
                <p style={{ fontSize: 11, color: '#7C8A99', margin: '4px 0 0' }}>{step.desc}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
