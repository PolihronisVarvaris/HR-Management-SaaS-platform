import { useState, useEffect } from 'react'
import { candidateService } from '@/services/candidate-service'

export const useRecruitmentAdmin = () => {
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    activeRecruiters: 0,
    systemHealth: 'HEALTHY',
    pendingApprovals: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get admin dashboard statistics
  const getAdminDashboardStats = async () => {
    try {
      setLoading(true)
      // This would call your backend API for admin stats
      const response = await candidateService.getAdminDashboardStats()
      setAdminStats(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  // User management functions
  const getUsers = async (filters?: {
    role?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    try {
      const response = await candidateService.getUsers(filters)
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch users')
    }
  }

  const createUser = async (userData: {
    email: string
    firstName: string
    lastName: string
    role: string
    department?: string
  }) => {
    try {
      const response = await candidateService.createUser(userData)
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  const updateUser = async (userId: string, updates: {
    role?: string
    status?: string
    department?: string
    permissions?: string[]
  }) => {
    try {
      const response = await candidateService.updateUser(userId, updates)
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update user')
    }
  }

  // System configuration
  const getSystemConfig = async () => {
    try {
      const response = await candidateService.getSystemConfig()
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch system config')
    }
  }

  const updateSystemConfig = async (config: {
    emailTemplates?: any
    workflowSettings?: any
    approvalProcess?: any
    notifications?: any
  }) => {
    try {
      const response = await candidateService.updateSystemConfig(config)
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update system config')
    }
  }

  // Analytics and reports
  const getRecruitmentAnalytics = async (period?: string) => {
    try {
      const response = await candidateService.getRecruitmentAnalytics(period)
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch analytics')
    }
  }

  const generateReport = async (reportType: string, parameters: any) => {
    try {
      const response = await candidateService.generateReport(reportType, parameters)
      return response
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to generate report')
    }
  }

  useEffect(() => {
    getAdminDashboardStats()
  }, [])

  return {
    adminStats,
    loading,
    error,
    getAdminDashboardStats,
    getUsers,
    createUser,
    updateUser,
    getSystemConfig,
    updateSystemConfig,
    getRecruitmentAnalytics,
    generateReport,
    refetch: getAdminDashboardStats
  }
}