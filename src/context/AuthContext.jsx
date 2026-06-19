import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { MOCK_USERS } from '../data/schema'

const AuthContext = createContext(null)

const STORAGE_KEY = 'sistema_session'
const IDLE_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const OTP_FIXED = '123456' // simulation OTP

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user) {
  if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else sessionStorage.removeItem(STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession())
  const [isLocked, setIsLocked] = useState(false)
  const idleTimer = useRef(null)

  const resetIdle = useCallback(() => {
    if (!user || isLocked) return
    clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => setIsLocked(true), IDLE_TIMEOUT)
  }, [user, isLocked])

  // Attach global activity listeners
  useEffect(() => {
    if (!user) return
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll']
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }))
    resetIdle()
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle))
      clearTimeout(idleTimer.current)
    }
  }, [user, resetIdle])

  const login = useCallback(async ({ email, password, otp }) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) return { ok: false, error: 'Email atau password salah.' }
    if (otp !== OTP_FIXED) return { ok: false, error: 'Kode OTP tidak valid.' }
    saveSession(found)
    setUser(found)
    setIsLocked(false)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    clearTimeout(idleTimer.current)
    saveSession(null)
    setUser(null)
    setIsLocked(false)
  }, [])

  const lock = useCallback(() => setIsLocked(true), [])

  const unlock = useCallback(async (pin) => {
    if (!user) return { ok: false, error: 'Sesi tidak ditemukan.' }
    if (pin !== user.pin) return { ok: false, error: 'PIN salah.' }
    setIsLocked(false)
    resetIdle()
    return { ok: true }
  }, [user, resetIdle])

  return (
    <AuthContext.Provider value={{ user, isLocked, login, logout, lock, unlock }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
