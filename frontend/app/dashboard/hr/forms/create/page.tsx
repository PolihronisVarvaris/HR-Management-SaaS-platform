'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { FormBuilder } from '@/components/features/forms/FormBuilder'
import { useForms } from '@/hooks/use-forms'
import { FormField, CreateFormData } from '@/types/forms'
import styles from './page.module.css'

export default function CreateFormPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createForm, loading, error } = useForms()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobId: ''
  })
  const [fields, setFields] = useState<FormField[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a form title')
      return
    }

    if (fields.length === 0) {
      alert('Please add at least one field to the form')
      return
    }

    try {
      const form: CreateFormData = {
        ...formData,
        fields
      }

      await createForm(form)
      router.push('/dashboard/hr/forms')
    } catch (err) {
      // Error handled by hook
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Create New Form</h1>
          <p className={styles.subtitle}>
            Build a custom form for candidate applications or information collection
          </p>
        </div>
        <div className={styles.headerButtons}>
          <button 
            onClick={() => router.back()}
            className={styles.secondaryButton}
          >
            ← Back
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSettings}>
          <h2 className={styles.sectionTitle}>Form Settings</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Form Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={styles.input}
              placeholder="e.g., Job Application Form, Candidate Survey, etc."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={styles.textarea}
              placeholder="Describe the purpose of this form..."
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="jobId" className={styles.label}>
              Associated Job (Optional)
            </label>
            <input
              type="text"
              id="jobId"
              value={formData.jobId}
              onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
              className={styles.input}
              placeholder="Enter Job ID if this form is for a specific job"
            />
            <small className={styles.helpText}>
              Leave blank to create a general form that can be used for multiple jobs
            </small>
          </div>
        </div>

        <div className={styles.formBuilderSection}>
          <h2 className={styles.sectionTitle}>Form Builder</h2>
          <p className={styles.sectionSubtitle}>
            Add and arrange fields for your form. Drag to reorder fields.
          </p>
          
          <FormBuilder fields={fields} onChange={setFields} />
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.secondaryButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title || fields.length === 0}
            className={styles.primaryButton}
          >
            {loading ? 'Creating Form...' : 'Create Form'}
          </button>
        </div>
      </form>
    </div>
  )
}