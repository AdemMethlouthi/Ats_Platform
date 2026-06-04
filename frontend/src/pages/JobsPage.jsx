import { useState, useEffect } from 'react'
import { getOpenJobs } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getOpenJobs()
      .then(res => {
        setJobs(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

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
          <button onClick={() => navigate('/apply')} style={styles.applyBtn}>
            Apply for a Job
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h1 style={styles.title}>Available Job Offers</h1>
        <p style={styles.subtitle}>{jobs.length} open positions</p>

        {loading ? (
          <p style={styles.loading}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p style={styles.empty}>No open positions at the moment.</p>
        ) : (
          <div style={styles.grid}>
            {jobs.map(job => (
              <div key={job.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <span style={styles.badge}>{job.contractType}</span>
                </div>
                <p style={styles.description}>{job.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.location}>📍 {job.location}</span>
                  <span style={styles.deadline}>
                    📅 Deadline: {job.deadline}
                  </span>
                </div>
                <button
                  style={styles.applyCardBtn}
                  onClick={() => navigate('/apply', { state: { jobId: job.id, jobTitle: job.title } })}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
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
  applyBtn: {
    padding: '8px 16px',
    backgroundColor: '#4f46e5',
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
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 16px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#666',
    marginBottom: '24px',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    fontSize: '18px',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: '18px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#1a1a2e',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#ede9fe',
    color: '#4f46e5',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  description: {
    color: '#555',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#888',
  },
  location: {
    fontSize: '13px',
  },
  deadline: {
    fontSize: '13px',
  },
  applyCardBtn: {
    padding: '10px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    marginTop: '4px',
  },
}