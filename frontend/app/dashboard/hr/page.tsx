'use client'

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import styles from './page.module.css'

export default function HRDashboard() {
  const { user } = useAuth()

  return (
    <div className={styles.wrap}>
      <section className={styles.headerCard}>
        <div>
          <h1 className={styles.h1}>HR Dashboard</h1>
          <p className={styles.lead}>Welcome, {user?.firstName || 'there'}! Manage candidates, jobs, and interviews.</p>
        </div>
        <div>
          <button className={styles.primary}>New Job</button>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Candidates</h3>
          <p className={styles.cardText}>Manage candidate applications</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Jobs</h3>
          <p className={styles.cardText}>Create and manage job postings</p>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Interviews</h3>
          <p className={styles.cardText}>Schedule and manage interviews</p>
        </div>
      </section>
    </div>
  )
}
