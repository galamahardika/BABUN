import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({ title = 'Terjadi kesalahan', desc, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <AlertTriangle size={24} color="#EF4444" />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#EF4444', margin: '0 0 6px', fontFamily: 'Space Grotesk' }}>{title}</p>
      {desc && <p style={{ fontSize: 12, color: '#7C8A99', margin: '0 0 20px', fontFamily: 'Inter', maxWidth: 300, lineHeight: 1.5 }}>{desc}</p>}
      {onRetry && (
        <button onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444', fontSize: 12, fontWeight: 500, fontFamily: 'Inter', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Coba lagi
        </button>
      )}
    </div>
  )
}
