// frontend/types/job.ts
export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  status: 'draft' | 'published' | 'closed' | 'archived';
  applicationsCount: number;
  createdAt: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  salaryRange?: string;
  experienceLevel?: string;
  education?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  resumeUrl: string;
  coverLetter?: string;
  appliedAt: string;
}