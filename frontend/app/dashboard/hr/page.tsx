// frontend/app/dashboard/hr/jobs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Users, Eye, Edit, Trash2 } from 'lucide-react';
import styles from './page.module.css';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  status: 'draft' | 'published' | 'closed' | 'archived';
  applicationsCount: number;
  createdAt: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setError(null);
        const response = await fetch('/api/jobs', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for cookies/sessions
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = await response.json();
        console.log('Raw API response:', data);

        // Handle different response structures
        let jobsArray: Job[] = [];
        
        if (Array.isArray(data)) {
          jobsArray = data;
        } else if (data && typeof data === 'object') {
          // Check for common API response patterns
          const possibleArrayKeys = ['data', 'jobs', 'items', 'results', 'list'];
          for (const key of possibleArrayKeys) {
            if (Array.isArray(data[key])) {
              jobsArray = data[key];
              break;
            }
          }
          
          // If still empty but response seems successful
          if (jobsArray.length === 0 && data.success !== false) {
            console.warn('No jobs array found in response, using empty array');
          }
        }

        setJobs(jobsArray || []);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError(err.message || 'Failed to load jobs');
        setJobs([]); // Always ensure jobs is an array
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Safe jobs array
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  
  // Filter jobs based on search and filter
  const filteredJobs = safeJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                         job.department.toLowerCase().includes(search.toLowerCase()) ||
                         job.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || job.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== id));
      } else {
        throw new Error('Failed to delete job');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job');
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'published': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'closed': return '#ef4444';
      case 'archived': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
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

      {error && (
        <div className={styles.errorAlert}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

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
          {['all', 'published', 'draft', 'closed', 'archived'].map((status) => (
            <button
              key={status}
              className={`${styles.filterButton} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} Jobs
            </button>
          ))}
        </div>
      </div>

      <div className={styles.jobsContainer}>
        {filteredJobs.length === 0 ? (
          <div className={styles.emptyState}>
            {safeJobs.length === 0 ? (
              <>
                <h3>No jobs found</h3>
                <p>
                  {error 
                    ? 'Unable to load jobs. Please check your connection or API configuration.'
                    : 'Create your first job posting to get started.'
                  }
                </p>
                {!error && (
                  <button
                    className={styles.createButton}
                    onClick={() => router.push('/dashboard/hr/jobs/create')}
                  >
                    <Plus size={20} />
                    Create Job
                  </button>
                )}
              </>
            ) : (
              <>
                <h3>No matching jobs</h3>
                <p>Try adjusting your search or filter criteria</p>
                <button
                  className={styles.clearButton}
                  onClick={() => {
                    setSearch('');
                    setFilter('all');
                  }}
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={styles.jobsGrid}>
            {filteredJobs.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <div>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <div className={styles.jobMeta}>
                      <span className={styles.jobDept}>{job.department}</span>
                      <span className={styles.jobLocation}>{job.location}</span>
                      <span className={styles.jobType}>{job.type.replace('-', ' ')}</span>
                    </div>
                  </div>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(job.status) }}
                  >
                    {job.status}
                  </div>
                </div>

                <div className={styles.jobStats}>
                  <div className={styles.stat}>
                    <Users size={16} />
                    <span>{job.applicationsCount || 0} applications</span>
                  </div>
                  <div className={styles.stat}>
                    <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={styles.jobActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => router.push(`/dashboard/hr/jobs/${job.id}`)}
                    title="View job details"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => router.push(`/dashboard/hr/jobs/${job.id}/edit`)}
                    title="Edit job"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => router.push(`/dashboard/hr/jobs/${job.id}/applications`)}
                    title="View applications"
                  >
                    <Users size={16} />
                    Applications
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                    onClick={() => handleDelete(job.id)}
                    title="Delete job"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}