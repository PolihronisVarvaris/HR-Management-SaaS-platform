'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { usePathname } from 'next/navigation'
import { getNavigationForRole } from '@/config/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) { 
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
  }

  // Get navigation items based on user role
  const navigationItems = getNavigationForRole(user?.role)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: 240, 
        borderRight: '1px solid #eef2f7', 
        padding: 20, 
        background: '#fff',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{ 
          fontWeight: 800, 
          marginBottom: 20, 
          fontSize: '20px',
          color: '#1e293b'
        }}>
          HRFlow
        </div>

        {/* User Info */}
        <div style={{ 
          padding: '16px', 
          background: '#a10b14', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            fontWeight: 600, 
            color:'#ffffffff',
            fontSize: '15px',
            marginBottom: '4px'
          }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#0000000',
            textTransform: 'capitalize',
            background: '#ffffffff',
            padding: '2px 8px',
            borderRadius: '12px',
            display: 'inline-block'
          }}>
            {user?.role?.toLowerCase()}
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav style={{ flex: 1 }}>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0, 
            display: 'grid', 
            gap: '4px' 
          }}>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    style={{ 
                      textDecoration: 'none', 
                      color: isActive ? '#fff' : '#475569',
                      display: 'block',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                      background: isActive ? '#000000' : 'transparent',
                      border: isActive ? '1px solid #dbeafe' : '1px solid transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ marginRight: '12px' }}>{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        {/* <button 
          onClick={handleLogout}
          style={{
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#fee2e2'
            e.currentTarget.style.borderColor = '#fca5a5'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#fef2f2'
            e.currentTarget.style.borderColor = '#fecaca'
          }}
        >
          <span>🚪</span>
          Logout
        </button> */}
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ 
          padding: '20px 32px', 
          borderBottom: '1px solid #eef2f7', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ 
            fontWeight: 700, 
            fontSize: '24px',
            color: '#1e293b'
          }}>
            Dashboard
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            fontSize: '14px'
          }}>
            <span style={{ color: '#64748b' }}>
              Welcome back, <strong style={{ color: '#1e293b' }}>{user?.firstName}</strong>
            </span>
            {/* <div style={{
              background: '#e2e8f0',
              color: '#475569',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'capitalize'
            }}>
              {user?.role?.toLowerCase()}
            </div> */}
            <button 
              onClick={handleLogout}
              style={{
                background: '#ec202b',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#BA1922'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ec202b'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ 
          flex: 1, 
          padding: '32px',
          maxWidth: '1200px', 
          margin: '0 auto',
          width: '100%'
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}