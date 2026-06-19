import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield } from 'lucide-react'

export default function Login() {
  const nav = useNavigate()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', password: '', mfa: 'TOTP' })

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { nav('/') }, 850)
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#0A0E13',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }}
           viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 19 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="1440" y2={i * 50} stroke="#22D3D8" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 29 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="900" stroke="#22D3D8" strokeWidth="0.5" />
        ))}
        {/* Parallels */}
        {[-60,-30,0,30,60].map((d, i) => (
          <ellipse key={i} cx="720" cy="450" rx="600" ry={Math.abs(d) + 50}
                   fill="none" stroke="#3B82F6" strokeWidth="0.5" opacity="0.5"
                   transform={`skewX(${d * 0.1})`} />
        ))}
      </svg>

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '20%', left: '15%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '15%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,216,0.06) 0%, transparent 70%)',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(19,25,34,0.95)',
        border: '1px solid #1F2937',
        borderRadius: 16, padding: '40px 36px',
        width: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg,#3B82F6,#22D3D8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59,130,246,0.4)',
          }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#E8EDF2', margin: 0 }}>
              Sistem A — BNPT
            </p>
            <p style={{ fontSize: 11, color: '#7C8A99', margin: 0 }}>
              Jaringan Intelijen Pencegahan Terorisme
            </p>
          </div>
        </div>

        <div style={{
          background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)',
          borderRadius: 8, padding: '8px 12px', marginBottom: 24,
          fontSize: 10, color: '#FACC15', textAlign: 'center', letterSpacing: '0.05em',
        }}>
          ⚠ MODE LATIHAN — DATA SIMULASI
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#7C8A99', marginBottom: 6, fontWeight: 500 }}>
              USERNAME / ID OPERATOR
            </label>
            <input
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="mis. OPR-2401"
              style={{
                width: '100%', background: '#1A2230', border: '1px solid #1F2937',
                borderRadius: 8, padding: '10px 14px', color: '#E8EDF2',
                fontSize: 13, fontFamily: 'Inter', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#3B82F6'}
              onBlur={e => e.target.style.borderColor = '#1F2937'}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#7C8A99', marginBottom: 6, fontWeight: 500 }}>
              KATA SANDI
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                style={{
                  width: '100%', background: '#1A2230', border: '1px solid #1F2937',
                  borderRadius: 8, padding: '10px 40px 10px 14px', color: '#E8EDF2',
                  fontSize: 13, fontFamily: 'Inter', outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#1F2937'}
              />
              <button type="button" onClick={() => setShow(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {show ? <EyeOff size={15} color="#7C8A99" /> : <Eye size={15} color="#7C8A99" />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#7C8A99', marginBottom: 6, fontWeight: 500 }}>
              METODE VERIFIKASI (MFA)
            </label>
            <select
              value={form.mfa}
              onChange={e => setForm(f => ({ ...f, mfa: e.target.value }))}
              style={{
                width: '100%', background: '#1A2230', border: '1px solid #1F2937',
                borderRadius: 8, padding: '10px 14px', color: '#E8EDF2',
                fontSize: 13, fontFamily: 'Inter', outline: 'none',
                boxSizing: 'border-box', cursor: 'pointer',
              }}>
              <option value="TOTP">TOTP Authenticator</option>
              <option value="SMS">SMS OTP (Simulasi)</option>
              <option value="HW">Hardware Token (Simulasi)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8, padding: '12px', borderRadius: 8,
              background: loading ? '#1F2937' : 'linear-gradient(135deg,#3B82F6,#2563EB)',
              color: loading ? '#7C8A99' : '#fff',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14,
              boxShadow: loading ? 'none' : '0 0 16px rgba(59,130,246,0.4)',
              transition: 'all 200ms ease',
            }}>
            {loading ? 'Memverifikasi…' : 'Masuk ke Sistem'}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 10, color: '#1F2937' }}>
          Akses tidak sah akan dicatat dan dilaporkan
        </p>
      </div>
    </div>
  )
}
