import apiClient from './api-client'
import { 
  Candidate, 
  CandidateFilters, 
  CandidatesResponse, 
  CandidateStatusUpdate,
  Interview,
  InterviewScheduleData,
  InterviewFilters,
  InterviewData,
  HiringManagerFeedback,
  HiringDecision
} from '@/types/candidate'

class CandidateService {
  // Get candidates with filters
  async getCandidates(filters?: CandidateFilters): Promise<CandidatesResponse> {
    const response = await apiClient.get<CandidatesResponse>('/candidates', { 
      params: filters 
    })
    return response.data
  }

  // Get candidate by ID
  async getCandidateById(id: string): Promise<{ data: Candidate }> {
    const response = await apiClient.get<{ data: Candidate }>(`/candidates/${id}`)
    return response.data
  }

  // Update candidate status
  async updateCandidateStatus(candidateId: string, updateData: CandidateStatusUpdate): Promise<{ data: Candidate }> {
    const response = await apiClient.patch<{ data: Candidate }>(
      `/candidates/${candidateId}/status`,
      updateData
    )
    return response.data
  }

  // HR Employee methods
  async getHrDashboardStats(): Promise<{ 
    data: {
      totalCandidates: number
      openPositions: number
      interviewsToday: number
      hiringRate: number
    }
  }> {
    const response = await apiClient.get('/hr/dashboard/stats')
    return response.data
  }

  // Hiring Manager methods
  async getHiringManagerStats(): Promise<{ 
    data: {
      teamOpenPositions: number
      candidatesInReview: number
      interviewsScheduled: number
      offersPending: number
    }
  }> {
    const response = await apiClient.get('/hiring-manager/dashboard/stats')
    return response.data
  }

  async provideHiringManagerFeedback(candidateId: string, feedback: HiringManagerFeedback): Promise<{ data: Candidate }> {
    const response = await apiClient.post(
      `/candidates/${candidateId}/feedback`,
      feedback
    )
    return response.data
  }

  async makeHiringDecision(candidateId: string, decision: HiringDecision): Promise<{ data: Candidate }> {
    const response = await apiClient.post(
      `/candidates/${candidateId}/decision`,
      decision
    )
    return response.data
  }

  async getTeamOpenPositions(): Promise<{ data: any[] }> {
    const response = await apiClient.get('/hiring-manager/positions')
    return response.data
  }

  // Recruitment Admin methods
  async getAdminDashboardStats(): Promise<{ 
    data: {
      totalUsers: number
      activeRecruiters: number
      systemHealth: string
      pendingApprovals: number
    }
  }> {
    const response = await apiClient.get('/admin/dashboard/stats')
    return response.data
  }

  async getUsers(filters?: { 
    role?: string; 
    status?: string; 
    search?: string; 
    page?: number; 
    limit?: number 
  }): Promise<{ data: any[], pagination: any }> {
    const response = await apiClient.get('/admin/users', { params: filters })
    return response.data
  }

  async createUser(userData: {
    email: string
    firstName: string
    lastName: string
    role: string
    department?: string
  }): Promise<{ data: any }> {
    const response = await apiClient.post('/admin/users', userData)
    return response.data
  }

  async updateUser(userId: string, updates: {
    role?: string
    status?: string
    department?: string
    permissions?: string[]
  }): Promise<{ data: any }> {
    const response = await apiClient.patch(`/admin/users/${userId}`, updates)
    return response.data
  }

  async getSystemConfig(): Promise<{ data: any }> {
    const response = await apiClient.get('/admin/system-config')
    return response.data
  }

  async updateSystemConfig(config: {
    emailTemplates?: any
    workflowSettings?: any
    approvalProcess?: any
    notifications?: any
  }): Promise<{ data: any }> {
    const response = await apiClient.put('/admin/system-config', config)
    return response.data
  }

  async getRecruitmentAnalytics(period?: string): Promise<{ data: any }> {
    const response = await apiClient.get('/admin/analytics', { 
      params: { period } 
    })
    return response.data
  }

  async generateReport(reportType: string, parameters: any): Promise<{ data: any }> {
    const response = await apiClient.post('/admin/reports', {
      reportType,
      parameters
    })
    return response.data
  }

  // Interview methods
  async getInterviews(filters?: InterviewFilters): Promise<{ data: Interview[] }> {
    const response = await apiClient.get('/interviews', { params: filters })
    return response.data
  }

  async scheduleInterview(candidateId: string, interviewData: Omit<InterviewScheduleData, 'candidateId'>): Promise<{ data: Interview }> {
    const response = await apiClient.post(
      `/interviews/${candidateId}`,
      interviewData
    )
    return response.data
  }

  async updateInterview(interviewId: string, updates: Partial<Interview>): Promise<{ data: Interview }> {
    const response = await apiClient.patch(`/interviews/${interviewId}`, updates)
    return response.data
  }

  async cancelInterview(interviewId: string, reason?: string): Promise<{ data: Interview }> {
    const response = await apiClient.patch(`/interviews/${interviewId}/cancel`, { reason })
    return response.data
  }

  async getInterviewById(interviewId: string): Promise<{ data: Interview }> {
    const response = await apiClient.get(`/interviews/${interviewId}`)
    return response.data
  }
  async getInterviewers(): Promise<{ data: any[] }> {
    const response = await apiClient.get('/interviewers')
    return response.data
  }

  // Add candidate
  async addCandidate(candidateData: Partial<Candidate>): Promise<{ data: Candidate }> {
    const response = await apiClient.post('/candidates', candidateData)
    return response.data
  }

  // Update candidate
  async updateCandidate(candidateId: string, updates: Partial<Candidate>): Promise<{ data: Candidate }> {
    const response = await apiClient.patch(`/candidates/${candidateId}`, updates)
    return response.data
  }

  // Delete candidate
  async deleteCandidate(candidateId: string): Promise<void> {
    await apiClient.delete(`/candidates/${candidateId}`)
  }
}

export const candidateService = new CandidateService()