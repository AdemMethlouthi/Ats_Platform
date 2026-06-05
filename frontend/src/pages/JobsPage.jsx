import { useState, useEffect } from "react"
import { getOpenJobs } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const T = { fontFamily: "'DM Sans', sans-serif" }
const SORA = { fontFamily: "'Sora', sans-serif" }

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [mounted, setMounted] = useState(false)
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
    getOpenJobs()
      .then(res => { setJobs(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.location || "").toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "ALL" || j.contractType === filter
    return matchSearch && matchFilter
  })

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f7", ...T }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #9ab8d0; }
        .job-card:hover { border-color: rgba(77,217,192,0.4) !important; transform: translateY(-2px); }
        .apply-btn:hover { background: #163a62 !important; }
        .filter-btn:hover { background: rgba(77,217,192,0.08) !important; }
      `}</style>

      {/* Navbar */}
      <div style={{ background: "linear-gradient(160deg, #071828 0%, #0b2d4a 60%, #0a3d48 100%)", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600, ...SORA, letterSpacing: "-0.01em" }}>ATS Platform</span>
        </div>

        <div style={{ flex: 1, maxWidth: 420, margin: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "0 14px", height: 40 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8"/>
              <path d="M21 21l-4.35-4.35" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs, locations..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: "#fff", ...T }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(77,217,192,0.1)", border: "1px solid rgba(77,217,192,0.2)", borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dd9c0" }} />
            <span style={{ fontSize: 13, color: "#4dd9c0", fontWeight: 500 }}>{user?.username}</span>
          </div>
          <button onClick={() => { logoutUser(); navigate("/login") }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", ...T }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #071828 0%, #0b2d4a 60%, #0a3d48 100%)", padding: "48px 40px 56px", textAlign: "center", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(10px)", transition: "all 0.6s ease" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "rgba(77,217,192,0.12)", border: "1px solid rgba(77,217,192,0.25)", borderRadius: 20, marginBottom: 18 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4dd9c0" }} />
          <span style={{ fontSize: 12, color: "#4dd9c0", fontWeight: 600, letterSpacing: "0.04em" }}>{jobs.length} OPEN POSITIONS</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 14, ...SORA }}>
          Find your next<br />opportunity
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", marginBottom: 32 }}>
          Browse open positions and apply with one click
        </p>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["ALL", "CDI", "CDD", "Stage", "Freelance"].map(f => (
            <button key={f} className="filter-btn" onClick={() => setFilter(f)} style={{ padding: "7px 18px", borderRadius: 20, border: `1px solid ${filter === f ? "#4dd9c0" : "rgba(255,255,255,0.15)"}`, background: filter === f ? "rgba(77,217,192,0.15)" : "transparent", color: filter === f ? "#4dd9c0" : "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer", fontWeight: filter === f ? 600 : 400, transition: "all 0.15s", ...T }}>
              {f === "ALL" ? "All types" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "36px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 44, height: 44, border: "3px solid rgba(77,217,192,0.2)", borderTop: "3px solid #4dd9c0", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ color: "#7a9ab5", fontSize: 14, ...T }}>Loading positions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f2033", marginBottom: 8, ...SORA }}>No positions found</h3>
            <p style={{ fontSize: 14, color: "#7a9ab5" }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 13.5, color: "#7a9ab5", ...T }}>
                Showing <strong style={{ color: "#0f2033" }}>{filtered.length}</strong> position{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 18 }}>
              {filtered.map((job, i) => (
                <div key={job.id} className="job-card" style={{ background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.7)", borderRadius: 16, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14, cursor: "default", transition: "all 0.2s ease", animation: `fadeUp 0.4s ease ${i * 0.05}s both` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg, #071828, #0b2d4a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#4dd9c0", ...SORA }}>
                      {job.title.charAt(0)}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" }}>{job.contractType}</span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2033", marginBottom: 8, ...SORA }}>{job.title}</h3>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      {job.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#7a9ab5" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
                          {job.location}
                        </div>
                      )}
                      {job.deadline && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#7a9ab5" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                          {job.deadline}
                        </div>
                      )}
                    </div>
                  </div>

                  {job.description && (
                    <p style={{ fontSize: 13, color: "#7a9ab5", lineHeight: 1.6, flex: 1 }}>
                      {job.description.slice(0, 110)}{job.description.length > 110 ? "..." : ""}
                    </p>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid rgba(200,220,240,0.5)", marginTop: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#15803d", fontWeight: 500 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dd9c0" }} />
                      Open
                    </div>
                    <button className="apply-btn" onClick={() => navigate("/apply", { state: { jobId: job.id, jobTitle: job.title } })} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", background: "#1a4880", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s", ...SORA }}>
                      Apply now
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}