export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  position: string
  status: 'NEW' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'
  stage: 'APPLIED' | 'HR_REVIEW' | 'HM_REVIEW' | 'INTERVIEW' | 'OFFER' | 'ONBOARDING'
  source?: string
  resumeUrl?: string
  appliedDate: string
  lastUpdated: string
  hrNotes?: string
  hmFeedback?: string
  salaryExpectation?: number
  availability?: string
  tags?: string[]
  jobId?: string
}

export interface CandidateFilters {
  search?: string
  status?: string
  stage?: string
  jobId?: string
  page?: number
  limit?: number
  forHrReview?: boolean
  forHmReview?: boolean
  position?: string
}

export interface CandidatesResponse {
  data: Candidate[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CandidateStatusUpdate {
  status: string
  hrNotes?: string
  updatedBy: string
}

export interface InterviewData {
  date: string
  time: string
  interviewerId: string
  type: string
  notes?: string
  location?: string
}

export interface HiringManagerFeedback {
  rating: number
  comments: string
  recommendation: 'HIRE' | 'REJECT' | 'MORE_INTERVIEWS'
  strengths: string[]
  concerns: string[]
}

export interface HiringDecision {
  decision: 'APPROVE' | 'REJECT'
  salaryOffer?: number
  startDate?: string
  notes?: string
}

export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  position: string
  date: string
  time: string
  duration: number
  interviewerId: string
  interviewerName: string
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON'
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
  notes?: string
  tags?: string[]
  meetingLink?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export interface InterviewScheduleData {
  candidateId: string
  date: string
  time: string
  interviewerId: string
  interviewerName: string
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON'
  notes?: string
  duration?: number
  tags?: string[]
  meetingLink?: string
  location?: string
}

export interface InterviewFilters {
  date?: string
  status?: string
  interviewerId?: string
  candidateId?: string
  type?: string
  page?: number
  limit?: number
}