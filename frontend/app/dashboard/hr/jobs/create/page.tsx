// frontend/app/dashboard/hr/jobs/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import styles from './page.module.css';

export default function CreateJobPage() {
  const router = useRouter();
  const [previewMode, setPreviewMode] = useState(false);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    description: '',
    salaryRange: '',
    experienceLevel: 'mid',
    education: '',
    status: 'draft'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addRequirement = () => {
    setRequirements(prev => [...prev, '']);
  };

  const updateRequirement = (index: number, value: string) => {
    setRequirements(prev => prev.map((req, i) => i === index ? value : req));
  };

  const removeRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const addResponsibility = () => {
    setResponsibilities(prev => [...prev, '']);
  };

  const updateResponsibility = (index: number, value: string) => {
    setResponsibilities(prev => prev.map((resp, i) => i === index ? value : resp));
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      alert('Job created successfully! (This is a demo)');
      router.push('/dashboard/hr/jobs');
    }, 1000);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.push('/dashboard/hr/jobs')}
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </button>
        
        <div className={styles.headerActions}>
          <button
            className={styles.previewButton}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye size={20} />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save size={20} />
            {loading ? 'Saving...' : formData.status === 'draft' ? 'Save Draft' : 'Publish Job'}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {previewMode ? (
          <div className={styles.preview}>
            <div className={styles.previewHeader}>
              <h1 className={styles.previewTitle}>{formData.title || 'Job Title'}</h1>
              <div className={styles.previewMeta}>
                <span>{formData.department || 'Department'}</span>
                <span>{formData.location || 'Location'}</span>
                <span>{formData.type || 'Type'}</span>
              </div>
            </div>

            <div className={styles.previewSection}>
              <h2>Job Description</h2>
              <p>{formData.description || 'No description provided'}</p>
            </div>

            {requirements.filter(r => r.trim()).length > 0 && (
              <div className={styles.previewSection}>
                <h2>Requirements</h2>
                <ul>
                  {requirements.filter(r => r.trim()).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {responsibilities.filter(r => r.trim()).length > 0 && (
              <div className={styles.previewSection}>
                <h2>Responsibilities</h2>
                <ul>
                  {responsibilities.filter(r => r.trim()).map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.previewSection}>
              <h2>Additional Information</h2>
              <div className={styles.previewDetails}>
                <div className={styles.detailItem}>
                  <strong>Experience Level:</strong>
                  <span>{formData.experienceLevel || 'Not specified'}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Education:</strong>
                  <span>{formData.education || 'Not specified'}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Salary Range:</strong>
                  <span>{formData.salaryRange || 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            {/* Basic Information */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>1</span>
                Basic Information
              </h2>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Job Title *
                  <span className={styles.labelHint}>Make it clear and descriptive</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g., Senior Frontend Developer"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Remote, New York, San Francisco"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Job Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Immediately</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>2</span>
                Job Description
              </h2>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Description *
                  <span className={styles.labelHint}>Describe the role, company culture, and impact</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={8}
                  placeholder="Describe the role, responsibilities, and what makes your company great..."
                  required
                />
              </div>
            </div>

            {/* Requirements */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>3</span>
                Requirements
              </h2>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Requirements
                  <span className={styles.labelHint}>Add each requirement on a new line</span>
                </label>
                <div className={styles.dynamicList}>
                  {requirements.map((req, index) => (
                    <div key={index} className={styles.listItem}>
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        className={styles.input}
                        placeholder={`Requirement ${index + 1}`}
                      />
                      {requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className={styles.removeButton}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRequirement}
                    className={styles.addButton}
                  >
                    + Add Requirement
                  </button>
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>4</span>
                Responsibilities
              </h2>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Responsibilities
                  <span className={styles.labelHint}>Add each responsibility on a new line</span>
                </label>
                <div className={styles.dynamicList}>
                  {responsibilities.map((resp, index) => (
                    <div key={index} className={styles.listItem}>
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => updateResponsibility(index, e.target.value)}
                        className={styles.input}
                        placeholder={`Responsibility ${index + 1}`}
                      />
                      {responsibilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeResponsibility(index)}
                          className={styles.removeButton}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addResponsibility}
                    className={styles.addButton}
                  >
                    + Add Responsibility
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionNumber}>5</span>
                Additional Information
              </h2>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead/Manager</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Salary Range</label>
                  <input
                    type="text"
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Education Requirements</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="e.g., Bachelor's degree in Computer Science or equivalent"
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}