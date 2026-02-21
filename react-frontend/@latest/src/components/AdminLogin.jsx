import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext.jsx";
export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const user = "arpita2503";
  const email = "crysmocatty15@gmail.com";
  const pw = "alpit2503";
  const navigate = useNavigate();
  const {login} = useAdminAuth();
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here. For example, basic validation:
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }
    const isCorrectUser =
      (username === user || username === email) && password === pw;
    if (isCorrectUser) {
      setError("");
      login();
      navigate("/dashboard");
    } else {
      setError("Invalid admin credentials.");
    }
    setError(""); // Clear errors on submit
  };

  const styles = {
    page: {
      background: "#f3f5fa",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    card: {
      background: "#fff",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 4px 24px 0 rgba(50,50,93,.10)",
      minWidth: "320px",
      maxWidth: "90vw",
    },
    title: {
      fontWeight: 700,
      fontSize: "1.5rem",
      textAlign: "center",
      marginBottom: "1.5rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    input: {
      padding: "0.8rem",
      borderRadius: "6px",
      border: "1px solid #ccd5e0",
      fontSize: "1rem",
      outline: "none",
      width: "100%",
      color: "#333",
    },
    label: {
      fontSize: "1rem",
      marginBottom: "0.2rem",
      display: "block",
    },
    showPassword: {
      marginTop: "0.25rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "0.93rem",
      color: "#555",
    },
    button: {
      padding: "0.9rem",
      border: "none",
      borderRadius: "6px",
      background: "#2274a5",
      color: "#fff",
      fontSize: "1.09rem",
      fontWeight: 600,
      cursor: "pointer",
      marginTop: "0.5rem",
      transition: "background 0.19s",
    },
    buttonHover: {
      background: "#104a74",
    },
    error: {
      color: "#b91c1c",
      minHeight: "1.2em",
      fontSize: "0.98rem",
      textAlign: "center",
      marginTop: "0.5rem",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.title} className="text-black">Admin Login</div>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" style={styles.label} className="text-black">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              style={styles.input}
              placeholder="Enter admin username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label htmlFor="password" style={styles.label} className="text-black">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              style={styles.input}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div style={styles.showPassword}>
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>
          </div>
          <button type="submit" style={styles.button}>
            Login
          </button>
          <div style={styles.error}>{error}</div>
        </form>
      </div>
    </div>
  );
}