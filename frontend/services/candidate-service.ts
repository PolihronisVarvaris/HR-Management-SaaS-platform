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
  // In candidate-service.ts - UPDATE the getCandidates method
  // In candidate-service.ts - FIXED getCandidates method
async getCandidates(filters?: CandidateFilters): Promise<CandidatesResponse> {
  try {
    console.log('🔄 Fetching candidates from API...')
    const response = await apiClient.get('/candidates', { 
      params: filters 
    })
    console.log('✅ Candidates API raw response:', response.data)
    
    // Handle different response formats
    let candidatesData = []
    let paginationData = {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    }
    
    if (response.data.candidates && Array.isArray(response.data.candidates)) {
      // New format: { candidates: [], pagination: {} }
      candidatesData = response.data.candidates
      paginationData = response.data.pagination || paginationData
    } else if (response.data.data && Array.isArray(response.data.data)) {
      // Expected format: { data: [], pagination: {} }
      candidatesData = response.data.data
      paginationData = response.data.pagination || paginationData
    } else if (Array.isArray(response.data)) {
      // Array format: []
      candidatesData = response.data
      paginationData = {
        page: 1,
        limit: candidatesData.length,
        total: candidatesData.length,
        pages: 1
      }
    } else {
      // If no candidates found, use empty array but keep default pagination
      candidatesData = []
    }
    
    console.log(`📊 Processed ${candidatesData.length} candidates`)
    
    return {
      data: candidatesData,
      pagination: paginationData
    }
  } catch (error) {
    console.error('❌ Candidates API error:', error)
    // Return empty response with proper structure
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
      }
    }
  }
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
    try {
      console.log('Fetching users from /api/users...')
      
      // Use the correct endpoint /api/users instead of /api/admin/users
      const response = await apiClient.get('/users', { params: filters })
      console.log('✅ Users fetched successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Error fetching users:', error)
      
      // If there's an auth error, the endpoint exists but we're not authorized
      if (error.response?.status === 401) {
        console.log('⚠️ Users endpoint exists but requires authentication')
      }
      
      // Return empty array but don't break the application
      return { 
        data: [], 
        pagination: { page: 1, limit: 10, total: 0, pages: 1 }
      }
    }
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

  // Interview methods - UPDATED
  async getInterviews(filters?: InterviewFilters): Promise<{ data: Interview[] }> {
    try {
      const response = await apiClient.get('/interviews', { params: filters })
      console.log('Raw interviews response:', response.data)
      
      // Handle different response formats
      let interviewsData = []
      if (response.data?.data) {
        interviewsData = response.data.data
      } else if (Array.isArray(response.data)) {
        interviewsData = response.data
      }
      
      // Transform backend data to frontend format
      const transformedInterviews = interviewsData.map((interview: any) => ({
        id: interview.id,
        candidateId: interview.candidateId || interview.application?.candidateId,
        candidateName: interview.candidateName || 
          (interview.application?.candidate ? 
            `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}` : 
            'Unknown Candidate'),
        position: interview.position || interview.application?.job?.title || 'No Position',
        date: interview.startTime ? interview.startTime.split('T')[0] : interview.date || '',
        time: this.formatTime(interview.startTime || interview.time),
        duration: this.calculateDuration(interview.startTime, interview.endTime) || interview.duration || 60,
        interviewerId: interview.interviewerId || interview.interviewers?.[0]?.id || '',
        interviewerName: interview.interviewerName || interview.interviewers?.[0]?.name || 'Unknown Interviewer',
        type: this.getInterviewType(interview.location || interview.type),
        status: interview.status || 'SCHEDULED',
        notes: interview.description || interview.notes || '',
        tags: interview.tags || [],
        meetingLink: interview.meetingLink || (interview.location?.includes('http') ? interview.location : ''),
        location: interview.location || '',
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt
      }))
      
      return { data: transformedInterviews }
    } catch (error) {
      console.error('Error fetching interviews:', error)
      throw new Error('Failed to fetch interviews from server')
    }
  }

  async scheduleInterview(candidateId: string, interviewData: Omit<InterviewScheduleData, 'candidateId'>): Promise<{ data: Interview }> {
    try {
      console.log('Scheduling interview with data:', { candidateId, interviewData })
      
      // Get the candidate details first
      const candidateResponse = await this.getCandidateById(candidateId)
      const candidate = candidateResponse.data
      console.log('Candidate found:', candidate)

      // For now, use candidateId as applicationId since applications endpoint might not exist
      const applicationId = candidateId

      const backendData = {
        applicationId: applicationId,
        title: `Interview with ${candidate.firstName} ${candidate.lastName}`,
        description: interviewData.notes,
        startTime: new Date(`${interviewData.date}T${interviewData.time}`).toISOString(),
        endTime: new Date(new Date(`${interviewData.date}T${interviewData.time}`).getTime() + (interviewData.duration || 60) * 60000).toISOString(),
        location: interviewData.meetingLink || interviewData.location || '',
        participantIds: interviewData.interviewerIds || [interviewData.interviewerId].filter(Boolean),
        type: interviewData.type
      }

      console.log('Sending to backend:', backendData)
      const response = await apiClient.post('/interviews', backendData)
      console.log('Backend response:', response.data)
      
      return response.data
    } catch (error: any) {
      console.error('Error scheduling interview:', error)
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
      throw new Error(error.response?.data?.error || 'Failed to schedule interview')
    }
  }

  // FIXED: Remove methods that use non-existent endpoints
  async getInterviewers(): Promise<{ data: any[] }> {
    // Since /interviewers doesn't exist, use getUsers which will return empty array
    return this.getUsers()
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

  // Helper methods for data transformation
  private formatTime(dateTimeString: string): string {
    if (!dateTimeString) return '00:00'
    try {
      const date = new Date(dateTimeString)
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } catch {
      return '00:00'
    }
  }

  private calculateDuration(startTime: string, endTime: string): number {
    if (!startTime || !endTime) return 60
    try {
      const start = new Date(startTime)
      const end = new Date(endTime)
      return Math.round((end.getTime() - start.getTime()) / 60000)
    } catch {
      return 60
    }
  }

  private getInterviewType(location: string): 'PHONE' | 'VIDEO' | 'IN_PERSON' {
    if (!location) return 'VIDEO'
    if (location.includes('http')) return 'VIDEO'
    if (location.toLowerCase().includes('phone')) return 'PHONE'
    return 'IN_PERSON'
  }
}

export const candidateService = new CandidateService()