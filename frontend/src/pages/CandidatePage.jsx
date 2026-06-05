import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { createCandidate, applyToJob, uploadCV } from "../services/api"
import { useAuth } from "../context/AuthContext"

const T = { fontFamily: "'DM Sans', sans-serif" }
const SORA = { fontFamily: "'Sora', sans-serif" }

export default function CandidatePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logoutUser } = useAuth()

  const jobId = location.state?.jobId
  const jobTitle = location.state?.jobTitle

  const [form, setForm] = useState({ fullName: "", email: "", phone: "" })
  const [cvFile, setCvFile] = useState(null)
  const [cvError, setCvError] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setCvError("")
    if (!file) return
    if (file.type !== "application/pdf") {
      setCvError("Only PDF files are allowed")
      setCvFile(null)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setCvError("File size must be under 10MB")
      setCvFile(null)
      return
    }
    setCvFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const fakeEvent = { target: { files: [file] } }
      handleFileChange(fakeEvent)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cvFile) {
      setCvError("Please upload your CV")
      return
    }
    setLoading(true)
    setError("")

    try {
      // Step 1 — Create candidate
      const candidateRes = await createCandidate(form)
      const candidateId = candidateRes.data.id

      // Step 2 — Upload CV
      setUploadProgress(40)
      await uploadCV(candidateId, cvFile)
      setUploadProgress(70)

      // Step 3 — Submit application
      await applyToJob({ candidate: { id: candidateId }, jobOffer: { id: jobId } })
      setUploadProgress(100)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", ...T }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      `}</style>
      <div style={{ background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.6)", borderRadius: 20, padding: "52px 48px", maxWidth: 480, width: "100%", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #071828, #0a3d48)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "pop 0.5s ease 0.1s both" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="#4dd9c0" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 4L12 14.01l-3-3" stroke="#4dd9c0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f2033", letterSpacing: "-0.03em", marginBottom: 10, ...SORA }}>Application submitted!</h2>
        <p style={{ fontSize: 14, color: "#7a9ab5", lineHeight: 1.6, marginBottom: 8 }}>
          Your application for <strong style={{ color: "#2d4a62" }}>{jobTitle}</strong> has been received.
        </p>
        <p style={{ fontSize: 13, color: "#7a9ab5", marginBottom: 8 }}>Your CV has been uploaded successfully.</p>
        <p style={{ fontSize: 13, color: "#7a9ab5", marginBottom: 32 }}>The HR team will review your profile and get back to you.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => navigate("/jobs")} style={{ width: "100%", height: 48, background: "#1a4880", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, ...SORA }}>
            Browse more jobs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button onClick={() => { setSubmitted(false); setForm({ fullName: "", email: "", phone: "" }); setCvFile(null) }} style={{ width: "100%", height: 44, background: "transparent", color: "#7a9ab5", border: "1px solid #c8d8e8", borderRadius: 12, fontSize: 13, cursor: "pointer", ...T }}>
            Apply to another position
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "#eef2f7", ...T }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        input::placeholder { color: #9ab8d0; }
        .drop-zone:hover { border-color: rgba(77,217,192,0.5) !important; background: rgba(77,217,192,0.04) !important; }
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => navigate("/jobs")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", ...T }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to jobs
          </button>
          <button onClick={() => { logoutUser(); navigate("/login") }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.7)", fontSize: 13, cursor: "pointer", ...T }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px", animation: "fadeUp 0.5s ease" }}>

        {/* Job banner */}
        {jobTitle ? (
          <div style={{ background: "linear-gradient(135deg, #071828, #0b2d4a)", border: "1px solid rgba(77,217,192,0.2)", borderRadius: 16, padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(77,217,192,0.1)", border: "1px solid rgba(77,217,192,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="#4dd9c0" strokeWidth="1.8"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "rgba(77,217,192,0.7)", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>APPLYING FOR</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", ...SORA }}>{jobTitle}</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fef9ec", border: "1px solid #f5d878", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#92600a" strokeWidth="1.8"/>
              <path d="M12 9v4M12 17h.01" stroke="#92600a" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 13, color: "#92600a" }}>No job selected — go back and click Apply now on a position.</span>
          </div>
        )}

        {/* Form card */}
        <div style={{ background: "#f7f9fc", border: "1px solid rgba(200,220,240,0.6)", borderRadius: 20, padding: "36px 40px" }}>
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2033", letterSpacing: "-0.03em", marginBottom: 6, ...SORA }}>Your information</h1>
            <p style={{ fontSize: 13.5, color: "#7a9ab5" }}>Fill in your details and upload your CV to apply</p>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 20 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Full name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2d4a62", letterSpacing: "0.01em" }}>Full name</label>
              <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 10, transition: "box-shadow 0.2s", boxShadow: focusedField === "fullName" ? "0 0 0 2px #1e4a7a" : "0 0 0 1.5px #c8d8e8", padding: "0 14px", gap: 10, height: 50 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={focusedField === "fullName" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke={focusedField === "fullName" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8"/>
                </svg>
                <input type="text" placeholder="Ahmed Ben Ali" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} onFocus={() => setFocusedField("fullName")} onBlur={() => setFocusedField(null)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#1a3550", ...T }} required />
              </div>
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2d4a62", letterSpacing: "0.01em" }}>Email address</label>
              <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 10, transition: "box-shadow 0.2s", boxShadow: focusedField === "email" ? "0 0 0 2px #1e4a7a" : "0 0 0 1.5px #c8d8e8", padding: "0 14px", gap: 10, height: 50 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={focusedField === "email" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8"/>
                  <path d="M22 6l-10 7L2 6" stroke={focusedField === "email" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input type="email" placeholder="ahmed@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#1a3550", ...T }} required />
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2d4a62", letterSpacing: "0.01em" }}>Phone number</label>
              <div style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 10, transition: "box-shadow 0.2s", boxShadow: focusedField === "phone" ? "0 0 0 2px #1e4a7a" : "0 0 0 1.5px #c8d8e8", padding: "0 14px", gap: 10, height: 50 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke={focusedField === "phone" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8"/>
                </svg>
                <input type="text" placeholder="55 123 456" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#1a3550", ...T }} required />
              </div>
            </div>

            {/* CV Upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#2d4a62", letterSpacing: "0.01em" }}>
                CV / Resume <span style={{ color: "#dc2626" }}>*</span>
              </label>

              {!cvFile ? (
                <div
                  className="drop-zone"
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById("cv-input").click()}
                  style={{ border: `2px dashed ${cvError ? "#fca5a5" : "rgba(77,217,192,0.25)"}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: cvError ? "rgba(220,38,38,0.02)" : "rgba(77,217,192,0.02)", transition: "all 0.2s" }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, #071828, #0b2d4a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M17 8l-5-5-5 5M12 3v12" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#2d4a62", marginBottom: 4, ...SORA }}>Drop your CV here or click to browse</p>
                  <p style={{ fontSize: 12, color: "#7a9ab5" }}>PDF only — max 10MB</p>
                  <input id="cv-input" type="file" accept=".pdf" onChange={handleFileChange} style={{ display: "none" }} />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(77,217,192,0.06)", border: "1.5px solid rgba(77,217,192,0.25)", borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg, #071828, #0b2d4a)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#4dd9c0" strokeWidth="1.8"/>
                      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2033", marginBottom: 2, ...SORA, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cvFile.name}</div>
                    <div style={{ fontSize: 12, color: "#7a9ab5" }}>{(cvFile.size / 1024 / 1024).toFixed(2)} MB · PDF</div>
                  </div>
                  <button type="button" onClick={() => { setCvFile(null); setCvError("") }} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(220,38,38,0.08)", border: "1px solid #fca5a5", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              )}

              {cvError && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#dc2626" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="1.8"/>
                    <path d="M12 8v4M12 16h.01" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  {cvError}
                </div>
              )}
            </div>

            {/* Upload progress */}
            {loading && uploadProgress > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7a9ab5" }}>
                  <span>{uploadProgress < 40 ? "Creating profile..." : uploadProgress < 70 ? "Uploading CV..." : "Submitting application..."}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ height: 6, background: "#e2e8f0", borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg, #1a4880, #4dd9c0)", borderRadius: 20, transition: "width 0.4s ease" }} />
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{ display: "flex", gap: 10, padding: "14px 16px", background: "rgba(77,217,192,0.06)", border: "1px solid rgba(77,217,192,0.15)", borderRadius: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="#4dd9c0" strokeWidth="1.8"/>
                <path d="M12 8v4M12 16h.01" stroke="#4dd9c0" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: 12.5, color: "#7a9ab5", lineHeight: 1.6 }}>
                Your CV and information will only be used for recruitment purposes and shared with the HR team reviewing this position.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !jobId}
              style={{ width: "100%", height: 52, background: !jobId ? "#c8d8e8" : "#1a4880", color: !jobId ? "#7a9ab5" : "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !jobId ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.75 : 1, transition: "all 0.2s", ...SORA }}
              onMouseEnter={e => { if (!loading && jobId) e.currentTarget.style.background = "#163a62" }}
              onMouseLeave={e => { if (jobId) e.currentTarget.style.background = "#1a4880" }}
            >
              {loading ? (
                <><span style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /><span style={{ marginLeft: 10 }}>Submitting...</span></>
              ) : (
                <>Submit application <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}