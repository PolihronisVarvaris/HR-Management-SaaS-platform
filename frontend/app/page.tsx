'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import styles from './page.module.css'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loader} />
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <div className={styles.logo}>HR</div>
          <div className={styles.title}>TalentFlow</div>
        </div>
        <div className={styles.navActions}>
          <button className={styles.linkBtn}>Features</button>
          <button className={styles.linkBtn}>Pricing</button>
          <button className={styles.ghostBtn} onClick={() => router.push('/auth/login')}>Sign In</button>
          <button className={styles.primaryBtn} onClick={() => router.push('/auth/register')}>Get Started</button>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroBadge}>🚀 Trusted by 500+ companies worldwide</div>
        <h1 className={styles.heroTitle}>
          Modern HR Platform for <span className={styles.highlight}>Growing Teams</span>
        </h1>
        <p className={styles.heroLead}>
          Streamline your hiring process, manage candidates efficiently, and make data-driven decisions.
        </p>

        <div className={styles.heroCtas}>
          <button className={styles.ctaPrimary} onClick={() => router.push('/auth/register')}>Start Free Trial</button>
          <button className={styles.ctaSecondary}><span className={styles.play}>▶️</span> Watch Demo</button>
        </div>

        <div className={styles.smallNote}>No credit card required • 14-day free trial • Setup in minutes</div>
      </header>

      <section className={styles.logoCloud}>
        <p className={styles.trusted}>TRUSTED BY INDUSTRY LEADERS</p>
        <div className={styles.companies}>
          {['TechCorp', 'InnovateInc', 'GlobalSoft', 'FutureLabs', 'NexusTech'].map((c) => (
            <div key={c} className={styles.company}>{c}</div>
          ))}
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresHead}>
          <h2>Enterprise Features</h2>
          <p>Everything you need to manage your hiring process</p>
        </div>

        <div className={styles.featuresGrid}>
          {[
            { icon: '👥', title: 'Candidate Management', desc: 'Track applicants through every stage' },
            { icon: '📊', title: 'Advanced Analytics', desc: 'Make data-driven hiring decisions' },
            { icon: '⚡', title: 'Automated Workflows', desc: 'Streamline repetitive tasks' },
            { icon: '🔒', title: 'Enterprise Security', desc: 'Bank-level security compliance' },
            { icon: '🌐', title: 'Global Compliance', desc: 'Stay compliant with local laws' },
            { icon: '💬', title: 'Team Collaboration', desc: 'Seamless collaboration features' }
          ].map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
