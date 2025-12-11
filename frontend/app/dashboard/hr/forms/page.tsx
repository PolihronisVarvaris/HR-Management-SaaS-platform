'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { FormService } from '@/services/form-service'
import { Form } from '@/types/forms'
import styles from './page.module.css'

export default function FormsPage() {
  const { user } = useAuth()
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await FormService.getForms()
      setForms(response.forms)
    } catch (error: any) {
      console.error('Failed to fetch forms:', error)
      setError('Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    try {
      setDeleteLoading(formId)
      await FormService.deleteForm(formId)
      setForms(forms.filter(form => form.id !== formId))
    } catch (error: any) {
      console.error('Failed to delete form:', error)
      setError('Failed to delete form')
    } finally {
      setDeleteLoading(null)
    }
  }

  const getFormType = (form: Form) => {
    if (form.jobId) return 'Job Application'
    return 'General Form'
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading forms...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Form Builder</h1>
          <p className={styles.subtitle}>
            Create and manage custom forms for candidates and applications
          </p>
        </div>
        <div className={styles.headerButtons}>
          <Link 
            href="/dashboard/hr/forms/create"
            className={styles.primaryButton}
          >
            + Create Form
          </Link>
        </div>
      </header>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className={styles.closeError}>×</button>
        </div>
      )}

      {/* Forms Grid */}
      <section className={styles.formsSection}>
        {forms.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📝</div>
            <h3>No forms created yet</h3>
            <p>Create your first form to start collecting information from candidates</p>
            <Link 
              href="/dashboard/hr/forms/create"
              className={styles.primaryButton}
            >
              Create Your First Form
            </Link>
          </div>
        ) : (
          <div className={styles.formsGrid}>
            {forms.map(form => (
              <div key={form.id} className={styles.formCard}>
                <div className={styles.formCardHeader}>
                  <h3 className={styles.formTitle}>{form.title}</h3>
                  <div className={styles.formActions}>
                    <Link 
                      href={`/dashboard/hr/forms/${form.id}/responses`}
                      className={styles.secondaryButton}
                    >
                      Responses ({form._count?.formResponses || 0})
                    </Link>
                    <Link 
                      href={`/dashboard/hr/forms/${form.id}/edit`}
                      className={styles.secondaryButton}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(form.id)}
                      disabled={deleteLoading === form.id}
                      className={styles.dangerButton}
                    >
                      {deleteLoading === form.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                
                {form.description && (
                  <p className={styles.formDescription}>{form.description}</p>
                )}
                
                <div className={styles.formMeta}>
                  <div className={styles.formMetaItem}>
                    <span className={styles.metaLabel}>Type:</span>
                    <span className={styles.metaValue}>{getFormType(form)}</span>
                  </div>
                  {form.job && (
                    <div className={styles.formMetaItem}>
                      <span className={styles.metaLabel}>Job:</span>
                      <span className={styles.metaValue}>{form.job.title}</span>
                    </div>
                  )}
                  <div className={styles.formMetaItem}>
                    <span className={styles.metaLabel}>Fields:</span>
                    <span className={styles.metaValue}>{form.fields.length}</span>
                  </div>
                  <div className={styles.formMetaItem}>
                    <span className={styles.metaLabel}>Status:</span>
                    <span className={`${styles.status} ${form.isActive ? styles.active : styles.inactive}`}>
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className={styles.formFieldsPreview}>
                  <h4>Fields Preview:</h4>
                  <div className={styles.fieldsList}>
                    {form.fields.slice(0, 3).map(field => (
                      <span key={field.id} className={styles.fieldTag}>
                        {field.label} ({field.type})
                      </span>
                    ))}
                    {form.fields.length > 3 && (
                      <span className={styles.moreFields}>
                        +{form.fields.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.formFooter}>
                  <span className={styles.createdDate}>
                    Created: {new Date(form.createdAt).toLocaleDateString()}
                  </span>
                  <Link 
                    href={`/forms/${form.id}`}
                    className={styles.viewFormLink}
                    target="_blank"
                  >
                    View Form →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}