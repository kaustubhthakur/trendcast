"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

import { useSearchParams } from "next/navigation";
import styles from "../auth.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      // redirect handled inside login()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Form Panel */}
      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <Link href="/" className={styles.backLink}>← Back to home</Link>

          <div className={styles.formSection}>
            <h1 className={styles.formTitle}>Welcome back</h1>
            <p className={styles.formSubtitle}>Sign in to continue your journey.</p>

            {justRegistered && (
              <div className={styles.successBanner}>
                ✓ Account created! Please sign in.
              </div>
            )}

            {error && (
              <div className={styles.errorBanner} role="alert">
                <span className={styles.errorIcon}>⚠</span> {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="you@example.com"
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
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !form.email || !form.password}
              >
                {loading ? <span className={styles.spinner} /> : <>Sign in <span className={styles.btnArrow}>→</span></>}
              </button>
            </form>

            <p className={styles.switchText}>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className={styles.switchLink}>Create one</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Deco Panel */}
      <div className={styles.deco}>
        <div className={styles.decoOrb} />
        <div className={styles.decoOrb2} />
        <div className={styles.decoQuote}>
          <span className={styles.quoteMark}>"</span>
          <p>Football is not just a game,<br />it&apos;s a passion.</p>
          <span className={styles.quoteAuthor}>— FootBuzz Team</span>
        </div>
        <div className={styles.decoGrid} />
      </div>
    </div>
  );
}