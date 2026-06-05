import { useState, useEffect } from "react"
import { getJobs, getCandidates, getApplications, updateStatus, createJob, deleteJob } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const T = { fontFamily: "'DM Sans', sans-serif" }
const SORA = { fontFamily: "'Sora', sans-serif" }

const statusColors = {
  PENDING:  { bg: "#fef9ec", border: "#f5d878", color: "#92600a" },
  REVIEWED: { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" },
  ACCEPTED: { bg: "#f0fdf4", border: "#6ee7b7", color: "#15803d" },
  REJECTED: { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626" },
}
const handleDownloadCV = async (candidateId, fullName) => {
  try {
    const res = await downloadCV(candidateId)
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `CV_${fullName.replace(" ", "_")}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error("Download failed", e)
  }
}

function Avatar({ name, size = 36 }) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??"
  const palettes = [
    { bg: "#e0f2fe", color: "#0369a1" },
    { bg: "#ede9fe", color: "#6d28d9" },
    { bg: "#d1fae5", color: "#065f46" },
    { bg: "#fce7f3", color: "#9d174d" },
    { bg: "#fef3c7", color: "#92400e" },
    { bg: "#f0fdf4", color: "#15803d" },
  ]
  const p = palettes[(name?.charCodeAt(0) || 0) % palettes.length]
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: p.bg, color: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, ...SORA }}>
      {initials}
    </div>
  )
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{ background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.6)", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 13, color: "#7a9ab5", fontWeight: 500, ...T }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #0b2d4a, #0a3d48)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#0f2033", lineHeight: 1, ...SORA }}>{value}</div>
      <div style={{ fontSize: 12, color: "#4dd9c0", fontWeight: 500, ...T }}>{sub}</div>
    </div>
  )
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [applications, setApplications] = useState([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showJobForm, setShowJobForm] = useState(false)
  const [newJob, setNewJob] = useState({ title: "", description: "", location: "", contractType: "CDI", deadline: "", status: "OPEN" })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { setMounted(true); fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [j, c, a] = await Promise.all([getJobs(), getCandidates(), getApplications()])
      setJobs(j.data); setCandidates(c.data); setApplications(a.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleStatusChange = async (id, status) => {
    try { await updateStatus(id, status); fetchAll() } catch (e) { console.error(e) }
  }

  const handleCreateJob = async (e) => {
    e.preventDefault()
    try { await createJob(newJob); setShowJobForm(false); setNewJob({ title: "", description: "", location: "", contractType: "CDI", deadline: "", status: "OPEN" }); fetchAll() }
    catch (e) { console.error(e) }
  }

  const handleDeleteJob = async (id) => {
    if (window.confirm("Delete this job offer?")) { await deleteJob(id); fetchAll() }
  }

  const acceptanceRate = applications.length > 0
    ? Math.round((applications.filter(a => a.status === "ACCEPTED").length / applications.length) * 100) : 0

  const tabs = [
    { id: "overview", label: "Overview", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/></svg> },
    { id: "jobs", label: "Job offers", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { id: "candidates", label: "Candidates", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
    { id: "applications", label: "Applications", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  ]

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#eef2f7" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "3px solid rgba(77,217,192,0.2)", borderTop: "3px solid #4dd9c0", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ color: "#7a9ab5", fontSize: 14, ...T }}>Loading dashboard...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#eef2f7", ...T }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        select { font-family: 'DM Sans', sans-serif; }
        input, textarea { font-family: 'DM Sans', sans-serif; }
        input::placeholder, textarea::placeholder { color: #9ab8d0; }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 240, background: "linear-gradient(160deg, #071828 0%, #0b2d4a 60%, #0a3d48 100%)", display: "flex", flexDirection: "column", padding: "28px 16px", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 8, marginBottom: 36 }}>
          <div style={{ width: 34, height: 34, background: "rgba(255,255,255,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, ...SORA, letterSpacing: "-0.01em" }}>ATS Platform</span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", background: activeTab === tab.id ? "rgba(77,217,192,0.12)" : "transparent", color: activeTab === tab.id ? "#4dd9c0" : "rgba(255,255,255,0.55)", fontSize: 13.5, fontWeight: activeTab === tab.id ? 600 : 400, cursor: "pointer", textAlign: "left", transition: "all 0.15s", ...T }}>
              <span style={{ color: activeTab === tab.id ? "#4dd9c0" : "rgba(255,255,255,0.4)" }}>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#4dd9c0" }} />}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar name={user?.username} size={36} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", ...SORA }}>{user?.username}</div>
              <div style={{ fontSize: 11, color: "#4dd9c0" }}>HR Manager</div>
            </div>
          </div>
          <button onClick={() => { logoutUser(); navigate("/login") }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", ...T }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(8px)", transition: "all 0.5s ease" }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f2033", letterSpacing: "-0.03em", marginBottom: 4, ...SORA }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <p style={{ fontSize: 13.5, color: "#7a9ab5" }}>
              {activeTab === "overview" && "Your recruitment pipeline at a glance"}
              {activeTab === "jobs" && `${jobs.length} total positions — ${jobs.filter(j => j.status === "OPEN").length} open`}
              {activeTab === "candidates" && `${candidates.length} registered candidates`}
              {activeTab === "applications" && `${applications.length} total applications`}
            </p>
          </div>
          {activeTab === "jobs" && (
            <button onClick={() => setShowJobForm(!showJobForm)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: showJobForm ? "rgba(220,38,38,0.08)" : "linear-gradient(135deg, #0b2d4a, #0a3d48)", color: showJobForm ? "#dc2626" : "#4dd9c0", border: showJobForm ? "1px solid #fca5a5" : "1px solid rgba(77,217,192,0.3)", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer", ...T }}>
              {showJobForm ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Cancel</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> Add job offer</>
              )}
            </button>
          )}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard label="Total jobs" value={jobs.length} sub={`${jobs.filter(j => j.status === "OPEN").length} open positions`} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="#4dd9c0" strokeWidth="1.8"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/></svg>} />
              <StatCard label="Candidates" value={candidates.length} sub="registered profiles" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="#4dd9c0" strokeWidth="1.8"/></svg>} />
              <StatCard label="Applications" value={applications.length} sub="total submitted" icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#4dd9c0" strokeWidth="1.8"/><path d="M14 2v6h6" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/></svg>} />
              <StatCard label="Acceptance rate" value={`${acceptanceRate}%`} sub={`${applications.filter(a => a.status === "ACCEPTED").length} accepted`} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/><path d="M22 4L12 14.01l-3-3" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>} />
            </div>

            <div style={{ background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.6)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(200,220,240,0.5)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f2033", ...SORA }}>Recent applications</span>
                <span style={{ fontSize: 12, color: "#7a9ab5" }}>{applications.length} total</span>
              </div>
              {applications.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#7a9ab5", fontSize: 14 }}>No applications yet</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f0f4f8" }}>
                      {["Candidate", "Position", "Applied on", "Status", "Update"].map(h => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a9ab5", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 8).map((app, i) => {
                      const st = statusColors[app.status] || statusColors.PENDING
                      return (
                        <tr key={app.id} style={{ borderTop: "1px solid rgba(200,220,240,0.4)", background: i % 2 === 0 ? "transparent" : "rgba(240,244,248,0.3)" }}>
                          <td style={{ padding: "12px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <Avatar name={app.candidate?.fullName} size={32} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2033", ...SORA }}>{app.candidate?.fullName || "N/A"}</div>
                                <div style={{ fontSize: 11, color: "#7a9ab5" }}>{app.candidate?.email || ""}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 20px", fontSize: 13, color: "#2d4a62" }}>{app.jobOffer?.title || "N/A"}</td>
                          <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a9ab5" }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                          <td style={{ padding: "12px 20px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{app.status}</span>
                          </td>
                          <td style={{ padding: "12px 20px" }}>
                            <select value={app.status} onChange={e => handleStatusChange(app.id, e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #c8d8e8", fontSize: 12, color: "#2d4a62", background: "#fff", cursor: "pointer", outline: "none" }}>
                              {["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"].map(o => <option key={o}>{o}</option>)}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* JOBS */}
        {activeTab === "jobs" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {showJobForm && (
              <div style={{ background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.6)", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f2033", marginBottom: 20, ...SORA }}>Create new job offer</h3>
                <form onSubmit={handleCreateJob}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    {[
                      { label: "Job title *", key: "title", placeholder: "e.g. Full-stack Developer" },
                      { label: "Location", key: "location", placeholder: "e.g. Tunis, Remote" },
                    ].map(f => (
                      <div key={f.key}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#2d4a62", display: "block", marginBottom: 6, letterSpacing: "0.01em" }}>{f.label}</label>
                        <input value={newJob[f.key]} onChange={e => setNewJob({ ...newJob, [f.key]: e.target.value })} placeholder={f.placeholder} required={f.key === "title"} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #c8d8e8", borderRadius: 10, fontSize: 13, color: "#1a3550", background: "#fff", outline: "none" }} />
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#2d4a62", display: "block", marginBottom: 6, letterSpacing: "0.01em" }}>Contract type</label>
                      <select value={newJob.contractType} onChange={e => setNewJob({ ...newJob, contractType: e.target.value })} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #c8d8e8", borderRadius: 10, fontSize: 13, color: "#1a3550", background: "#fff", outline: "none" }}>
                        {["CDI", "CDD", "Stage", "Freelance"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#2d4a62", display: "block", marginBottom: 6, letterSpacing: "0.01em" }}>Deadline *</label>
                      <input type="date" value={newJob.deadline} onChange={e => setNewJob({ ...newJob, deadline: e.target.value })} required style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #c8d8e8", borderRadius: 10, fontSize: 13, color: "#1a3550", background: "#fff", outline: "none" }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#2d4a62", display: "block", marginBottom: 6, letterSpacing: "0.01em" }}>Description</label>
                    <textarea value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} placeholder="Describe the role and requirements..." rows={3} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #c8d8e8", borderRadius: 10, fontSize: 13, color: "#1a3550", background: "#fff", outline: "none", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" style={{ padding: "10px 22px", background: "linear-gradient(135deg, #0b2d4a, #0a3d48)", color: "#4dd9c0", border: "1px solid rgba(77,217,192,0.3)", borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: "pointer", ...T }}>Create job offer</button>
                    <button type="button" onClick={() => setShowJobForm(false)} style={{ padding: "10px 18px", background: "transparent", color: "#7a9ab5", border: "1px solid #c8d8e8", borderRadius: 10, fontSize: 13, cursor: "pointer", ...T }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {jobs.map(job => (
                <div key={job.id} style={{ background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.6)", borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, #071828, #0b2d4a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#4dd9c0", ...SORA }}>{job.title.charAt(0)}</div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>{job.contractType}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 20, ...(job.status === "OPEN" ? { background: "#f0fdf4", color: "#15803d", border: "1px solid #6ee7b7" } : { background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5" }) }}>{job.status}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f2033", marginBottom: 6, ...SORA }}>{job.title}</div>
                    <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#7a9ab5" }}>
                      {job.location && <span>📍 {job.location}</span>}
                      {job.deadline && <span>📅 {job.deadline}</span>}
                    </div>
                  </div>
                  {job.description && <p style={{ fontSize: 12.5, color: "#7a9ab5", lineHeight: 1.6 }}>{job.description.slice(0, 100)}{job.description.length > 100 ? "..." : ""}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid rgba(200,220,240,0.5)" }}>
                    <span style={{ fontSize: 12, color: "#7a9ab5" }}>{applications.filter(a => a.jobOffer?.id === job.id).length} applications</span>
                    <button onClick={() => handleDeleteJob(job.id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "rgba(220,38,38,0.06)", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 12, cursor: "pointer", ...T }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CANDIDATES */}
        {activeTab === "candidates" && (
          <div style={{ animation: "fadeUp 0.4s ease", background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.6)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(200,220,240,0.5)" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f2033", ...SORA }}>{candidates.length} candidates registered</span>
            </div>
            {candidates.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#7a9ab5", fontSize: 14 }}>No candidates yet</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f0f4f8" }}>
                    {["Name", "Email", "Phone", "Applications"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a9ab5", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => (
                    <tr key={c.id} style={{ borderTop: "1px solid rgba(200,220,240,0.4)", background: i % 2 === 0 ? "transparent" : "rgba(240,244,248,0.3)" }}>
                      <td style={{ padding: "12px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={c.fullName} size={32} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f2033", ...SORA }}>{c.fullName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 20px", fontSize: 13, color: "#7a9ab5" }}>{c.email}</td>
                      <td style={{ padding: "12px 20px", fontSize: 13, color: "#2d4a62" }}>{c.phone || "—"}</td>
                     <td style={{ padding: "12px 20px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>
      {applications.filter(a => a.candidate?.id === c.id).length} apps
    </span>
    {c.cvPath && (
      <button
        onClick={() => handleDownloadCV(c.id, c.fullName)}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(77,217,192,0.08)", border: "1px solid rgba(77,217,192,0.25)", borderRadius: 8, color: "#0a3d48", fontSize: 12, cursor: "pointer", fontWeight: 500 }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M7 10l5 5 5-5M12 15V3" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        CV
      </button>
    )}
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* APPLICATIONS */}
        {activeTab === "applications" && (
          <div style={{ animation: "fadeUp 0.4s ease", background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.6)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(200,220,240,0.5)" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f2033", ...SORA }}>{applications.length} total applications</span>
            </div>
            {applications.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#7a9ab5", fontSize: 14 }}>No applications yet</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f0f4f8" }}>
                    {["Candidate", "Position", "Applied on", "Status", "Update"].map(h => (
                      <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#7a9ab5", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => {
                    const st = statusColors[app.status] || statusColors.PENDING
                    return (
                      <tr key={app.id} style={{ borderTop: "1px solid rgba(200,220,240,0.4)", background: i % 2 === 0 ? "transparent" : "rgba(240,244,248,0.3)" }}>
                        <td style={{ padding: "12px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar name={app.candidate?.fullName} size={32} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2033", ...SORA }}>{app.candidate?.fullName || "N/A"}</div>
                              <div style={{ fontSize: 11, color: "#7a9ab5" }}>{app.candidate?.email || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 20px", fontSize: 13, color: "#2d4a62" }}>{app.jobOffer?.title || "N/A"}</td>
                        <td style={{ padding: "12px 20px", fontSize: 12, color: "#7a9ab5" }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                        <td style={{ padding: "12px 20px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{app.status}</span>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <select value={app.status} onChange={e => handleStatusChange(app.id, e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #c8d8e8", fontSize: 12, color: "#2d4a62", background: "#fff", cursor: "pointer", outline: "none" }}>
                            {["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  )
}