import { useState, useRef } from 'react'
import { Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function PinInput({ value, onChange, error }) {
  const r0 = useRef(null), r1 = useRef(null), r2 = useRef(null), r3 = useRef(null)
  const refs = [r0, r1, r2, r3]

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = value.slice(0, Math.max(0, i))
      onChange(next)
      if (i > 0) refs[i - 1].current?.focus()
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault()
      const arr = (value + '    ').slice(0, 4).split('')
      arr[i] = e.key
      const next = arr.join('').trimEnd()
      onChange(next)
      if (i < 3) refs[i + 1].current?.focus()
    }
  }

  const digits = (value + '    ').slice(0, 4).split('')

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={() => {}}
          onKeyDown={e => handleKey(i, e)}
          onFocus={e => { e.target.select(); e.target.style.borderColor = error ? '#EF4444' : '#3B82F6' }}
          onBlur={e => { e.target.style.borderColor = error ? '#EF4444' : d.trim() ? '#3B82F688' : 'rgba(255,255,255,0.15)' }}
          style={{
            width: 52, height: 60,
            background: error ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
            border: `2px solid ${error ? '#EF4444' : d.trim() ? '#3B82F688' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: 12,
            color: '#E8EDF2',
            fontSize: 28,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            textAlign: 'center',
            outline: 'none',
            transition: 'border-color 150ms, background 150ms',
          }}
        />
      ))}
    </div>
  )
}

export default function SessionLock() {
  const { user, unlock, logout } = useAuth()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUnlock = async (e) => {
    e.preventDefault()
    if (pin.length < 4) { setError('Masukkan 4 digit PIN.'); return }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 400))
    const result = await unlock(pin)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      setPin('')
    }
  }

  // Auto-submit when all 4 digits entered
  const handlePinChange = async (v) => {
    setPin(v)
    setError('')
    if (v.length === 4) {
      setLoading(true)
      await new Promise(r => setTimeout(r, 400))
      const result = await unlock(v)
      setLoading(false)
      if (!result.ok) {
        setError(result.error)
        setPin('')
      }
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#0A0E13',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blur circles */}
      <div style={{ position: 'absolute', top: '20%', left: '20%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Classification banner */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#162216', borderBottom: '1px solid rgba(34,197,94,0.25)', padding: '6px 0', textAlign: 'center', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.15em', color: '#22C55E' }}>
        MODE LATIHAN — DATA SIMULASI
      </div>

      <form onSubmit={handleUnlock} style={{
        position: 'relative', zIndex: 1, width: 360,
        background: 'rgba(19,25,34,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '44px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
      }}>
        {/* Lock icon */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Lock size={24} color="#3B82F6" />
        </div>

        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#E8EDF2', margin: '0 0 6px', textAlign: 'center' }}>Sesi Terkunci</h2>
        <p style={{ fontSize: 12, color: '#7C8A99', margin: '0 0 6px', textAlign: 'center', fontFamily: 'Inter' }}>
          Halo, {user?.nama}
        </p>
        <p style={{ fontSize: 11, color: '#4B5563', margin: '0 0 32px', textAlign: 'center', fontFamily: 'Inter' }}>
          Masukkan PIN 4-digit untuk melanjutkan
        </p>

        <PinInput value={pin} onChange={handlePinChange} error={!!error} />

        {error && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '8px 12px' }}>
            <AlertCircle size={13} color="#EF4444" />
            <span style={{ fontSize: 11, color: '#EF4444', fontFamily: 'Inter' }}>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading || pin.length < 4} style={{ width: '100%', marginTop: 28, padding: '12px', background: loading || pin.length < 4 ? '#1A2230' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: `1px solid ${loading || pin.length < 4 ? '#1F2937' : 'transparent'}`, borderRadius: 10, cursor: loading || pin.length < 4 ? 'not-allowed' : 'pointer', color: loading || pin.length < 4 ? '#4B5563' : '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk', transition: 'all 150ms' }}>
          {loading ? 'Memverifikasi…' : 'Buka Kunci'}
        </button>

        <button type="button" onClick={logout} style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#4B5563', fontSize: 11, fontFamily: 'Inter', textDecoration: 'underline' }}>
          Keluar dan masuk ulang
        </button>
      </form>
    </div>
  )
}
