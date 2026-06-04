import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import JobsPage from './pages/JobsPage'
import DashboardPage from './pages/DashboardPage'
import CandidatePage from './pages/CandidatePage'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/jobs" element={user ? <JobsPage /> : <Navigate to="/login" />} />
      <Route path="/dashboard" element={user?.role === 'HR' ? <DashboardPage /> : <Navigate to="/login" />} />
      <Route path="/apply" element={user ? <CandidatePage /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App