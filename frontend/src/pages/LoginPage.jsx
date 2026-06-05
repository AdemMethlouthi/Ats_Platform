import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/api";
import { useAuth } from "../context/AuthContext";

// --- 3D Globe ---
function Globe() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const rotationRef = useRef({ x: 0.3, y: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef(null);

  const NUM_NODES = 42;
  const RADIUS = 110;
  const CONNECTION_DIST = 80;

  const nodes = useRef((() => {
    const pts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < NUM_NODES; i++) {
      const y = 1 - (i / (NUM_NODES - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      pts.push({
        x: Math.cos(theta) * r, y, z: Math.sin(theta) * r,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
      });
    }
    return pts;
  })()).current;

  const project = useCallback((x, y, z, cx, cy) => {
    const fov = 360;
    const depth = fov / (fov + z * RADIUS + RADIUS * 1.2);
    return { sx: cx + x * RADIUS * depth, sy: cy + y * RADIUS * depth, depth, z };
  }, []);

  const rotatePoint = useCallback((x, y, z, rx, ry) => {
    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    let nx = x * cosY + z * sinY;
    let nz = -x * sinY + z * cosY;
    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    let ny = y * cosX - nz * sinX;
    nz = y * sinX + nz * cosX;
    return { x: nx, y: ny, z: nz };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.004;
        rotationRef.current.x += 0.0004;
      }

      const { x: rx, y: ry } = rotationRef.current;
      const cx = w / 2, cy = h / 2;

      const projected = nodes.map((n) => {
        const r = rotatePoint(n.x, n.y, n.z, rx, ry);
        const p = project(r.x, r.y, r.z, cx, cy);
        n.pulsePhase += n.pulseSpeed;
        return { ...p, pulse: (Math.sin(n.pulsePhase) + 1) / 2 };
      });
      const sorted = [...projected].sort((a, b) => a.z - b.z);

      const globeGrad = ctx.createRadialGradient(cx - 20, cy - 24, 10, cx, cy, RADIUS * 1.15);
      globeGrad.addColorStop(0, "rgba(77,217,192,0.06)");
      globeGrad.addColorStop(1, "rgba(77,217,192,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, RADIUS * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "#4dd9c0";
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        ctx.beginPath();
        let first = true;
        for (let lon = 0; lon <= 360; lon += 5) {
          const lonRad = (lon * Math.PI) / 180;
          const r = rotatePoint(Math.cos(latRad) * Math.cos(lonRad), Math.sin(latRad), Math.cos(latRad) * Math.sin(lonRad), rx, ry);
          const p = project(r.x, r.y, r.z, cx, cy);
          first ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy);
          first = false;
        }
        ctx.stroke();
      }
      for (let lon = 0; lon < 360; lon += 30) {
        const lonRad = (lon * Math.PI) / 180;
        ctx.beginPath();
        let first = true;
        for (let lat = -90; lat <= 90; lat += 5) {
          const latRad = (lat * Math.PI) / 180;
          const r = rotatePoint(Math.cos(latRad) * Math.cos(lonRad), Math.sin(latRad), Math.cos(latRad) * Math.sin(lonRad), rx, ry);
          const p = project(r.x, r.y, r.z, cx, cy);
          first ? ctx.moveTo(p.sx, p.sy) : ctx.lineTo(p.sx, p.sy);
          first = false;
        }
        ctx.stroke();
      }
      ctx.restore();

      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const a = sorted[i], b = sorted[j];
          const dist = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (dist < CONNECTION_DIST) {
            const avgDepth = (a.depth + b.depth) / 2;
            const alpha = (1 - dist / CONNECTION_DIST) * avgDepth * 0.6;
            const backSide = (a.z + b.z) / 2 < -0.1;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.strokeStyle = backSide ? `rgba(30,160,140,${alpha * 0.3})` : `rgba(77,217,192,${alpha})`;
            ctx.lineWidth = avgDepth * 1.2;
            ctx.stroke();
          }
        }
      }

      for (const p of sorted) {
        const isBack = p.z < -0.05;
        const size = p.depth * (3 + p.pulse * 2.5);
        if (!isBack) {
          const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, size * 4);
          glow.addColorStop(0, `rgba(77,217,192,${0.28 * p.depth})`);
          glow.addColorStop(1, "rgba(77,217,192,0)");
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, size * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fillStyle = isBack
          ? `rgba(30,160,140,0.3)`
          : `rgba(${77 + p.pulse * 50},${217 + p.pulse * 30},${192 + p.pulse * 40},0.9)`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, [project, rotatePoint, nodes]);

  const onMouseDown = (e) => { isDraggingRef.current = true; lastMouseRef.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    rotationRef.current.y += (e.clientX - lastMouseRef.current.x) * 0.007;
    rotationRef.current.x += (e.clientY - lastMouseRef.current.y) * 0.007;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { isDraggingRef.current = false; };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ width: "100%", height: "100%", cursor: "grab", display: "block" }}
    />
  );
}

