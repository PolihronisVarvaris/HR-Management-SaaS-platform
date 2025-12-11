// frontend/app/dashboard/hr/jobs/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Users, Eye, Edit, Trash2, Calendar, MapPin, Briefcase } from 'lucide-react';
import styles from './page.module.css';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  status: 'draft' | 'published' | 'closed' | 'archived';
  applicationsCount: number;
  createdAt: string;
  salaryRange: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
}

export default function JobsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock data for visualization
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'full-time',
      status: 'published',
      applicationsCount: 15,
      createdAt: '2024-01-15',
      salaryRange: '$120,000 - $150,000',
      experienceLevel: 'senior'
    },
    {
      id: '2',
      title: 'HR Manager',
      department: 'Human Resources',
      location: 'New York, NY',
      type: 'full-time',
      status: 'published',
      applicationsCount: 8,
      createdAt: '2024-01-12',
      salaryRange: '$90,000 - $120,000',
      experienceLevel: 'senior'
    },
    {
      id: '3',
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'San Francisco, CA',
      type: 'full-time',
      status: 'draft',
      applicationsCount: 0,
      createdAt: '2024-01-10',
      salaryRange: '$70,000 - $90,000',
      experienceLevel: 'mid'
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Austin, TX',
      type: 'remote',
      status: 'published',
      applicationsCount: 22,
      createdAt: '2024-01-08',
      salaryRange: '$130,000 - $160,000',
      experienceLevel: 'senior'
    },
    {
      id: '5',
      title: 'Customer Support',
      department: 'Support',
      location: 'Remote',
      type: 'part-time',
      status: 'closed',
      applicationsCount: 45,
      createdAt: '2024-01-05',
      salaryRange: '$25 - $30/hour',
      experienceLevel: 'entry'
    },
    {
      id: '6',
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'full-time',
      status: 'archived',
      applicationsCount: 18,
      createdAt: '2024-01-02',
      salaryRange: '$140,000 - $180,000',
      experienceLevel: 'senior'
    },
    {
      id: '7',
      title: 'UX Designer',
      department: 'Design',
      location: 'Los Angeles, CA',
      type: 'hybrid',
      status: 'published',
      applicationsCount: 12,
      createdAt: '2023-12-28',
      salaryRange: '$95,000 - $125,000',
      experienceLevel: 'mid'
    },
    {
      id: '8',
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'Chicago, IL',
      type: 'contract',
      status: 'draft',
      applicationsCount: 0,
      createdAt: '2023-12-25',
      salaryRange: '$80,000 - $100,000',
      experienceLevel: 'mid'
    },
  ];

  // Filter jobs based on search and filter
  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      job.status === filter ||
      (filter === 'active' && (job.status === 'published' || job.status === 'draft'));
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'published': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'closed': return '#ef4444';
      case 'archived': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getStatusText = (status: Job['status']) => {
    switch (status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'closed': return 'Closed';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  const handleViewJob = (id: string) => {
    router.push(`/dashboard/hr/jobs/${id}`);
  };

  const handleEditJob = (id: string) => {
    router.push(`/dashboard/hr/jobs/${id}/edit`);
  };

  const handleViewApplications = (id: string) => {
    router.push(`/dashboard/hr/jobs/${id}/applications`);
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      alert(`Job ${id} would be deleted in a real application`);
      // In a real app, you would call an API here
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Job Postings</h1>
          <p className={styles.subtitle}>Manage and track your job openings</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => router.push('/dashboard/hr/jobs/create')}
        >
          <Plus size={20} />
          Create New Job
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>{mockJobs.length}</span>
            <span className={styles.statLabel}>Total Jobs</span>
          </div>
          <Briefcase className={styles.statIcon} />
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>
              {mockJobs.filter(j => j.status === 'published').length}
            </span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={`${styles.statIcon} ${styles.activeIcon}`}>📢</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>
              {mockJobs.reduce((acc, job) => acc + job.applicationsCount, 0)}
            </span>
            <span className={styles.statLabel}>Total Applications</span>
          </div>
          <Users className={styles.statIcon} />
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statNumber}>
              {mockJobs.filter(j => j.type === 'remote').length}
            </span>
            <span className={styles.statLabel}>Remote Positions</span>
          </div>
          <div className={`${styles.statIcon} ${styles.remoteIcon}`}>🌐</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search jobs by title, department, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All Jobs
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'published' ? styles.active : ''}`}
            onClick={() => setFilter('published')}
          >
            Published
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'draft' ? styles.active : ''}`}
            onClick={() => setFilter('draft')}
          >
            Drafts
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'closed' ? styles.active : ''}`}
            onClick={() => setFilter('closed')}
          >
            Closed
          </button>
          <button
            className={`${styles.filterButton} ${filter === 'archived' ? styles.active : ''}`}
            onClick={() => setFilter('archived')}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className={styles.jobsContainer}>
        {filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>📋</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button
              className={styles.clearButton}
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={styles.jobsGrid}>
            {filteredJobs.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <div className={styles.jobTitleSection}>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <div className={styles.jobMeta}>
                      <span className={styles.jobDept}>
                        <Briefcase size={14} />
                        {job.department}
                      </span>
                      <span className={styles.jobLocation}>
                        <MapPin size={14} />
                        {job.location}
                      </span>
                      <span className={styles.jobType}>
                        {job.type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(job.status) }}
                  >
                    {getStatusText(job.status)}
                  </div>
                </div>

                <div className={styles.jobDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Experience:</span>
                    <span className={styles.detailValue}>
                      {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)} Level
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Salary:</span>
                    <span className={styles.detailValue}>{job.salaryRange}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Posted:</span>
                    <span className={styles.detailValue}>
                      <Calendar size={14} />
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                </div>

                <div className={styles.jobFooter}>
                  <div className={styles.applicationsBadge}>
                    <Users size={16} />
                    <span>{job.applicationsCount} applications</span>
                  </div>
                  
                  <div className={styles.jobActions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleViewJob(job.id)}
                      title="View job details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleEditJob(job.id)}
                      title="Edit job"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleViewApplications(job.id)}
                      title="View applications"
                    >
                      <Users size={16} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => handleDeleteJob(job.id)}
                      title="Delete job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}