import { useState, useEffect } from 'react'
import { candidateService } from '@/services/candidate-service'
import { Candidate, CandidateFilters } from '@/types/candidate'

export const useHrEmployee = () => {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    openPositions: 0,
    interviewsToday: 0,
    hiringRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get HR dashboard statistics
  const getHrDashboardStats = async () => {
    try {
      setLoading(true)
      const response = await candidateService.getHrDashboardStats()
      setStats(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load HR dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  // Get candidates for HR review
  const getCandidatesForReview = async (filters?: Omit<CandidateFilters, 'forHrReview'>) => {
    try {
      const response = await candidateService.getCandidates({
        ...filters,
        forHrReview: true
      } as CandidateFilters)
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch candidates')
    }
  }

  // Update candidate status (HR action)
  const updateCandidateStatus = async (candidateId: string, status: string, notes?: string) => {
    try {
      const response = await candidateService.updateCandidateStatus(candidateId, {
        status,
        hrNotes: notes,
        updatedBy: 'HR_EMPLOYEE'
      })
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update candidate status')
    }
  }

  // Schedule interview - FIXED: Added interviewerName
  const scheduleInterview = async (candidateId: string, interviewData: {
    date: string
    time: string
    interviewerId: string
    interviewerName: string  // Make sure this is included
    type: 'PHONE' | 'VIDEO' | 'IN_PERSON'
    notes?: string
    duration?: number
    tags?: string[]
    meetingLink?: string
    location?: string
    }) => {
      try {
        const response = await candidateService.scheduleInterview(candidateId, interviewData)
        return response
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Failed to schedule interview')
      }
  }

  useEffect(() => {
    getHrDashboardStats()
  }, [])

  return {
    stats,
    loading,
    error,
    getHrDashboardStats,
    getCandidatesForReview,
    updateCandidateStatus,
    scheduleInterview,
    refetch: getHrDashboardStats
  }
}