'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/services/auth-service'
import styles from './page.module.css'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required')
      setIsLoading(false)
      return
    }

    try {
      await authService.register(formData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className={styles.page}>
      <main className={styles.center}>
        <div className={styles.brand}>
          <div className={styles.logo}>H</div>
          <div className={styles.brandText}>
            <h1>HRFlow</h1>
            <p>Create your HR platform account</p>
          </div>
        </div>

        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Create Account</h2>
            <p>Enter your information to get started</p>
          </header>

          <form onSubmit={handleSubmit} className={styles.form} aria-describedby={error ? 'register-error' : undefined}>
            <div className={styles.grid2}>
              <div>
                <label htmlFor="firstName" className={styles.label}>First Name</label>
                <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={styles.input} placeholder="John" />
              </div>
              <div>
                <label htmlFor="lastName" className={styles.label}>Last Name</label>
                <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={styles.input} placeholder="Doe" />
              </div>
            </div>

            <label htmlFor="email" className={styles.label}>Email</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={styles.input} placeholder="name@company.com" />

            <label htmlFor="password" className={styles.label}>Password</label>
            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className={styles.input} placeholder="••••••••" />

            {error && (
              <div id="register-error" role="alert" className={styles.error}>
                {error}
              </div>
            )}

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className={styles.alt}>
              <span>Already have an account?</span>
              <Link href="/auth/login" className={styles.link}>Sign in</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