// --- Main Login Page ---
export default function LoginPage() {
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", role: "CANDIDATE" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [mounted, setMounted] = useState(false)

  const { loginUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { setMounted(true) }, [])

  const switchMode = (newMode) => {
    setMode(newMode)
    setError("")
    setSuccess("")
    setForm({ username: "", password: "", confirmPassword: "", role: "CANDIDATE" })
    setShowPassword(false)
    setShowConfirm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (mode === "register") {
      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match")
        setLoading(false)
        return
      }
      try {
        await register({ username: form.username, password: form.password, role: form.role })
        setSuccess("Account created! You can now sign in.")
        switchMode("login")
        setForm(prev => ({ ...prev, username: form.username }))
      } catch (err) {
        setError(err.response?.data?.error || "Username already exists")
      } finally {
        setLoading(false)
      }
    } else {
      try {
        const res = await login({ username: form.username, password: form.password })
        loginUser(res.data)
        navigate(res.data.role === "HR" ? "/dashboard" : "/jobs")
      } catch {
        setError("Invalid username or password")
        setLoading(false)
      }
    }
  }

  return (
    <div style={styles.root}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={{ ...styles.globeWrapper, opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.1s" }}>
          <Globe />
          <p style={styles.dragHint}>✦ Drag to rotate</p>
        </div>

        <div style={{ ...styles.leftContent, opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(16px)", transition: "all 0.8s ease 0.3s" }}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={styles.logoText}>ATS Platform</span>
          </div>

          <div style={styles.headline}>
            <h1 style={styles.headlineText}>Hire smarter,<br />not harder.</h1>
            <p style={styles.subtext}>Manage job offers, track candidates,<br />and streamline your recruitment process.</p>
          </div>

          <ul style={styles.featureList}>
            {["Post & manage job offers", "Track applications in real-time", "Role-based access for HR teams"].map((item, i) => (
              <li key={i} style={styles.featureItem}>
                <span style={styles.featureDot} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={{ ...styles.card, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(24px)", transition: "all 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s" }}>

          {/* Mode tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>
            <button
              style={{ ...styles.tab, ...(mode === "register" ? styles.tabActive : {}) }}
              onClick={() => switchMode("register")}
            >
              Create account
            </button>
          </div>

          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>{mode === "login" ? "Welcome back" : "Get started"}</h2>
            <p style={styles.cardSubtitle}>{mode === "login" ? "Sign in to your account" : "Create your free account"}</p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="1.8" />
                <path d="M12 8v4M12 16h.01" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.successBanner}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="#15803d" strokeWidth="1.8" />
                <path d="M8 12l3 3 5-5" stroke="#15803d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>

            {/* Username */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username</label>
              <div style={{ ...styles.inputWrapper, boxShadow: focusedField === "username" ? "0 0 0 2px #1e4a7a" : "0 0 0 1.5px #c8d8e8" }}>
                <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={focusedField === "username" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="7" r="4" stroke={focusedField === "username" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={{ ...styles.inputWrapper, boxShadow: focusedField === "password" ? "0 0 0 2px #1e4a7a" : "0 0 0 1.5px #c8d8e8" }}>
                <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke={focusedField === "password" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={focusedField === "password" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={styles.input}
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} tabIndex={-1}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="#7a9ab5" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="#7a9ab5" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="#7a9ab5" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#7a9ab5" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="3" stroke="#7a9ab5" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Register-only fields */}
            {mode === "register" && (
              <>
                {/* Confirm password */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Confirm password</label>
                  <div style={{ ...styles.inputWrapper, boxShadow: focusedField === "confirm" ? "0 0 0 2px #1e4a7a" : "0 0 0 1.5px #c8d8e8" }}>
                    <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke={focusedField === "confirm" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={focusedField === "confirm" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      onFocus={() => setFocusedField("confirm")}
                      onBlur={() => setFocusedField(null)}
                      style={styles.input}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn} tabIndex={-1}>
                      {showConfirm ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="#7a9ab5" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="#7a9ab5" strokeWidth="1.8" strokeLinecap="round" />
                          <line x1="1" y1="1" x2="23" y2="23" stroke="#7a9ab5" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#7a9ab5" strokeWidth="1.8" />
                          <circle cx="12" cy="12" r="3" stroke="#7a9ab5" strokeWidth="1.8" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Role selector */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>I am registering as</label>
                  <div style={styles.roleGrid}>
                    <button
                      type="button"
                      style={{ ...styles.roleBtn, ...(form.role === "CANDIDATE" ? styles.roleBtnActive : {}) }}
                      onClick={() => setForm({ ...form, role: "CANDIDATE" })}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={form.role === "CANDIDATE" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="12" cy="7" r="4" stroke={form.role === "CANDIDATE" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" />
                      </svg>
                      <div>
                        <div style={{ ...styles.roleName, color: form.role === "CANDIDATE" ? "#0f2033" : "#7a9ab5" }}>Candidate</div>
                        <div style={styles.roleDesc}>Browse & apply to jobs</div>
                      </div>
                      {form.role === "CANDIDATE" && <div style={styles.roleCheck}>✓</div>}
                    </button>

                    <button
                      type="button"
                      style={{ ...styles.roleBtn, ...(form.role === "HR" ? styles.roleBtnActive : {}) }}
                      onClick={() => setForm({ ...form, role: "HR" })}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="7" width="20" height="14" rx="2" stroke={form.role === "HR" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" />
                        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke={form.role === "HR" ? "#1e4a7a" : "#7a9ab5"} strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      <div>
                        <div style={{ ...styles.roleName, color: form.role === "HR" ? "#0f2033" : "#7a9ab5" }}>HR Manager</div>
                        <div style={styles.roleDesc}>Post & manage jobs</div>
                      </div>
                      {form.role === "HR" && <div style={styles.roleCheck}>✓</div>}
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ ...styles.signInBtn, opacity: loading ? 0.75 : 1, transform: loading ? "scale(0.98)" : "scale(1)" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#163a62" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1a4880" }}
            >
              {loading ? (
                <><span style={styles.spinner} /><span style={{ marginLeft: 10 }}>{mode === "login" ? "Signing in..." : "Creating account..."}</span></>
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={styles.switchText}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span style={styles.switchLink} onClick={() => switchMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Create one" : "Sign in"}
            </span>
          </p>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #9ab8d0; }
      `}</style>
    </div>
  )
}

const styles = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f0f4f8" },
  leftPanel: { flex: "0 0 48%", background: "linear-gradient(160deg, #071828 0%, #0b2d4a 45%, #0a3d48 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 48px 44px", gap: "8px", overflow: "hidden" },
  globeWrapper: { width: "100%", height: "280px", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" },
  dragHint: { fontSize: 10, color: "rgba(77,217,192,0.4)", letterSpacing: "0.06em", fontWeight: 500, marginTop: 4, textAlign: "center" },
  leftContent: { width: "100%", display: "flex", flexDirection: "column", gap: "22px" },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { width: 34, height: 34, background: "rgba(255,255,255,0.12)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.18)" },
  logoText: { color: "#fff", fontSize: "15px", fontWeight: 600, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.01em" },
  headline: { display: "flex", flexDirection: "column", gap: "10px" },
  headlineText: { fontFamily: "'Sora', sans-serif", fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 800, color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.03em" },
  subtext: { color: "rgba(255,255,255,0.58)", fontSize: "13.5px", lineHeight: 1.65, fontWeight: 400 },
  featureList: { listStyle: "none", display: "flex", flexDirection: "column", gap: "9px" },
  featureItem: { display: "flex", alignItems: "center", gap: "10px", color: "rgba(255,255,255,0.78)", fontSize: "13.5px", fontWeight: 500 },
  featureDot: { width: 7, height: 7, borderRadius: "50%", background: "#4dd9c0", flexShrink: 0, boxShadow: "0 0 8px #4dd9c0" },
  rightPanel: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#eef2f7", padding: "48px 40px" },
  card: { background: "#f7f9fc", borderRadius: 20, padding: "36px 40px", width: "100%", maxWidth: 420, boxShadow: "0 4px 32px rgba(20,60,100,0.10), 0 1px 4px rgba(20,60,100,0.07)", border: "1px solid rgba(200,220,240,0.6)" },
  tabs: { display: "flex", background: "#e8eef5", borderRadius: 10, padding: "4px", marginBottom: "24px" },
  tab: { flex: 1, padding: "8px", border: "none", background: "transparent", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#7a9ab5", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  tabActive: { background: "#fff", color: "#0f2033", boxShadow: "0 1px 4px rgba(20,60,100,0.12)" },
  cardHeader: { marginBottom: 20 },
  cardTitle: { fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: "#0f2033", letterSpacing: "-0.03em", marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: "#7a9ab5", fontWeight: 400 },
  errorBanner: { display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 },
  successBanner: { display: "flex", alignItems: "center", gap: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: 13, fontWeight: 600, color: "#2d4a62", letterSpacing: "0.01em" },
  inputWrapper: { display: "flex", alignItems: "center", background: "#ffffff", borderRadius: 10, transition: "box-shadow 0.2s ease", padding: "0 14px", gap: 10, height: 48 },
  inputIcon: { flexShrink: 0 },
  input: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "#1a3550", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", opacity: 0.7 },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  roleBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "12px", border: "1.5px solid #dde6ef", borderRadius: 10, background: "#fff", cursor: "pointer", textAlign: "left", position: "relative", transition: "border-color 0.2s" },
  roleBtnActive: { borderColor: "#1e4a7a", background: "#f0f6ff" },
  roleName: { fontSize: 13, fontWeight: 600, marginBottom: 2 },
  roleDesc: { fontSize: 11, color: "#9ab8d0" },
  roleCheck: { position: "absolute", top: 8, right: 10, fontSize: 12, color: "#1e4a7a", fontWeight: 700 },
  signInBtn: { width: "100%", height: 50, background: "#1a4880", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, fontFamily: "'Sora', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s, transform 0.15s, opacity 0.15s", letterSpacing: "0.01em", marginTop: 4 },
  spinner: { width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.3)", borderTop: "2.5px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 },
  switchText: { textAlign: "center", fontSize: 13, color: "#7a9ab5", marginTop: 18 },
  switchLink: { color: "#1a6bbd", fontWeight: 500, cursor: "pointer" },
}