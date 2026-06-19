// Entity ID schema and mock user definitions

export const ID_PREFIXES = {
  LAPORAN:    'RPT',
  PERINGATAN: 'WRN',
  PENGGUNA:   'USR',
  SATUAN:     'SAT',
  EXCHANGE:   'EXC',
  REKOMENDASI:'REC',
}

export function genId(prefix, year, seq) {
  const y = year ?? new Date().getFullYear()
  return `${prefix}-${y}-${String(seq).padStart(6, '0')}`
}

// Mock credentials — displayed as hint in Login
// OTP fixed: 123456 for all users (simulation)
export const MOCK_USERS = [
  {
    id: 'USR-ADM-0001',
    nama: 'Administrator',
    email: 'admin@sistema.go.id',
    password: 'Admin@1234',
    pin: '1234',
    role: 'admin',
    jabatan: 'System Administrator',
    satuan: 'SAT-HQ-001',
    avatar: 'AD',
    avatarColor: '#7C3AED',
  },
  {
    id: 'USR-PIM-0001',
    nama: 'Pimpinan Pusat',
    email: 'pimpinan@sistema.go.id',
    password: 'Pimpin@1234',
    pin: '5678',
    role: 'pimpinan',
    jabatan: 'Deputi Bidang Penindakan',
    satuan: 'SAT-HQ-001',
    avatar: 'PP',
    avatarColor: '#0891B2',
  },
  {
    id: 'USR-ANL-0001',
    nama: 'Analis Pusat',
    email: 'analis@sistema.go.id',
    password: 'Analis@1234',
    pin: '9012',
    role: 'analis',
    jabatan: 'Analis Intelijen Madya',
    satuan: 'SAT-ANL-002',
    avatar: 'AP',
    avatarColor: '#3B82F6',
  },
  {
    id: 'USR-OPR-0001',
    nama: 'Operator Lapangan',
    email: 'operator@sistema.go.id',
    password: 'Operator@1234',
    pin: '3456',
    role: 'operator',
    jabatan: 'Operator Sistem Monitoring',
    satuan: 'SAT-FLD-007',
    avatar: 'OL',
    avatarColor: '#059669',
  },
]

// Role-based route access (* = all routes)
export const ROLE_PERMISSIONS = {
  admin:    '*',
  pimpinan: ['/', '/peta-monitoring', '/early-warning', '/analisis-ancaman', '/decision-support', '/laporan-intelijen', '/repository-data', '/jaringan-intelijen'],
  analis:   ['/', '/pengumpulan-informasi', '/analisis-ancaman', '/early-warning', '/peta-monitoring', '/pertukaran-informasi', '/laporan-intelijen', '/repository-data', '/jaringan-intelijen', '/decision-support'],
  operator: ['/', '/pengumpulan-informasi', '/early-warning', '/peta-monitoring', '/laporan-intelijen'],
}

export function canAccess(role, path) {
  const perms = ROLE_PERMISSIONS[role]
  if (!perms) return false
  if (perms === '*') return true
  const base = '/' + path.split('/').filter(Boolean)[0] || '/'
  return perms.includes(path) || perms.includes(base) || path === '/'
}
