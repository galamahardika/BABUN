import { Construction } from 'lucide-react'

export default function PlaceholderPage({ title, code }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100%', gap: 16, padding: 40,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Construction size={24} color="#3B82F6" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#E8EDF2', margin: 0 }}>
          {title}
        </p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#7C8A99', margin: '6px 0 0' }}>
          Modul {code} — Akan dibangun di fase berikutnya
        </p>
      </div>
    </div>
  )
}
