import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Login from './pages/Login'
import DashboardPimpinan from './pages/DashboardPimpinan'
import JaringanIntelijen from './pages/JaringanIntelijen'
import PengumpulanInformasi from './pages/PengumpulanInformasi'
import AnalisisAncaman from './pages/AnalisisAncaman'
import DecisionSupport from './pages/DecisionSupport'
import PetaMonitoring from './pages/PetaMonitoring'
import EarlyWarning from './pages/EarlyWarning'
import PertukaranInformasi from './pages/PertukaranInformasi'
import LaporanIntelijen from './pages/LaporanIntelijen'
import RepositoryData from './pages/RepositoryData'
import AdminPengguna from './pages/AdminPengguna'
import AuditKeamanan from './pages/AuditKeamanan'
import PlaceholderPage from './pages/PlaceholderPage'

const Wrap = ({ children }) => <AppShell>{children}</AppShell>

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Wrap><DashboardPimpinan /></Wrap>} />
        <Route path="/jaringan-intelijen" element={<Wrap><JaringanIntelijen /></Wrap>} />
        <Route path="/pengumpulan-informasi" element={<Wrap><PengumpulanInformasi /></Wrap>} />
        <Route path="/analisis-ancaman" element={<Wrap><AnalisisAncaman /></Wrap>} />
        <Route path="/early-warning" element={<Wrap><EarlyWarning /></Wrap>} />
        <Route path="/peta-monitoring" element={<Wrap><PetaMonitoring /></Wrap>} />
        <Route path="/pertukaran-informasi" element={<Wrap><PertukaranInformasi /></Wrap>} />
        <Route path="/laporan-intelijen" element={<Wrap><LaporanIntelijen /></Wrap>} />
        <Route path="/repository-data" element={<Wrap><RepositoryData /></Wrap>} />
        <Route path="/decision-support" element={<Wrap><DecisionSupport /></Wrap>} />
        <Route path="/admin/pengguna" element={<Wrap><AdminPengguna /></Wrap>} />
        <Route path="/admin/audit-keamanan" element={<Wrap><AuditKeamanan /></Wrap>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
