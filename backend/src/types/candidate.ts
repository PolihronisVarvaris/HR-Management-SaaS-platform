import { ApplicationStatus, ApplicationStage } from '@prisma/client';

export interface CreateCandidateProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  source?: string;
}

export interface UpdateCandidateProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  source?: string;
}

export interface CreateApplication {
  jobId: string;
  formResponse?: Record<string, any>;
}

export interface UpdateApplicationStatus {
  status: ApplicationStatus;
  stage?: ApplicationStage;
  notes?: string;
}

export interface CandidateFilters {
  search?: string;
  status?: ApplicationStatus;
  stage?: ApplicationStage;
  jobId?: string;
  page?: number;
  limit?: number;
}