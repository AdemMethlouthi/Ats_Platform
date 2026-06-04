import { useState, useEffect } from 'react'
import { getJobs, getCandidates, getApplications, updateStatus, createJob, deleteJob } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [applications, setApplications] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [newJob, setNewJob] = useState({ title: '', description: '', location: '', contractType: 'CDI', deadline: '', status: 'OPEN' })
  const [showJobForm, setShowJobForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [j, c, a] = await Promise.all([getJobs(), getCandidates(), getApplications()])
      setJobs(j.data)
      setCandidates(c.data)
      setApplications(a.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus(id, status)
      fetchAll()
    } catch (err) { console.error(err) }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    try {
      await createJob(newJob)
      setNewJob({ title: '', description: '', location: '', contractType: 'CDI', deadline: '', status: 'OPEN' })
      setShowJobForm(false)
      fetchAll()
    } catch (err) { console.error(err) }
  }

  const handleDeleteJob = async (id) => {
    if (window.confirm('Delete this job offer?')) {
      await deleteJob(id)
      fetchAll()
    }
  }

  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'

  const avatarColor = (name) => {
    const colors = [
      { bg: '#ede9fe', color: '#6d28d9' },
      { bg: '#d1fae5', color: '#065f46' },
      { bg: '#dbeafe', color: '#1e40af' },
      { bg: '#fce7f3', color: '#9d174d' },
      { bg: '#fef3c7', color: '#92400e' },
    ]
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
  }

  const statusStyle = (status) => {
    const map = {
      PENDING: { bg: '#fef3c7', color: '#92400e' },
      REVIEWED: { bg: '#dbeafe', color: '#1e40af' },
      ACCEPTED: { bg: '#d1fae5', color: '#065f46' },
      REJECTED: { bg: '#fee2e2', color: '#dc2626' },
    }
    return map[status] || { bg: '#f1f5f9', color: '#475569' }
  }

  const acceptanceRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === 'ACCEPTED').length / applications.length) * 100)
    : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <div style={s.logoDot} />
          <span style={s.logoText}>ATS Platform</span>
        </div>

        <nav style={s.nav}>
          {[
            { id: 'overview', icon: '◉', label: 'Overview' },
            { id: 'jobs', icon: '📋', label: 'Job offers' },
            { id: 'candidates', icon: '👥', label: 'Candidates' },
            { id: 'applications', icon: '📨', label: 'Applications' },
          ].map(item => (
            <button
              key={item.id}
              style={{ ...s.navItem, ...(activeTab === item.id ? s.navItemActive : {}) }}
              onClick={() => setActiveTab(item.id)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.userCard}>
            <div style={{ ...s.userAvatar, background: '#ede9fe', color: '#6d28d9' }}>
              {initials(user?.username)}
            </div>
            <div>
              <div style={s.userName}>{user?.username}</div>
              <div style={s.userRole}>HR Manager</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={() => { logoutUser(); navigate('/login') }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'jobs' && 'Job offers'}
              {activeTab === 'candidates' && 'Candidates'}
              {activeTab === 'applications' && 'Applications'}
            </h1>
            <p style={s.pageSubtitle}>
              {activeTab === 'overview' && 'Overview of your recruitment pipeline'}
              {activeTab === 'jobs' && `${jobs.length} total positions`}
              {activeTab === 'candidates' && `${candidates.length} registered candidates`}
              {activeTab === 'applications' && `${applications.length} total applications`}
            </p>
          </div>
          {activeTab === 'jobs' && (
            <button style={s.btnPrimary} onClick={() => setShowJobForm(!showJobForm)}>
              {showJobForm ? '✕ Cancel' : '+ Add job offer'}
            </button>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={s.statsGrid}>
              {[
                { label: 'Total jobs', value: jobs.length, sub: `${jobs.filter(j => j.status === 'OPEN').length} open`, color: '#6366f1' },
                { label: 'Candidates', value: candidates.length, sub: 'registered', color: '#8b5cf6' },
                { label: 'Applications', value: applications.length, sub: 'submitted', color: '#06b6d4' },
                { label: 'Acceptance rate', value: `${acceptanceRate}%`, sub: `${applications.filter(a => a.status === 'ACCEPTED').length} accepted`, color: '#10b981' },
              ].map(stat => (
                <div key={stat.label} style={s.statCard}>
                  <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
                  <div style={s.statLabel}>{stat.label}</div>
                  <div style={s.statSub}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Recent Applications */}
            <div style={s.section}>
              <h2 style={s.sectionTitle}>Recent applications</h2>
              <div style={s.table}>
                <div style={s.tableHeader}>
                  <span>Candidate</span>
                  <span>Position</span>
                  <span>Applied</span>
                  <span>Status</span>
                  <span>Action</span>
                </div>
                {applications.slice(0, 6).map(app => {
                  const av = avatarColor(app.candidate?.fullName)
                  const st = statusStyle(app.status)
                  return (
                    <div key={app.id} style={s.tableRow}>
                      <div style={s.candidateCell}>
                        <div style={{ ...s.avatar, background: av.bg, color: av.color }}>
                          {initials(app.candidate?.fullName)}
                        </div>
                        <div>
                          <div style={s.candidateName}>{app.candidate?.fullName || 'N/A'}</div>
                          <div style={s.candidateEmail}>{app.candidate?.email || ''}</div>
                        </div>
                      </div>
                      <span style={s.cellText}>{app.jobOffer?.title || 'N/A'}</span>
                      <span style={s.cellMuted}>{new Date(app.appliedAt).toLocaleDateString()}</span>
                      <span style={{ ...s.statusPill, background: st.bg, color: st.color }}>{app.status}</span>
                      <select
                        style={s.select}
                        value={app.status}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                      >
                        {['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].map(o => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div>
            {showJobForm && (
              <div style={s.formCard}>
                <h3 style={s.formTitle}>Create new job offer</h3>
                <form onSubmit={handleCreateJob}>
                  <div style={s.formGrid}>
                    <div style={s.formField}>
                      <label style={s.formLabel}>Job title *</label>
                      <input style={s.formInput} placeholder="e.g. Full-stack Developer" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required />
                    </div>
                    <div style={s.formField}>
                      <label style={s.formLabel}>Location</label>
                      <input style={s.formInput} placeholder="e.g. Tunis, Remote" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                    </div>
                    <div style={s.formField}>
                      <label style={s.formLabel}>Contract type</label>
                      <select style={s.formInput} value={newJob.contractType} onChange={e => setNewJob({ ...newJob, contractType: e.target.value })}>
                        {['CDI', 'CDD', 'Stage', 'Freelance'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div style={s.formField}>
                      <label style={s.formLabel}>Deadline *</label>
                      <input style={s.formInput} type="date" value={newJob.deadline} onChange={e => setNewJob({ ...newJob, deadline: e.target.value })} required />
                    </div>
                  </div>
                  <div style={s.formField}>
                    <label style={s.formLabel}>Description</label>
                    <textarea style={{ ...s.formInput, height: '80px', resize: 'vertical' }} placeholder="Describe the role..." value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button style={s.btnPrimary} type="submit">Create job offer</button>
                    <button style={s.btnSecondary} type="button" onClick={() => setShowJobForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div style={s.jobsGrid}>
              {jobs.map(job => (
                <div key={job.id} style={s.jobCard}>
                  <div style={s.jobCardTop}>
                    <div>
                      <div style={s.jobTitle}>{job.title}</div>
                      <div style={s.jobMeta}>
                        <span>📍 {job.location || 'N/A'}</span>
                        <span>📅 {job.deadline || 'N/A'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={s.contractBadge}>{job.contractType}</span>
                      <span style={{ ...s.statusPill, ...(job.status === 'OPEN' ? { background: '#d1fae5', color: '#065f46' } : { background: '#fee2e2', color: '#dc2626' }) }}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  {job.description && (
                    <p style={s.jobDesc}>{job.description.slice(0, 100)}{job.description.length > 100 ? '...' : ''}</p>
                  )}
                  <div style={s.jobCardFooter}>
                    <span style={s.jobApps}>
                      {applications.filter(a => a.jobOffer?.id === job.id).length} applications
                    </span>
                    <button style={s.btnDelete} onClick={() => handleDeleteJob(job.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <div style={s.section}>
            <div style={s.table}>
              <div style={{ ...s.tableHeader, gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>
                <span>Name</span>
                <span>Email</span>
                <span>Phone</span>
                <span>Applications</span>
              </div>
              {candidates.map(c => {
                const av = avatarColor(c.fullName)
                return (
                  <div key={c.id} style={{ ...s.tableRow, gridTemplateColumns: '2fr 2fr 1fr 1fr' }}>
                    <div style={s.candidateCell}>
                      <div style={{ ...s.avatar, background: av.bg, color: av.color }}>
                        {initials(c.fullName)}
                      </div>
                      <div style={s.candidateName}>{c.fullName}</div>
                    </div>
                    <span style={s.cellMuted}>{c.email}</span>
                    <span style={s.cellText}>{c.phone || '—'}</span>
                    <span style={s.cellText}>
                      {applications.filter(a => a.candidate?.id === c.id).length}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div style={s.section}>
            <div style={s.table}>
              <div style={s.tableHeader}>
                <span>Candidate</span>
                <span>Position</span>
                <span>Applied</span>
                <span>Status</span>
                <span>Update</span>
              </div>
              {applications.map(app => {
                const av = avatarColor(app.candidate?.fullName)
                const st = statusStyle(app.status)
                return (
                  <div key={app.id} style={s.tableRow}>
                    <div style={s.candidateCell}>
                      <div style={{ ...s.avatar, background: av.bg, color: av.color }}>
                        {initials(app.candidate?.fullName)}
                      </div>
                      <div>
                        <div style={s.candidateName}>{app.candidate?.fullName || 'N/A'}</div>
                        <div style={s.candidateEmail}>{app.candidate?.email || ''}</div>
                      </div>
                    </div>
                    <span style={s.cellText}>{app.jobOffer?.title || 'N/A'}</span>
                    <span style={s.cellMuted}>{new Date(app.appliedAt).toLocaleDateString()}</span>
                    <span style={{ ...s.statusPill, background: st.bg, color: st.color }}>{app.status}</span>
                    <select
                      style={s.select}
                      value={app.status}
                      onChange={e => handleStatusChange(app.id, e.target.value)}
                    >
                      {['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#f8fafc' },
  sidebar: { width: '240px', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', paddingLeft: '8px' },
  logoDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' },
  logoText: { fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '14px', cursor: 'pointer', textAlign: 'left', fontWeight: '400' },
  navItemActive: { background: '#ede9fe', color: '#6d28d9', fontWeight: '500' },
  navIcon: { fontSize: '16px' },
  sidebarFooter: { borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  userCard: { display: 'flex', alignItems: 'center', gap: '10px' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', flexShrink: 0 },
  userName: { fontSize: '13px', fontWeight: '500', color: '#1e293b' },
  userRole: { fontSize: '11px', color: '#64748b' },
  logoutBtn: { padding: '8px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '13px', cursor: 'pointer', width: '100%' },
  main: { flex: 1, padding: '32px 36px', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' },
  pageSubtitle: { fontSize: '14px', color: '#64748b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' },
  statCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' },
  statValue: { fontSize: '32px', fontWeight: '700', marginBottom: '4px' },
  statLabel: { fontSize: '13px', fontWeight: '500', color: '#1e293b', marginBottom: '2px' },
  statSub: { fontSize: '12px', color: '#64748b' },
  section: { background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', padding: '18px 20px', borderBottom: '1px solid #e2e8f0' },
  table: { width: '100%' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '12px 20px', background: '#f8fafc', fontSize: '12px', fontWeight: '500', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid #f1f5f9' },
  candidateCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 },
  candidateName: { fontSize: '13px', fontWeight: '500', color: '#1e293b' },
  candidateEmail: { fontSize: '11px', color: '#64748b' },
  cellText: { fontSize: '13px', color: '#374151' },
  cellMuted: { fontSize: '13px', color: '#64748b' },
  statusPill: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', width: 'fit-content' },
  select: { padding: '5px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#374151', background: '#fff', cursor: 'pointer' },
  btnPrimary: { padding: '9px 18px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  btnSecondary: { padding: '9px 18px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  btnDelete: { padding: '6px 12px', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  formCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  formTitle: { fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '18px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  formField: { display: 'flex', flexDirection: 'column', gap: '5px' },
  formLabel: { fontSize: '12px', fontWeight: '500', color: '#374151' },
  formInput: { padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box', width: '100%' },
  jobsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '16px' },
  jobCard: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' },
  jobCardTop: { display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' },
  jobTitle: { fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' },
  jobMeta: { display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' },
  contractBadge: { fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: '#ede9fe', color: '#6d28d9', fontWeight: '500' },
  jobDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '14px' },
  jobCardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' },
  jobApps: { fontSize: '12px', color: '#64748b' },
}