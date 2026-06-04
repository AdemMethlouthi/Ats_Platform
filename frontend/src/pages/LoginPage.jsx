import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      loginUser(res.data)
      navigate(res.data.role === 'HR' ? '/dashboard' : '/jobs')
    } catch {
      setError('Invalid username or password')
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.logoRow}>
            <div style={s.logoDot} />
            <span style={s.logoText}>ATS Platform</span>
          </div>
          <h1 style={s.hero}>Hire smarter,<br />not harder.</h1>
          <p style={s.sub}>Manage job offers, track candidates,<br />and streamline your recruitment process.</p>
          <div style={s.features}>
            {['Post & manage job offers', 'Track applications in real-time', 'Role-based access for HR teams'].map(f => (
              <div key={f} style={s.feature}>
                <div style={s.featureDot} />
                <span style={s.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Welcome back</h2>
          <p style={s.cardSub}>Sign in to your account</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Username</label>
              <input
                style={s.input}
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh' },
  left: { flex: 1, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
  leftContent: { maxWidth: '440px' },
  logoRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '48px' },
  logoDot: { width: '10px', height: '10px', borderRadius: '50%', background: '#fff' },
  logoText: { color: '#fff', fontSize: '18px', fontWeight: '600' },
  hero: { color: '#fff', fontSize: '42px', fontWeight: '700', lineHeight: '1.2', marginBottom: '16px' },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' },
  features: { display: 'flex', flexDirection: 'column', gap: '12px' },
  feature: { display: 'flex', alignItems: 'center', gap: '10px' },
  featureDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)', flexShrink: 0 },
  featureText: { color: 'rgba(255,255,255,0.85)', fontSize: '15px' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', background: '#f8fafc' },
  card: { width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' },
  cardSub: { fontSize: '14px', color: '#64748b', marginBottom: '28px' },
  error: { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' },
  field: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' },
  btn: { width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
}