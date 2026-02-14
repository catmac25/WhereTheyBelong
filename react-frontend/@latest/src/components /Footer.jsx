import React, { useEffect, useState } from "react";
import "../Footer.css"

export default function Footer({ company = "Where They Belong ❤️" }) {
  const [year] = useState(new Date().getFullYear());
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("site-theme") || "dark") : "dark"
  );
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("site-theme", theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

 

  async function handleSubscribe(e) {
    e.preventDefault();
    setStatus(null);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus({ type: "error", message: "Please enter a valid email." });
      return;
    }

    setSubmitting(true);
    try {
      // Placeholder: integrate with your API here
      await new Promise((res) => setTimeout(res, 800));
      setStatus({ type: "success", message: "Subscribed — thanks!" });
      setEmail("");
    } catch (err) {
      setStatus({ type: "error", message: "Subscription failed. Try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="rc-footer" role="contentinfo" aria-labelledby="rc-footer-heading">
      <div className="rc-footer__container">
        <div className="rc-brand">
          <a href="/" className="rc-logo" aria-label={`${company} home`}>
            <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
              <path d="M7 12h10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="rc-site-title">{company}</span>
          </a>
          <p className="rc-tag">Designing delightful experiences</p>
        </div>

        <nav className="rc-nav" aria-label="Footer navigation">
          <div className="rc-col">
            
            <ul>
              <li><a href="#">Product</a></li>
              <li><a href="#">Docs</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
          <div className="rc-col">
            
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </nav>

        <div className="rc-subscribe">
          <h3>Stay in the loop</h3>
          <p className="rc-muted">Get occasional updates, no spam.</p>

          <form className="rc-form" onSubmit={handleSubscribe} aria-label="Subscribe to newsletter">
            <label htmlFor="rc-email" className="sr-only">Email address</label>
            <input
              id="rc-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
            <button type="submit" className="rc-btn" disabled={submitting}>
              {submitting ? "Joining…" : "Subscribe"}
            </button>
          </form>

          {status && (
            <p className={`rc-msg ${status.type === "error" ? "rc-error" : "rc-success"}`}>
              {status.message}
            </p>
          )}

          <div className="rc-social" aria-label="Social links">
            <a href="#" aria-label="Twitter" className="rc-social-link" title="Twitter">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M22 5.8c-.6.3-1.2.5-1.9.6.7-.4 1.2-1.1 1.4-1.9-.6.4-1.4.6-2.1.8C18.8 4 17.8 3.5 16.6 3.5c-2 0-3.6 1.6-3.6 3.6 0 .3 0 .6.1.8C9.9 7.7 7.3 6.3 5.6 4C5.2 4.6 5 5.3 5 6c0 1.3.6 2.5 1.6 3.2-.5 0-1-.1-1.4-.3v.1c0 1.8 1.3 3.3 3 3.6-.3.1-.6.1-.9.1-.2 0-.4 0-.6-.1.4 1.3 1.6 2.2 3.1 2.2C9.1 19 7 19.6 4.8 19.6c-.3 0-.6 0-.9-.1C5.6 20.6 7.7 21.4 10 21.4c6 0 9.3-5 9.3-9.3v-.4c.6-.4 1.2-1 1.6-1.6z" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="GitHub" className="rc-social-link" title="GitHub">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 .5C5.7.5.9 5.3.9 11.6c0 4.6 3 8.6 7.1 10 .5.1.7-.2.7-.5v-1.9c-2.9.6-3.6-1.2-3.6-1.2-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6-.8 1.6-.8.9-1.6 2.4-1.1 3-.8.1-.7.4-1.1.8-1.4-2.3-.2-4.6-1.1-4.6-5 0-1.1.4-2 1.1-2.8-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 3 .9.9-.3 1.9-.4 2.9-.4 1 0 1.9.1 2.9.4 2.1-1.2 3-.9 3-.9.6 1.4.2 2.4.1 2.7.7.8 1.1 1.7 1.1 2.8 0 3.9-2.3 4.8-4.6 5 .5.4.9 1 .9 2v3c0 .3.2.6.7.5 4.1-1.4 7.1-5.4 7.1-10 0-6.3-4.8-11.1-11.1-11.1z" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="Dribbble" className="rc-social-link" title="Dribbble">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 .5C5.7.5.9 5.3.9 11.6c0 6.3 4.8 11.1 11.1 11.1s11.1-4.8 11.1-11.1S18.3.5 12 .5zm6.9 6.3c-2.2-.4-4.4-.1-6.5.8.4.6.8 1.3 1.2 2 .1.2.3.6.5 1 2.6-.6 4.8-2.2 4.8-3.8 0-.1 0-.3-.1-.5zM12 3.1c2.5 0 4.8.9 6.6 2.4-.2.4-1 1.7-2.7 2.5-1.1-.8-2.5-1.4-4-1.6-.6-1-1-2.1-1.2-3.3.9-.1 1.8-.1 2.3-.1zM5 6c-1.5 1.8-2.3 4-2.3 6.2 0 1.4.4 2.8 1.1 4 1.7-.8 3.8-1.7 5.8-2.1-.6-2.1-1.1-4.2-.9-6.4C8.4 6.3 6.9 6 5 6zM12 20.9c-2-.1-3.9-.7-5.5-1.6 1-1.5 2.4-2.6 3.9-3.3.4-.2.9-.4 1.3-.6 1.1 2.2 1.8 4.6 2.1 7 .1 0 .2 0 .3 0z" fill="currentColor"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="rc-footnote">
        <p className="rc-muted">
          &copy; {year} {company}. All rights reserved. <a href="#">Privacy</a> · <a href="#">Terms</a>
        </p>
      </div>
    </footer>
  );
}