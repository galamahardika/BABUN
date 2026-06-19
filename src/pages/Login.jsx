import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Shield, AlertCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { MOCK_USERS } from '../data/schema'

const HINT_CREDS = [
  { label: 'Admin', email: 'admin@sistema.go.id', password: 'Admin@1234', pin: '1234' },
  { label: 'Pimpinan', email: 'pimpinan@sistema.go.id', password: 'Pimpin@1234', pin: '5678' },
  { label: 'Analis', email: 'analis@sistema.go.id', password: 'Analis@1234', pin: '9012' },
  { label: 'Operator', email: 'operator@sistema.go.id', password: 'Operator@1234', pin: '3456' },
]

function OtpInput({ value, onChange }) {
  const r0 = useRef(null), r1 = useRef(null), r2 = useRef(null)
  const r3 = useRef(null), r4 = useRef(null), r5 = useRef(null)
  const refs = [r0, r1, r2, r3, r4, r5]

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = value.slice(0, Math.max(0, i))
      onChange(next)
      if (i > 0) refs[i - 1].current?.focus()
    } else if (/^\d$/.test(e.key)) {
      e.preventDefault()
      const arr = (value + '      ').slice(0, 6).split('')
      arr[i] = e.key
      const next = arr.join('').trimEnd()
      onChange(next)
      if (i < 5) refs[i + 1].current?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs[i - 1].current?.focus()
    } else if (e.key === 'ArrowRight' && i < 5) {
      refs[i + 1].current?.focus()
    }
  }

  const digits = (value + '      ').slice(0, 6).split('')

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={() => {}}
          onKeyDown={e => handleKey(i, e)}
          onFocus={e => { e.target.select(); e.target.style.borderColor = '#3B82F6' }}
          onBlur={e => { e.target.style.borderColor = d.trim() ? '#3B82F6' : 'rgba(255,255,255,0.12)' }}
          style={{
            width: 42, height: 48,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${d.trim() ? '#3B82F688' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 8,
            color: '#E8EDF2',
            fontSize: 20,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            textAlign: 'center',
            outline: 'none',
            transition: 'border-color 150ms',
          }}
        />
      ))}
    </div>
  )
}

export default function Login() {
  const nav = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showHint, setShowHint] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleCredentials = (e) => {
    e.preventDefault()
    setError('')
    const found = MOCK_USERS.find(u => u.email === email)
    if (!found || found.password !== password) {
      setError('Email atau password tidak dikenali.')
      return
    }
    setStep(2)
  }

  const handleOtp = async (e) => {
    e.preventDefault()
    if (otp.length < 6) { setError('Masukkan 6 digit OTP.'); return }
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))
    const result = await login({ email, password, otp })
    setLoading(false)
    if (result.ok) {
      nav(from, { replace: true })
    } else {
      setError(result.error)
    }
  }

  const fillHint = (h) => {
    setEmail(h.email)
    setPassword(h.password)
    setShowHint(false)
    setStep(1)
    setOtp('')
    setError('')
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '10px 14px',
    color: '#E8EDF2', fontSize: 13, fontFamily: 'Inter',
    outline: 'none', transition: 'border-color 150ms',
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#0A0E13',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}
           viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 19 }, (_, i) => <line key={`h${i}`} x1="0" y1={i*50} x2="1440" y2={i*50} stroke="#22D3D8" strokeWidth="0.5" />)}
        {Array.from({ length: 29 }, (_, i) => <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="900" stroke="#22D3D8" strokeWidth="0.5" />)}
      </svg>
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,216,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Classification banner */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#162216', borderBottom: '1px solid rgba(34,197,94,0.25)', padding: '6px 0', textAlign: 'center', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.15em', color: '#22C55E' }}>
        MODE LATIHAN — DATA SIMULASI
      </div>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1, width: 420,
        background: 'rgba(19,25,34,0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '40px 36px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg, #3B82F6, #22D3D8)', boxShadow: '0 0 24px rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Shield size={24} color="#fff" />
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#E8EDF2', margin: 0 }}>Sistem A</h1>
          <p style={{ fontSize: 11, color: '#7C8A99', margin: '3px 0 0', fontFamily: 'Inter' }}>Platform Intelijen Terpadu</p>
        </div>

        {/* Step bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ height: 3, borderRadius: 2, flex: 1, background: step >= s ? '#3B82F6' : 'rgba(255,255,255,0.1)', transition: 'background 300ms' }} />
          ))}
        </div>

        {error && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '9px 12px', marginBottom: 16 }}>
            <AlertCircle size={14} color="#EF4444" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#EF4444', fontFamily: 'Inter' }}>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCredentials}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: '#7C8A99', display: 'block', marginBottom: 6, fontFamily: 'Inter', fontWeight: 500 }}>Email Akun</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@sistema.go.id" required autoComplete="username"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>

            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label style={{ fontSize: 11, color: '#7C8A99', display: 'block', marginBottom: 6, fontFamily: 'Inter', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={e => e.target.style.borderColor = '#3B82F6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={15} color="#7C8A99" /> : <Eye size={15} color="#7C8A99" />}
                </button>
              </div>
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk', boxShadow: '0 4px 16px rgba(59,130,246,0.35)' }}>
              Lanjutkan →
            </button>

            {/* Credential hint */}
            <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
              <button type="button" onClick={() => setShowHint(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#7C8A99', fontSize: 11, fontFamily: 'Inter' }}>
                Kredensial demo
                <ChevronDown size={12} style={{ transform: showHint ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
              </button>
              {showHint && (
                <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {HINT_CREDS.map(h => (
                    <button key={h.label} type="button" onClick={() => fillHint(h)} style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', textAlign: 'left' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', margin: 0, fontFamily: 'Inter' }}>{h.label}</p>
                      <p style={{ fontSize: 9, color: '#7C8A99', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>PIN: {h.pin} • OTP: 123456</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtp}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: '#E8EDF2', margin: '0 0 4px', fontFamily: 'Inter', fontWeight: 600 }}>Verifikasi OTP</p>
              <p style={{ fontSize: 11, color: '#7C8A99', margin: 0, fontFamily: 'Inter' }}>Masukkan 6-digit kode OTP dari aplikasi autentikator</p>
              <p style={{ fontSize: 10, color: '#3B82F6', margin: '6px 0 0', fontFamily: 'JetBrains Mono, monospace', opacity: 0.7 }}>[SIMULASI] OTP tetap: 123456</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            <button type="submit" disabled={loading || otp.length < 6} style={{ width: '100%', padding: '12px', background: loading || otp.length < 6 ? '#1F2937' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: 10, cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer', color: loading || otp.length < 6 ? '#4B5563' : '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'Space Grotesk', boxShadow: loading || otp.length < 6 ? 'none' : '0 4px 16px rgba(59,130,246,0.35)' }}>
              {loading ? 'Memverifikasi…' : 'Masuk ke Sistem'}
            </button>

            <button type="button" onClick={() => { setStep(1); setOtp(''); setError('') }} style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, cursor: 'pointer', color: '#7C8A99', fontSize: 12, fontFamily: 'Inter' }}>
              ← Kembali
            </button>
          </form>
        )}

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 10, color: '#374151', fontFamily: 'Inter' }}>
          Akses tidak sah akan dicatat dan dilaporkan
        </p>
      </div>
    </div>
  )
}
