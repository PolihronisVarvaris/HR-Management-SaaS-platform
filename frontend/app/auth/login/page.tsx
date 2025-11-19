'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/auth-service'
import styles from './page.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await authService.login({ email, password })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.center}>
        <div className={styles.brand}>
          <div className={styles.logo}>H</div>
          <div className={styles.brandText}>
            <h1>HRFlow</h1>
            <p>Welcome back to your HR platform</p>
          </div>
        </div>

        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </header>

          <form onSubmit={handleSubmit} className={styles.form} aria-describedby={error ? 'login-error' : undefined}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />

            <div className={styles.rowSpace}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <Link href="/forgot-password" className={styles.forgot}>Forgot password?</Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />

            {error && (
              <div id="login-error" role="alert" className={styles.error}>
                {error}
              </div>
            )}

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className={styles.alt}>
              <span>No account?</span>
              <Link href="/auth/register" className={styles.link}>Sign up</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
