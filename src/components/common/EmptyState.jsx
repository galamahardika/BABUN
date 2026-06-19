import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Tidak ada data', desc, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid #1F2937', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Icon size={24} color="#374151" />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#4B5563', margin: '0 0 6px', fontFamily: 'Space Grotesk' }}>{title}</p>
      {desc && <p style={{ fontSize: 12, color: '#374151', margin: '0 0 20px', fontFamily: 'Inter', maxWidth: 280, lineHeight: 1.5 }}>{desc}</p>}
      {action && (
        <button onClick={action.onClick} style={{ padding: '8px 18px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 8, color: '#3B82F6', fontSize: 12, fontWeight: 500, fontFamily: 'Inter', cursor: 'pointer' }}>
          {action.label}
        </button>
      )}
    </div>
  )
}
