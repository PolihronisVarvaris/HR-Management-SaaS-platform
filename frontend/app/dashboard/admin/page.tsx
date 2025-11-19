'use client'

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import styles from './page.module.css'

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className={styles.wrap}>
      <section className={styles.headerCard}>
        <div>
          <h1 className={styles.h1}>Admin Dashboard</h1>
          <p className={styles.lead}>Welcome, {user?.firstName || 'there'}! System administration and user management.</p>
        </div>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h3 className={styles.cardTitle}>Users</h3>
          <p className={styles.cardText}>Manage system users and roles</p>
        </article>

        <article className={styles.card}>
          <h3 className={styles.cardTitle}>Analytics</h3>
          <p className={styles.cardText}>View system analytics and reports</p>
        </article>

        <article className={styles.card}>
          <h3 className={styles.cardTitle}>Settings</h3>
          <p className={styles.cardText}>Configure system settings</p>
        </article>
      </section>
    </div>
  )
}
