export interface NavigationItem {
  name: string
  href: string
  icon: string
  roles: ('CANDIDATE' | 'HR_EMPLOYEE' | 'RECRUITMENT_ADMIN')[]
}

export const navigationConfig: NavigationItem[] = [
  // Common for all roles
  {
    name: 'Overview',
    href: '/dashboard',
    icon: '📊',
    roles: ['CANDIDATE', 'HR_EMPLOYEE', 'RECRUITMENT_ADMIN']
  },
  
  // Candidate specific
  {
    name: 'My Profile',
    href: '/dashboard/candidate/profile',
    icon: '👤',
    roles: ['CANDIDATE']
  },
  {
    name: 'My Applications',
    href: '/dashboard/candidate/applications',
    icon: '📝',
    roles: ['CANDIDATE']
  },
  {
    name: 'Available Jobs',
    href: '/dashboard/candidate/jobs',
    icon: '💼',
    roles: ['CANDIDATE']
  },
  
  // HR specific
  {
    name: 'Candidates',
    href: '/dashboard/hr/candidates',
    icon: '👥',
    roles: ['HR_EMPLOYEE', 'RECRUITMENT_ADMIN']
  },
  {
    name: 'Job Postings',
    href: '/dashboard/hr/jobs',
    icon: '📋',
    roles: ['HR_EMPLOYEE', 'RECRUITMENT_ADMIN']
  },
  {
    name: 'Interviews',
    href: '/dashboard/hr/interviews',
    icon: '🎯',
    roles: ['HR_EMPLOYEE', 'RECRUITMENT_ADMIN']
  },
  // Add Forms to HR navigation
  {
    name: 'Forms',
    href: '/dashboard/hr/forms',
    icon: '📝',
    roles: ['HR_EMPLOYEE', 'RECRUITMENT_ADMIN']
  },
  
  // Admin specific
  {
    name: 'User Management',
    href: '/dashboard/admin/users',
    icon: '⚙️',
    roles: ['RECRUITMENT_ADMIN']
  },
  {
    name: 'Analytics',
    href: '/dashboard/admin/analytics',
    icon: '📈',
    roles: ['RECRUITMENT_ADMIN']
  },
  {
    name: 'System Settings',
    href: '/dashboard/admin/settings',
    icon: '🔧',
    roles: ['RECRUITMENT_ADMIN']
  }
]

export function getNavigationForRole(role: 'CANDIDATE' | 'HR_EMPLOYEE' | 'RECRUITMENT_ADMIN' | undefined): NavigationItem[] {
  if (!role) return []
  
  return navigationConfig.filter(item => 
    item.roles.includes(role)
  )
}