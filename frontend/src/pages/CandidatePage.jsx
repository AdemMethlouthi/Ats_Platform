import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createCandidate, applyToJob } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CandidatePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logoutUser } = useAuth()

  const jobId = location.state?.jobId
  const jobTitle = location.state?.jobTitle

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Step 1 — Create candidate
      const candidateRes = await createCandidate(form)
      const candidateId = candidateRes.data.id

      // Step 2 — Submit application
      await applyToJob({
        candidate: { id: candidateId },
        jobOffer: { id: jobId }
      })

      setSuccess(`Application submitted successfully for "${jobTitle}"!`)
      setForm({ fullName: '', email: '', phone: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>ATS Platform</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>👋 {user?.username}</span>
          <button onClick={() => navigate('/jobs')} style={styles.backBtn}>
            ← Back to Jobs
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Apply for a Position</h1>

          {jobTitle && (
            <div style={styles.jobBanner}>
              <span>📋 Applying for: </span>
              <strong>{jobTitle}</strong>
            </div>
          )}

          {!jobId && (
            <div style={styles.warning}>
              ⚠️ No job selected. Please go back and click "Apply Now" on a job.
            </div>
          )}

          {success && (
            <div style={styles.success}>
              ✅ {success}
            </div>
          )}

          {error && (
            <div style={styles.error}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Ahmed Ben Ali"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="ahmed@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone</label>
              <input
                style={styles.input}
                type="text"
                placeholder="55123456"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>

            <button
              style={{
                ...styles.button,
                opacity: loading || !jobId ? 0.6 : 1,
                cursor: loading || !jobId ? 'not-allowed' : 'pointer'
              }}
              type="submit"
              disabled={loading || !jobId}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
  },
  navbar: {
    backgroundColor: '#fff',
    padding: '16px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  logo: {
    margin: 0,
    color: '#4f46e5',
    fontSize: '22px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  welcome: {
    color: '#333',
    fontSize: '14px',
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '32px 16px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    margin: '0 0 20px',
  },
  jobBanner: {
    backgroundColor: '#ede9fe',
    color: '#4f46e5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  warning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  success: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  field: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '8px',
  },
}