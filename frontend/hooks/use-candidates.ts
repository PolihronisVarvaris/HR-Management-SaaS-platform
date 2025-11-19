import { useState, useEffect } from 'react'
import { candidateService } from '@/services/candidate-service'
import { Candidate, CandidateFilters } from '@/types/candidate'

export const useCandidates = (filters?: CandidateFilters) => {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  const fetchCandidates = async () => {
    try {
      setLoading(true)
      const response = await candidateService.getCandidates(filters)
      setCandidates(response.data)
      setPagination(response.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCandidates()
  }, [filters])

  return { 
    candidates, 
    loading, 
    error, 
    pagination, 
    refetch: fetchCandidates 
  }
}