'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { candidateService } from '@/services/candidate-service'
import { Interview, Candidate } from '@/types/candidate'
import styles from './page.module.css'

export default function InterviewsPage() {
  const { user } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCandidateDropdown, setShowCandidateDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // New interview form state
  const [newInterview, setNewInterview] = useState({
    candidateId: '',
    candidateName: '',
    date: '',
    time: '',
    duration: 60,
    interviewerId: user?.id || '',
    interviewerName: `${user?.firstName} ${user?.lastName}` || '',
    type: 'VIDEO' as 'PHONE' | 'VIDEO' | 'IN_PERSON',
    notes: '',
    tags: [] as string[],
    meetingLink: '',
    location: ''
  })

  // Fetch interviews and candidates from backend
  useEffect(() => {
    fetchInterviews()
    fetchCandidates()
  }, [])

  // Filter candidates based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = candidates.filter(candidate =>
        `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCandidates(filtered)
      setShowCandidateDropdown(true)
    } else {
      setFilteredCandidates([])
      setShowCandidateDropdown(false)
    }
  }, [searchTerm, candidates])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await candidateService.getInterviews()
      setInterviews(response.data)
    } catch (error: any) {
      console.error('Failed to fetch interviews:', error)
      setError('Failed to load interviews. Please try again.')
      setInterviews([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async () => {
    try {
      const response = await candidateService.getCandidates()
      setCandidates(response.data)
    } catch (error: any) {
      console.error('Failed to fetch candidates:', error)
      setCandidates([])
    }
  }

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!newInterview.candidateId) {
        alert('Please select a candidate')
        return
      }

      setError(null)
      await candidateService.scheduleInterview(newInterview.candidateId, {
        date: newInterview.date,
        time: newInterview.time,
        interviewerId: newInterview.interviewerId,
        interviewerName: newInterview.interviewerName,
        type: newInterview.type,
        notes: newInterview.notes,
        duration: newInterview.duration,
        tags: newInterview.tags,
        meetingLink: newInterview.meetingLink,
        location: newInterview.location
      })
      
      setShowScheduleForm(false)
      setNewInterview({
        candidateId: '',
        candidateName: '',
        date: '',
        time: '',
        duration: 60,
        interviewerId: user?.id || '',
        interviewerName: `${user?.firstName} ${user?.lastName}` || '',
        type: 'VIDEO',
        notes: '',
        tags: [],
        meetingLink: '',
        location: ''
      })
      setSearchTerm('')
      fetchInterviews() // Refresh the list
    } catch (error: any) {
      console.error('Failed to schedule interview:', error)
      setError(error.message || 'Failed to schedule interview. Please try again.')
    }
  }

  const handleCandidateSelect = (candidate: Candidate) => {
    setNewInterview(prev => ({
      ...prev,
      candidateId: candidate.id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`
    }))
    setSearchTerm(`${candidate.firstName} ${candidate.lastName}`)
    setShowCandidateDropdown(false)
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

  // Group interviews by date for calendar view
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
        <button 
          className={styles.primaryButton}
          onClick={() => setShowScheduleForm(true)}
        >
          + Schedule Interview
        </button>
      </header>

      {error && (
        <div className={styles.error}>
          {error}
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
              <div className={styles.formGroup}>
                <label>Candidate *</label>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search candidates by name or position..."
                    className={styles.searchInput}
                    required
                  />
                  {showCandidateDropdown && filteredCandidates.length > 0 && (
                    <div className={styles.dropdown}>
                      {filteredCandidates.map(candidate => (
                        <div
                          key={candidate.id}
                          className={styles.dropdownItem}
                          onClick={() => handleCandidateSelect(candidate)}
                        >
                          <div className={styles.candidateInfo}>
                            <strong>{candidate.firstName} {candidate.lastName}</strong>
                            <span>{candidate.position}</span>
                          </div>
                          <div className={styles.candidateStatus}>
                            {candidate.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {newInterview.candidateName && (
                  <div className={styles.selectedCandidate}>
                    Selected: <strong>{newInterview.candidateName}</strong>
                  </div>
                )}
              </div>

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
                <label>Interviewer Name *</label>
                <input
                  type="text"
                  value={newInterview.interviewerName}
                  onChange={(e) => setNewInterview(prev => ({
                    ...prev,
                    interviewerName: e.target.value
                  }))}
                  placeholder="Enter interviewer name"
                  required
                />
                <small className={styles.helpText}>
                  This is the person who will conduct the interview
                </small>
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
                    setShowCandidateDropdown(false)
                    setError(null)
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!newInterview.candidateId}
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