"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

import styles from "../auth.module.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#e74c3c", "#f39c12", "#3498db", "#27ae60"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setError("");
    try {
      await register(form.username, form.email, form.password);
      // redirect to /auth/login?registered=true handled inside register()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.page} ${styles.pageReverse}`}>
      {/* Deco Panel */}
      <div className={`${styles.deco} ${styles.decoLeft}`}>
        <div className={styles.decoOrb} />
        <div className={styles.decoOrb2} />
        <div className={styles.decoQuote}>
          <span className={styles.quoteMark}>"</span>
          <p>Every great journey begins<br />with a single step.</p>
          <span className={styles.quoteAuthor}>— FootBuzz Team</span>
        </div>
        <div className={styles.decoGrid} />
      </div>
      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <Link href="/" className={styles.backLink}>← Back to home</Link>

          <div className={styles.formSection}>
            <h1 className={styles.formTitle}>Create account</h1>

            {error && (
              <div className={styles.errorBanner} role="alert">
                <span className={styles.errorIcon}>⚠</span> {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="username">Username</label>
                <input
                  id="username" name="username" type="text"
                  autoComplete="username" required
                  value={form.username} onChange={handleChange}
                  className={styles.input} placeholder="yourname"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input
                  id="email" name="email" type="email"
                  autoComplete="email" required
                  value={form.email} onChange={handleChange}
                  className={styles.input} placeholder="you@example.com"
                />
              </div>

              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="password">Password</label>
                  <button type="button" className={styles.showPass} onClick={() => setShowPass(!showPass)}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  id="password" name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password" required
                  value={form.password} onChange={handleChange}
                  className={styles.input} placeholder="Min. 6 characters"
                />
                {form.password && (
                  <div className={styles.strengthWrap}>
                    <div className={styles.strengthBars}>
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className={styles.strengthBar}
                          style={{ background: strength >= n ? strengthColor : "var(--border)" }} />
                      ))}
                    </div>
                    <span className={styles.strengthLabel} style={{ color: strengthColor }}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm" name="confirm"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password" required
                  value={form.confirm} onChange={handleChange}
                  className={`${styles.input} ${form.confirm && form.confirm !== form.password ? styles.inputError : ""}`}
                  placeholder="Repeat your password"
                />
                {form.confirm && form.confirm !== form.password && (
                  <span className={styles.fieldError}>Passwords don&apos;t match</span>
                )}
              </div>

              <button
                type="submit" className={styles.submitBtn}
                disabled={loading || !form.username || !form.email || !form.password || !form.confirm}
              >
                {loading ? <span className={styles.spinner} /> : <>Create account <span className={styles.btnArrow}>→</span></>}
              </button>
            </form>

            <p className={styles.switchText}>
              Already have an account?{" "}
              <Link href="/auth/login" className={styles.switchLink}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}