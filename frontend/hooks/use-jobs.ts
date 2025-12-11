// frontend/hooks/use-jobs.ts
import { useState, useCallback } from 'react';
import { jobService } from '@/services/job-service';
import { Job } from '@/types/job';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add more job management functions
  const createJob = useCallback(async (jobData: Omit<Job, 'id' | 'createdAt' | 'applicationsCount'>) => {
    setLoading(true);
    setError(null);
    try {
      const newJob = await jobService.createJob(jobData);
      setJobs(prev => [...prev, newJob]);
      return newJob;
    } catch (err: any) {
      setError(err.message || 'Failed to create job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateJob = useCallback(async (id: string, jobData: Partial<Job>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedJob = await jobService.updateJob(id, jobData);
      setJobs(prev => prev.map(job => job.id === id ? updatedJob : job));
      return updatedJob;
    } catch (err: any) {
      setError(err.message || 'Failed to update job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteJob = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await jobService.deleteJob(id);
      setJobs(prev => prev.filter(job => job.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    jobs, 
    loading, 
    error, 
    fetchJobs, 
    createJob, 
    updateJob, 
    deleteJob 
  };
};

// Optional: Hook for single job
export const useJob = (id?: string) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async (jobId: string) => {
    if (!jobId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await jobService.getJob(jobId);
      setJob(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { job, loading, error, fetchJob };
};