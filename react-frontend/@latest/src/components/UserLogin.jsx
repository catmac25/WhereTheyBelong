import React, { useState , useEffect} from "react";
import { useUserAuth } from "./UserAuthContext"; // ✅ import context
import {useSearchParams} from "react-router-dom";
const UserLogin = () => {
  const { login } = useUserAuth(); // ✅ use context login method
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };
  useEffect(() => {
    const token = searchParams.get("token");
    if (token && !localStorage.getItem("userToken")) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const name = payload.name || payload.email?.split("@")[0] || "User";
        const email = payload.email || "";
        login(token, { name, email });
        
      } catch (err) {
        console.error("Error decoding token:", err);
        setError("Invalid login token");
      }
    }
  }, []); // ✅ empty dependency array
  
  const handleShowPasswordToggle = () => setShowPassword((s) => !s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Replace with your real email/password API
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Login failed");
      }

      const { token, user } = await res.json();

      // ✅ call context login, automatically redirects to dashboard
      login(token, user || { name: form.email.split("@")[0] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.outer}>
      <form style={styles.form} onSubmit={handleSubmit} autoComplete="on">
        <h1 style={styles.heading}>Sign in to your account</h1>

        {/* ✅ Google Login */}
        <div style={styles.oauthButtonsGroup}>
          <a
            href="/api/auth/google"
            style={{ ...styles.oauthBtn, ...styles.googleBtn }}
            aria-label="Sign in with Google"
          >
            <span style={styles.oauthIcon}>
              <GoogleIconSVG />
            </span>
            Sign in with Google
          </a>
          <div style={styles.splitter}>or</div>
        </div>

        {/* Email */}
        <div style={styles.fieldGroup}>
          <label htmlFor="email" style={styles.label}>
            Email address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            autoComplete="username"
            required
            disabled={loading}
            placeholder="your@email.com"
          />
        </div>

        {/* Password */}
        <div style={styles.fieldGroup}>
          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              autoComplete="current-password"
              required
              disabled={loading}
              placeholder="Your password"
            />
            <button
              type="button"
              onClick={handleShowPasswordToggle}
              style={styles.toggleBtn}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

// ✅ Google logo SVG
function GoogleIconSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" style={{ verticalAlign: "middle" }}>
      <g>
        <path
          d="M19.6 10.23c0-.68-.06-1.36-.16-2H10v3.79h5.48a4.69 4.69 0 01-2.04 3.08v2.57h3.29c1.92-1.77 3.02-4.38 3.02-7.44z"
          fill="#4285F4"
        />
        <path
          d="M10 20c2.7 0 4.97-.9 6.63-2.45l-3.29-2.57c-.91.61-2.07.99-3.34.99-2.57 0-4.74-1.74-5.51-4.07H1.04v2.6A10 10 0 0010 20z"
          fill="#34A853"
        />
        <path
          d="M4.49 11.89A5.98 5.98 0 014.13 10c0-.66.11-1.3.31-1.89V5.5H1.04A9.96 9.96 0 000 10c0 1.56.37 3.04 1.04 4.36l3.45-2.47z"
          fill="#FBBC05"
        />
        <path
          d="M10 4.06c1.47 0 2.8.51 3.84 1.5l2.88-2.8C14.97 1.06 12.7 0 10 0A10 10 0 001.04 5.5l3.45 2.61C5.26 6.35 7.43 4.06 10 4.06z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}

// ✅ Inline styles (unchanged)
const styles = {
  outer: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f1f5ff 0%,#e6e7ee 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    background: "#fff",
    boxShadow: "0 6px 32px rgba(45,60,98,0.13)",
    padding: "2.5rem 2rem 2rem 2rem",
    borderRadius: "15px",
    minWidth: 340,
    maxWidth: 400,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.7rem",
  },
  heading: {
    fontFamily: "serif, Georgia, Times, 'Times New Roman'",
    fontWeight: 800,
    textAlign: "center",
    margin: 0,
    color: "#283174",
    fontSize: "1.7rem",
    letterSpacing: "0.6px",
  },
  oauthButtonsGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    marginBottom: 6,
  },
  oauthBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.55rem",
    background: "#fff",
    border: "1px solid #e2e6ee",
    borderRadius: "8px",
    color: "#1d2a53",
    fontWeight: "700",
    fontSize: "1.07rem",
    cursor: "pointer",
    padding: "12px",
    textDecoration: "none",
    outline: "none",
    transition: "background 0.15s, box-shadow 0.15s",
    boxShadow: "0 2px 9px rgba(45,60,98,0.06)",
  },
  googleBtn: {
    background: "#fff",
    borderColor: "#d1d5db",
    color: "#31354e",
    fontWeight: 700,
  },
  oauthIcon: {
    display: "inline-block",
    background: "#fff",
    borderRadius: "3px",
    padding: 1,
    marginRight: 4,
    lineHeight: 1,
    boxShadow: "rgb(222 226 238 / 25%) 1px 1px 2px",
  },
  splitter: {
    textAlign: "center",
    color: "#bfc3d7",
    textTransform: "uppercase",
    fontSize: "0.95rem",
    letterSpacing: "0.08em",
    fontWeight: 600,
    margin: "2px 0 2px 0",
    position: "relative",
    marginTop: "8px",
    marginBottom: "8px",
    userSelect: "none",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: ".30rem",
  },
  label: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#243457",
    marginBottom: "0.18rem",
  },
  input: {
    fontSize: "1rem",
    padding: "10px 12px",
    border: "1.1px solid #e5e7ee",
    borderRadius: "7px",
    outline: "none",
    background: "#f7fafc",
    color: "#1e2738",
    fontFamily: "inherit",
    transition: "border 0.18s",
  },
  passwordWrapper: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    marginLeft: "-2.2rem",
    cursor: "pointer",
    fontSize: "1.1rem",
    color: "#7b8794",
    outline: "none",
    position: "absolute",
    right: 6,
    top: 6,
    padding: 0,
    height: "28px",
    width: "28px",
    borderRadius: "50%",
  },
  error: {
    color: "#db1d27",
    background: "#fae1e1",
    padding: "10px",
    borderRadius: "7px",
    textAlign: "center",
    fontWeight: 600,
    marginTop: "-1rem",
    marginBottom: "0.5rem",
    fontSize: ".98rem",
  },
  button: {
    padding: "12px",
    background: "linear-gradient(92deg, #3847c1 0%, #697ffe 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "1.12rem",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(45,60,98,0.07)",
    transition: "background 0.15s, box-shadow 0.15s",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    background: "#bfc6e7",
  },
};

export default UserLogin;
