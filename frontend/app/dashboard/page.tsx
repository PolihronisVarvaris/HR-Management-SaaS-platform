'use client'

import React from 'react'
import { useAuth } from '@/hooks/use-auth'
import styles from './page.module.css'

const stats = [
  { label: 'Total Candidates', value: '124', change: '+12%', icon: '👥' },
  { label: 'Open Positions', value: '8', change: '+2', icon: '💼' },
  { label: 'Interviews Today', value: '5', change: 'Now', icon: '🎯' },
  { label: 'Hiring Rate', value: '68%', change: '+5%', icon: '📈' },
]

const recentActivities = [
  { action: 'New candidate applied', candidate: 'Sarah Johnson', time: '2 min ago', type: 'application' },
  { action: 'Interview scheduled', candidate: 'Mike Chen', time: '1 hour ago', type: 'interview' },
  { action: 'Offer sent', candidate: 'Emily Davis', time: '3 hours ago', type: 'offer' },
  { action: 'Profile viewed', candidate: 'Alex Rodriguez', time: '5 hours ago', type: 'view' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div>
          <h1 className={styles.title}>Good morning, {user?.firstName || 'there'}!</h1>
          <p className={styles.sub}>Here is what is happening with your candidates today.</p>
        </div>
        <div>
          <button className={styles.cta}>View Today Interviews</button>
        </div>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((s, i) => (
          <article key={i} className={styles.statCard}>
            <div className={styles.statHead}>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statIcon}>{s.icon}</div>
            </div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statChange}>{s.change} from last week</div>
          </article>
        ))}
      </section>

      <section className={styles.twoCol}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <div className={styles.cardTitle}>🕒 Recent Activity</div>
            <div className={styles.cardDesc}>Latest updates from your candidates</div>
          </header>
          <div className={styles.cardBody}>
            {recentActivities.map((a, idx) => (
              <div key={idx} className={styles.activityRow}>
                <div className={`${styles.dot} ${a.type}`} />
                <div className={styles.activityInfo}>
                  <div className={styles.activityAction}>{a.action}</div>
                  <div className={styles.activityMeta}>{a.candidate} • {a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <div className={styles.cardTitle}>⚡ Quick Actions</div>
            <div className={styles.cardDesc}>Common tasks and shortcuts</div>
          </header>
          <div className={styles.cardBody}>
            <div className={styles.actionsGrid}>
              <button className={styles.actionBtn}>👤<span>Add Candidate</span></button>
              <button className={styles.actionBtn}>💼<span>Post Job</span></button>
              <button className={styles.actionBtn}>📅<span>Schedule</span></button>
              <button className={styles.actionBtn}>📊<span>Reports</span></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
