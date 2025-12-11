// frontend/services/job-service.ts
import { apiClient } from './api-client';
import { Job, JobApplication } from '@/types/job';

export const jobService = {
  getJobs: (): Promise<Job[]> => apiClient.get('/jobs').then(res => res.data),
  getJob: (id: string): Promise<Job> => apiClient.get(`/jobs/${id}`).then(res => res.data),
  createJob: (data: Omit<Job, 'id' | 'createdAt' | 'applicationsCount'>): Promise<Job> => 
    apiClient.post('/jobs', data).then(res => res.data),
  updateJob: (id: string, data: Partial<Job>): Promise<Job> => 
    apiClient.put(`/jobs/${id}`, data).then(res => res.data),
  deleteJob: (id: string): Promise<void> => 
    apiClient.delete(`/jobs/${id}`).then(res => res.data),
  getJobApplications: (jobId: string): Promise<JobApplication[]> => 
    apiClient.get(`/jobs/${jobId}/applications`).then(res => res.data),
  
  // Optional: Job status management
  publishJob: (id: string): Promise<Job> => 
    apiClient.patch(`/jobs/${id}/publish`).then(res => res.data),
  closeJob: (id: string): Promise<Job> => 
    apiClient.patch(`/jobs/${id}/close`).then(res => res.data),
  archiveJob: (id: string): Promise<Job> => 
    apiClient.patch(`/jobs/${id}/archive`).then(res => res.data),
};