'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { candidateService } from '@/services/candidate-service'
import { Interview, Candidate } from '@/types/candidate'
import styles from './page.module.css'

interface Participant {
  id: string
  name: string
  role: 'INTERVIEWER' | 'OBSERVER' | 'HR_ADMIN' | 'RECRUITER'
  email?: string
}

export default function InterviewsPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([]) 
  const [availableInterviewers, setAvailableInterviewers] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [candidatesLoading, setCandidatesLoading] = useState(false) 
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [interviewerSearch, setInterviewerSearch] = useState('')
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false)
  const [showInterviewerDropdown, setShowInterviewerDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usersCount, setUsersCount] = useState<number>(0)
  const [usersLoading, setUsersLoading] = useState<boolean>(false)
  
  // Updated interview form state with multiple candidates
  const [newInterview, setNewInterview] = useState({
    candidateIds: [] as string[],
    candidateNames: [] as string[],
    date: '',
    time: '',
    duration: 60,
    participants: [] as Participant[],
    type: 'VIDEO' as 'PHONE' | 'VIDEO' | 'IN_PERSON',
    notes: '',
    tags: [] as string[],
    meetingLink: '',
    location: ''
  })

  const testCandidateService = async () => {
    try {
      console.log('🔍 Testing candidateService.getCandidates()...')
      const serviceResult = await candidateService.getCandidates()
      console.log('📋 Service result structure:', {
        hasData: !!serviceResult.data,
        dataIsArray: Array.isArray(serviceResult.data),
        dataLength: serviceResult.data?.length,
        fullResult: serviceResult
      })
    } catch (error) {
      console.error('❌ Service test failed:', error)
    }
  }

  // Fetch data
  useEffect(() => {
    testDirectAPI()
    testCandidateService()
    fetchInterviews()
    fetchCandidates()
    fetchInterviewers()
    fetchUsersCount()
  }, [])

  const testDirectAPI = async () => {
    try {
      console.log('🧪 Testing direct API call...')
      const directResponse = await fetch('http://localhost:3001/api/candidates')
      console.log('🔧 Direct fetch status:', directResponse.status)
      const directData = await directResponse.json()
      console.log('🔧 Direct fetch data:', directData)
    } catch (error) {
      console.error('❌ Direct API test failed:', error)
    }
  }

  // Filter candidates based on search
  const filteredCandidates = React.useMemo(() => {
    console.log('🔍 Filtering candidates:', {
      searchTerm,
      totalCandidates: candidates.length,
      candidateSample: candidates.slice(0, 2)
    })

    if (!searchTerm) return []
    
    const filtered = candidates.filter(candidate => {
      const firstName = candidate?.firstName || ''
      const lastName = candidate?.lastName || ''
      const email = candidate?.email || ''
      const position = candidate?.position || ''
      
      const fullName = `${firstName} ${lastName}`.toLowerCase().trim()
      const search = searchTerm.toLowerCase()
      
      const matches = fullName.includes(search) || 
            email.toLowerCase().includes(search) ||
            position.toLowerCase().includes(search) ||
            firstName.toLowerCase().includes(search) ||
            lastName.toLowerCase().includes(search)
      
      console.log(`Candidate: ${fullName} - matches: ${matches}`)
      return matches
    })
    
    console.log(`📊 Filtered ${filtered.length} candidates for "${searchTerm}"`)
    return filtered
  }, [candidates, searchTerm])

  const filteredInterviewers = React.useMemo(() => {
    if (!interviewerSearch) return []

    return availableInterviewers.filter(interviewer => {
      const name = interviewer.name.toLowerCase()
      const email = interviewer.email?.toLowerCase() || ''
      const search = interviewerSearch.toLowerCase()
      
      return name.includes(search) || 
            email.includes(search) ||
            name.split(' ').some(part => part.includes(search)) ||
            email.split('@')[0].includes(search)
    })
  }, [availableInterviewers, interviewerSearch])

  // Handle dropdown visibility
  useEffect(() => {
    if (interviewerSearch) {
      setShowInterviewerDropdown(true)
    } else {
      setShowInterviewerDropdown(false)
    }
  }, [interviewerSearch])

  useEffect(() => {
    if (searchTerm) {
      setShowCandidateDropdown(true)
    } else {
      setShowCandidateDropdown(false)
    }
  }, [searchTerm])


  const fetchInterviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await candidateService.getInterviews()
      setInterviews(response.data)
    } catch (error: any) {
      console.error('Failed to fetch interviews:', error)
      setInterviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async () => {
    try {
      setCandidatesLoading(true)
      console.log('🔄 Fetching candidates from users endpoint...')
      
      const response = await candidateService.getUsers()
      console.log('📦 Users response:', response)
      
      if (response && response.data && Array.isArray(response.data)) {
        const candidateUsers = response.data.filter(user => 
          user.role === 'CANDIDATE'
        )
        
        console.log(`🎯 Found ${candidateUsers.length} candidate users:`, candidateUsers)
        
        const transformedCandidates: Candidate[] = candidateUsers.map((user: any) => ({
          id: user.id,
          firstName: user.profile?.firstName || user.firstName || 'Unknown',
          lastName: user.profile?.lastName || user.lastName || 'Unknown',
          email: user.email,
          position: user.position || 'Not specified',
          status: 'NEW' as const,
          stage: 'APPLIED' as const,
          appliedDate: user.createdAt || new Date().toISOString(),
          lastUpdated: user.updatedAt || user.createdAt || new Date().toISOString(),
          phone: user.profile?.phone || '',
          source: user.source || 'MANUAL',
          resumeUrl: user.resumeUrl || undefined,
          hrNotes: user.hrNotes || '',
          hmFeedback: user.hmFeedback || '',
          salaryExpectation: user.salaryExpectation || undefined,
          availability: user.availability || '',
          tags: user.tags || [],
          jobId: user.jobId || undefined
        }))
        
        console.log('✅ Transformed candidates:', transformedCandidates)
        setCandidates(transformedCandidates)
      } else {
        console.warn('❌ No users data found')
        setCandidates([])
      }
    } catch (error: any) {
      console.error('💥 Failed to fetch candidates from users:', error)
      setCandidates([])
    } finally {
      setCandidatesLoading(false)
    }
  }

  const fetchInterviewers = async () => {
    try {
      console.log('Fetching interviewers...')
      const response = await candidateService.getUsers()
      console.log('Interviewers RAW data:', response.data)
      
      const participants = response.data.map((user: any) => {
        const firstName = user.profile?.firstName || user.firstName || 'Unknown'
        const lastName = user.profile?.lastName || user.lastName || 'User'
        const email = user.email || user.profile?.email || ''
        
        const fullName = `${firstName} ${lastName}`.trim().replace(/\s+/g, ' ')
        
        console.log('Processing user:', { 
          original: user, 
          firstName, 
          lastName, 
          fullName,
          email 
        })
        
        return {
          id: user.id,
          name: fullName,
          role: 'INTERVIEWER' as const,
          email: email
        }
      })
      
      console.log('Mapped Participants:', participants)
      setAvailableInterviewers(participants)
    } catch (error: any) {
      console.error('Failed to fetch interviewers:', error)
      setAvailableInterviewers([])
    }
  }

  const fetchUsersCount = async () => {
    try {
      setUsersLoading(true)
      const response = await candidateService.getUsers()
      console.log('Users response:', response)
      
      setUsersCount(response.data.length)
      
      if (response.data.length > 0) {
        console.log('Sample user:', response.data[0])
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
      setUsersCount(0)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (newInterview.candidateIds.length === 0) {
        setError('Please select at least one candidate')
        return
      }
      if (!newInterview.date || !newInterview.time) {
        setError('Please select both date and time')
        return
      }

      const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = 'Scheduling...'
      }

      // For now, use the first candidate ID for the API call
      // You might want to update your backend to support multiple candidates
      const primaryCandidateId = newInterview.candidateIds[0]

      const payload = {
        candidateId: primaryCandidateId,
        candidateIds: newInterview.candidateIds,
        date: newInterview.date,
        time: newInterview.time,
        duration: newInterview.duration,
        participantIds: newInterview.participants.map(p => p.id),
        type: newInterview.type,
        notes: newInterview.notes,
        meetingLink: newInterview.meetingLink,
        location: newInterview.location
      }

      await candidateService.scheduleInterview(primaryCandidateId, payload as any)
      
      setShowScheduleForm(false)
      setNewInterview({
        candidateIds: [],
        candidateNames: [],
        date: '',
        time: '',
        duration: 60,
        participants: [],
        type: 'VIDEO',
        notes: '',
        tags: [],
        meetingLink: '',
        location: ''
      })
      setSearchTerm('')
      setInterviewerSearch('')
      await fetchInterviews()
      alert('Interview scheduled successfully!')
      
    } catch (error: any) {
      console.error('Failed to schedule interview:', error)
      setError(error.response?.data?.error || 'Failed to schedule interview')
      
      const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
      if (submitButton) {
        submitButton.disabled = false
        submitButton.textContent = 'Schedule Interview'
      }
    }
  }

  const handleCandidateSelect = (candidate: Candidate) => {
    console.log('Selected candidate:', candidate)
    
    setNewInterview(prev => ({
      ...prev,
      candidateIds: [...prev.candidateIds, candidate.id],
      candidateNames: [...prev.candidateNames, `${candidate.firstName} ${candidate.lastName}`]
    }))
    
    setSearchTerm('')
    setShowCandidateDropdown(false)
    
    console.log('Updated interview state:', {
      candidateIds: [...newInterview.candidateIds, candidate.id],
      candidateNames: [...newInterview.candidateNames, `${candidate.firstName} ${candidate.lastName}`]
    })
  }

  const handleRemoveCandidate = (candidateId: string, candidateName: string) => {
    setNewInterview(prev => ({
      ...prev,
      candidateIds: prev.candidateIds.filter(id => id !== candidateId),
      candidateNames: prev.candidateNames.filter(name => name !== candidateName)
    }))
  }

  const handleAddParticipant = (participant: Participant) => {
    console.log('Adding participant:', participant)
    
    if (!newInterview.participants.find(p => p.id === participant.id)) {
      setNewInterview(prev => ({
        ...prev,
        participants: [...prev.participants, participant]
      }))
    }
    
    setInterviewerSearch('')
    setShowInterviewerDropdown(false)
    
    console.log('Updated participants:', newInterview.participants)
  }

  const handleRemoveParticipant = (participantId: string) => {
    setNewInterview(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== participantId)
    }))
  }

  const handleTagAdd = (tag: string) => {
    if (tag && !newInterview.tags.includes(tag)) {
      setNewInterview(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setNewInterview(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleCandidateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowCandidateDropdown(false)
    }
  }

  const handleInterviewerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowInterviewerDropdown(false)
    }
  }

  const interviewsByDate = interviews.reduce((acc, interview) => {
    const date = interview.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(interview)
    return acc
  }, {} as Record<string, Interview[]>)

  if (loading) {
    return <div className={styles.loading}>Loading interviews...</div>
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Interview Schedule</h1>
          <p className={styles.subtitle}>
            Manage and schedule candidate interviews
          </p>
        </div>
        <div className={styles.headerButtons}>
          <button 
            className={styles.primaryButton}
            onClick={() => setShowScheduleForm(true)}
          >
            + Schedule Interview
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className={styles.closeError}>×</button>
        </div>
      )}

      {/* Calendar View */}
      <section className={styles.calendarSection}>
        <h2 className={styles.sectionTitle}>Interview Calendar</h2>
        {interviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📅</div>
            <h3>No interviews scheduled</h3>
            <p>Schedule your first interview to get started</p>
            <button 
              className={styles.primaryButton}
              onClick={() => setShowScheduleForm(true)}
            >
              Schedule Interview
            </button>
          </div>
        ) : (
          <div className={styles.calendar}>
            {Object.entries(interviewsByDate).map(([date, dayInterviews]) => (
              <div key={date} className={styles.calendarDay}>
                <div className={styles.dayHeader}>
                  <h3>{new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</h3>
                  <span className={styles.interviewCount}>
                    {dayInterviews.length} interview{dayInterviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className={styles.interviewsList}>
                  {dayInterviews.map(interview => (
                    <div key={interview.id} className={styles.interviewCard}>
                      <div className={styles.interviewTime}>
                        {interview.time} ({interview.duration}min)
                      </div>
                      <div className={styles.interviewDetails}>
                        <div className={styles.candidateName}>
                          {interview.candidateName}
                        </div>
                        <div className={styles.interviewPosition}>
                          {interview.position}
                        </div>
                        <div className={styles.interviewType}>
                          {interview.type} • {interview.interviewerName}
                        </div>
                        <div className={`${styles.interviewStatus} ${styles[interview.status.toLowerCase()]}`}>
                          {interview.status}
                        </div>
                        {interview.notes && (
                          <div className={styles.interviewNotes}>
                            {interview.notes}
                          </div>
                        )}
                        {interview.tags && interview.tags.length > 0 && (
                          <div className={styles.tags}>
                            {interview.tags.map(tag => (
                              <span key={tag} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={styles.interviewActions}>
                        <button className={styles.actionButton}>Edit</button>
                        <button className={styles.actionButton}>Cancel</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Schedule Interview Modal */}
      {showScheduleForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Schedule New Interview</h2>
            
            <form onSubmit={handleScheduleInterview} className={styles.form}>
              {/* Candidate Selection */}
              <div className={styles.formGroup}>
                <label>Candidates *</label>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm && setShowCandidateDropdown(true)}
                    placeholder="Add candidates"
                    className={styles.searchInput}
                    autoComplete="off" 
                  />
                  
                  {/* Enhanced Candidate Dropdown */}
                  {showCandidateDropdown && (
                    <div className={styles.enhancedDropdown}>
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map(candidate => {
                          const isSelected = newInterview.candidateIds.includes(candidate.id)
                          return (
                            <div
                              key={candidate.id}
                              className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                              onClick={() => handleCandidateSelect(candidate)}
                            >
                              <div className={styles.candidateInfo}>
                                <div className={styles.candidateName}>
                                  {candidate.firstName} {candidate.lastName}
                                  {isSelected && <span className={styles.selectedIndicator}> ✓</span>}
                                </div>
                                <div className={styles.candidateDetails}>
                                  <span className={styles.candidateEmail}>{candidate.email}</span>
                                  {candidate.position && (
                                    <span className={styles.candidatePosition}>• {candidate.position}</span>
                                  )}
                                </div>
                              </div>
                              <div className={styles.addButton}>
                                {isSelected ? '✓' : '+'}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        !candidatesLoading && searchTerm.length > 0 && (
                          <div className={styles.noResults}>
                            🔍 No candidates found for {searchTerm}
                            <div style={{ fontSize: '0.8em', marginTop: '5px' }}>
                              Try searching by name, email, or position
                            </div>
                          </div>
                        )
                      )}
                      {candidatesLoading && (
                        <div className={styles.loadingItem}>
                          <div className={styles.spinner}></div>
                          Searching candidates...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected Candidates Display */}
                <div className={styles.selectedParticipants}>
                  {newInterview.candidateNames.map((candidateName, index) => (
                    <div key={newInterview.candidateIds[index]} className={styles.participantTag}>
                      <div className={styles.tagContent}>
                        <span className={styles.tagAvatar} style={{ background: '#10b981' }}>
                          {candidateName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                        <span className={styles.tagName}>{candidateName}</span>
                        <span className={styles.candidateBadge}>Candidate</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCandidate(newInterview.candidateIds[index], candidateName)}
                        className={styles.removeTag}
                        title="Remove candidate"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newInterview.candidateNames.length === 0 && (
                    <div className={styles.noParticipantsHint}>
                       Search and select candidates for this interview
                    </div>
                  )}
                </div>
              </div>

              {/* Participants Selection */}
              <div className={styles.formGroup}>
                <label>Participants *</label>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    value={interviewerSearch}
                    onChange={(e) => setInterviewerSearch(e.target.value)}
                    onFocus={() => setShowInterviewerDropdown(true)}
                    placeholder="Add participants"
                    className={styles.searchInput}
                    autoComplete="off"
                  />
                  
                  {/* Enhanced Interviewer Dropdown */}
                  {showInterviewerDropdown && (
                    <div className={styles.enhancedDropdown}>
                      {filteredInterviewers.length > 0 ? (
                        filteredInterviewers.map(participant => (
                          <div
                            key={participant.id}
                            className={styles.dropdownItem}
                            onClick={() => handleAddParticipant(participant)}
                          >
                            <div className={styles.participantInfo}>
                              <div className={styles.participantName}>
                                {participant.name}
                              </div>
                              <div className={styles.participantDetails}>
                                <span className={styles.participantEmail}>{participant.email}</span>
                                {participant.role && (
                                  <span className={styles.participantRole}>
                                    • {participant.role.replace('_', ' ').toLowerCase()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={styles.addButton}>
                              +
                            </div>
                          </div>
                        ))
                      ) : (
                        interviewerSearch.length > 0 && (
                          <div className={styles.noResults}>
                            No participants found for {interviewerSearch}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected Participants Display */}
                <div className={styles.selectedParticipants}>
                  {newInterview.participants.map(participant => (
                    <div key={participant.id} className={styles.participantTag}>
                      <div className={styles.tagContent}>
                        <span className={styles.tagAvatar}>
                          {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                        <span className={styles.tagName}>{participant.name}</span>
                        <span 
                          className={styles.participantRoleBadge}
                          data-role={participant.role}
                        >
                          {participant.role.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className={styles.removeTag}
                        title="Remove participant"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newInterview.participants.length === 0 && (
                    <div className={styles.noParticipantsHint}>
                       Search and add interviewers, HR admins, or recruiters as participants
                    </div>
                  )}
                </div>
              </div>

              {/* Interview Details */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Interview Type *</label>
                  <select
                    value={newInterview.type}
                    onChange={(e) => setNewInterview(prev => ({
                      ...prev,
                      type: e.target.value as 'PHONE' | 'VIDEO' | 'IN_PERSON'
                    }))}
                    required
                  >
                    <option value="PHONE">Phone Screen</option>
                    <option value="VIDEO">Video Call</option>
                    <option value="IN_PERSON">In Person</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Duration (minutes) *</label>
                  <select
                    value={newInterview.duration}
                    onChange={(e) => setNewInterview(prev => ({
                      ...prev,
                      duration: parseInt(e.target.value)
                    }))}
                    required
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Date *</label>
                  <input
                    type="date"
                    value={newInterview.date}
                    onChange={(e) => setNewInterview(prev => ({
                      ...prev,
                      date: e.target.value
                    }))}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Time *</label>
                  <input
                    type="time"
                    value={newInterview.time}
                    onChange={(e) => setNewInterview(prev => ({
                      ...prev,
                      time: e.target.value
                    }))}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea
                  value={newInterview.notes}
                  onChange={(e) => setNewInterview(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Add interview notes, preparation materials, etc."
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tags</label>
                <div className={styles.tagsInput}>
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.currentTarget
                        handleTagAdd(input.value)
                        input.value = ''
                      }
                    }}
                  />
                  <div className={styles.selectedTags}>
                    {newInterview.tags.map(tag => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className={styles.removeTag}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {newInterview.type === 'VIDEO' && (
                <div className={styles.formGroup}>
                  <label>Meeting Link</label>
                  <input
                    type="url"
                    value={newInterview.meetingLink}
                    onChange={(e) => setNewInterview(prev => ({
                      ...prev,
                      meetingLink: e.target.value
                    }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              )}

              {newInterview.type === 'IN_PERSON' && (
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={newInterview.location}
                    onChange={(e) => setNewInterview(prev => ({
                      ...prev,
                      location: e.target.value
                    }))}
                    placeholder="Conference Room, Office Address..."
                  />
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setShowScheduleForm(false)
                    setSearchTerm('')
                    setInterviewerSearch('')
                    setShowCandidateDropdown(false)
                    setShowInterviewerDropdown(false)
                    setError(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={newInterview.candidateIds.length === 0 || newInterview.participants.length === 0}
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}