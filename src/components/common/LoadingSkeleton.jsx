// Animated pulse skeleton for loading states

function Bone({ width = '100%', height = 14, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: 4,
      background: 'linear-gradient(90deg, #1A2230 25%, #1F2A3A 50%, #1A2230 75%)',
      backgroundSize: '400% 100%',
      animation: 'skeleton-shimmer 1.4s ease infinite',
      ...style,
    }} />
  )
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#131922', border: '1px solid #1F2937', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Bone width="40%" height={10} />
      <Bone width="60%" height={24} />
      <Bone width="50%" height={10} />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #1F2937' }}>
      <Bone width={32} height={32} style={{ borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Bone width="55%" height={11} />
        <Bone width="35%" height={9} />
      </div>
      <Bone width={60} height={20} style={{ borderRadius: 4, flexShrink: 0 }} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => <SkeletonRow key={i} />)}
    </div>
  )
}

export default function LoadingSkeleton({ type = 'table', rows = 5, cards = 3 }) {
  if (type === 'cards') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards}, 1fr)`, gap: 16 }}>
        {Array.from({ length: cards }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }
  return <SkeletonTable rows={rows} />
}
