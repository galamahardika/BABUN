import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import DashboardPimpinan from './pages/DashboardPimpinan'
import PetaMonitoring from './pages/PetaMonitoring'
import EarlyWarning from './pages/EarlyWarning'
import PlaceholderPage from './pages/PlaceholderPage'

const Wrap = ({ children }) => <AppShell>{children}</AppShell>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Wrap><DashboardPimpinan /></Wrap>} />
        <Route path="/jaringan-intelijen" element={<Wrap><PlaceholderPage title="Manajemen Jaringan Intelijen" code="A.1" /></Wrap>} />
        <Route path="/pengumpulan-informasi" element={<Wrap><PlaceholderPage title="Pengumpulan & Validasi Informasi" code="A.2" /></Wrap>} />
        <Route path="/analisis-ancaman" element={<Wrap><PlaceholderPage title="Analisis Ancaman & Threat Assessment" code="A.3" /></Wrap>} />
        <Route path="/early-warning" element={<Wrap><EarlyWarning /></Wrap>} />
        <Route path="/peta-monitoring" element={<Wrap><PetaMonitoring /></Wrap>} />
        <Route path="/pertukaran-informasi" element={<Wrap><PlaceholderPage title="Pertukaran Informasi Antar Lembaga" code="A.7" /></Wrap>} />
        <Route path="/laporan-intelijen" element={<Wrap><PlaceholderPage title="Manajemen Laporan Intelijen" code="A.9" /></Wrap>} />
        <Route path="/repository-data" element={<Wrap><PlaceholderPage title="Repository Data Intelijen" code="A.10" /></Wrap>} />
        <Route path="/decision-support" element={<Wrap><PlaceholderPage title="Decision Support System" code="A.11" /></Wrap>} />
        <Route path="/admin/pengguna" element={<Wrap><PlaceholderPage title="Pengguna & Hak Akses" code="A.12" /></Wrap>} />
        <Route path="/admin/audit-keamanan" element={<Wrap><PlaceholderPage title="Audit & Kepatuhan Keamanan" code="A.13" /></Wrap>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
