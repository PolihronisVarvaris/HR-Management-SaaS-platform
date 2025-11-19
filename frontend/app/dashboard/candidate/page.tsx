'use client'

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import styles from './page.module.css'

export default function CandidateDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Applications', value: '12', change: '+2', icon: '💼' },
    { label: 'Interviews', value: '3', change: '+1', icon: '📅' },
    { label: 'Profile Views', value: '47', change: '+12', icon: '👤' },
    { label: 'CV Score', value: '85%', change: '+5%', icon: '📈' },
  ]

  const recentApplications = [
    { id: 1, title: 'Senior Frontend Developer', company: 'TechCorp', status: 'Interview', date: '2024-01-15' },
    { id: 2, title: 'Full Stack Engineer', company: 'StartupXYZ', status: 'Applied', date: '2024-01-12' },
    { id: 3, title: 'UX Designer', company: 'DesignCo', status: 'Rejected', date: '2024-01-10' },
  ]

  const statusClass = (status: string) => {
    if (status === 'Interview') return styles.statusInterview
    if (status === 'Applied') return styles.statusApplied
    if (status === 'Rejected') return styles.statusRejected
    return styles.statusDefault
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.h1}>Welcome back, {user?.firstName || 'there'}! 👋</h1>
          <p className={styles.sub}>Here is what is happening with your job search today.</p>
        </div>
        <div>
          <button className={styles.primary}>➕ New Application</button>
        </div>
      </header>

      <section className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statHead}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statIcon}>{s.icon}</div>
            </div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statChange}>{s.change}</div>
          </div>
        ))}
      </section>

      <section className={styles.recent}>
        <h2 className={styles.sectionTitle}>Recent Applications</h2>
        <div className={styles.appsList}>
          {recentApplications.map(app => (
            <div key={app.id} className={styles.appRow}>
              <div className={styles.appLeft}>
                <div className={styles.appIcon}>💼</div>
                <div>
                  <div className={styles.appTitle}>{app.title}</div>
                  <div className={styles.appCompany}>{app.company}</div>
                </div>
              </div>

              <div className={styles.appRight}>
                <div className={`${styles.badge} ${statusClass(app.status)}`}>{app.status}</div>
                <div className={styles.appDate}>{new Date(app.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
