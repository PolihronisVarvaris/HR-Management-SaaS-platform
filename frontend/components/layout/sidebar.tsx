'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();

  const candidateLinks = [
    { href: '/dashboard/candidate', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/candidate/jobs', label: 'Browse Jobs', icon: '💼' },
    { href: '/dashboard/candidate/applications', label: 'My Applications', icon: '📝' },
    { href: '/dashboard/candidate/profile', label: 'Profile', icon: '👤' },
  ];

  const hrLinks = [
    { href: '/dashboard/hr', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/hr/candidates', label: 'Candidates', icon: '👥' },
    { href: '/dashboard/hr/jobs', label: 'Job Postings', icon: '💼' },
    { href: '/dashboard/hr/interviews', label: 'Interviews', icon: '🎯' },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/admin/users', label: 'User Management', icon: '👥' },
    { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📈' },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  // Fix role mapping to match your auth system
  const links = userRole === 'HR_EMPLOYEE' ? hrLinks : 
                userRole === 'RECRUITMENT_ADMIN' ? adminLinks : 
                candidateLinks;

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}