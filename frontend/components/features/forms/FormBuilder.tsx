import React, { useState } from 'react'
import { FormField, FormFieldType } from '@/types/forms'
import styles from './FormBuilder.module.css'

interface FormBuilderProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
}

const fieldTypes: { value: FormFieldType; label: string; icon: string }[] = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'select', label: 'Dropdown', icon: '📋' },
  { value: 'radio', label: 'Radio Buttons', icon: '⭕' },
  { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'file', label: 'File Upload', icon: '📎' }
]

export const FormBuilder: React.FC<FormBuilderProps> = ({ fields, onChange }) => {
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
      placeholder: type === 'text' ? 'Enter text...' : undefined
    }

    if (type === 'select' || type === 'radio' || type === 'checkbox') {
      newField.options = ['Option 1', 'Option 2']
    }

    onChange([...fields, newField])
    setEditingField(newField)
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    )
    onChange(updatedFields)
    
    if (editingField?.id === fieldId) {
      setEditingField({ ...editingField, ...updates })
    }
  }

  const removeField = (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId)
    onChange(updatedFields)
    if (editingField?.id === fieldId) {
      setEditingField(null)
    }
  }

  const moveField = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= fields.length) return
    
    const newFields = [...fields]
    const [movedField] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, movedField)
    onChange(newFields)
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) return
    
    moveField(dragIndex, dropIndex)
    setDragIndex(null)
  }

  return (
    <div className={styles.formBuilder}>
      <div className={styles.builderLayout}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <h3 className={styles.toolbarTitle}>Add Field</h3>
          <div className={styles.fieldTypes}>
            {fieldTypes.map(fieldType => (
              <button
                key={fieldType.value}
                type="button"
                onClick={() => addField(fieldType.value)}
                className={styles.fieldTypeButton}
              >
                <span className={styles.fieldIcon}>{fieldType.icon}</span>
                <span className={styles.fieldLabel}>{fieldType.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>Form Preview</h3>
          <div className={styles.previewContent}>
            {fields.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✨</div>
                <h4>No fields added yet</h4>
                <p>Start building your form by adding fields from the toolbar</p>
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className={`${styles.fieldPreview} ${dragIndex === index ? styles.dragging : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => setEditingField(field)}
                >
                  <div className={styles.fieldHeader}>
                    <div className={styles.fieldInfo}>
                      <span className={styles.fieldLabelText}>
                        {field.label} {field.required && <span className={styles.requiredStar}>*</span>}
                      </span>
                      <span className={styles.fieldTypeBadge}>{field.type}</span>
                    </div>
                    <div className={styles.fieldActions}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveField(index, index - 1)
                        }}
                        disabled={index === 0}
                        className={styles.moveButton}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveField(index, index + 1)
                        }}
                        disabled={index === fields.length - 1}
                        className={styles.moveButton}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeField(field.id)
                        }}
                        className={styles.deleteButton}
                        title="Delete field"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.fieldInput}>
                    {renderFieldPreview(field)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Field Editor Modal */}
      {editingField && (
        <FieldEditor
          field={editingField}
          onChange={(updates) => updateField(editingField.id, updates)}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  )
}

const renderFieldPreview = (field: FormField) => {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <input
          type={field.type}
          placeholder={field.placeholder}
          disabled
          className={styles.previewInput}
        />
      )
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder}
          disabled
          rows={3}
          className={styles.previewTextarea}
        />
      )
    case 'select':
      return (
        <select disabled className={styles.previewSelect}>
          <option value="">{field.placeholder || 'Select an option...'}</option>
          {field.options?.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      )
    case 'radio':
      return (
        <div className={styles.radioGroup}>
          {field.options?.map((option, i) => (
            <label key={i} className={styles.radioLabel}>
              <input type="radio" name={field.id} value={option} disabled />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <div className={styles.checkboxGroup}>
          {field.options?.map((option, i) => (
            <label key={i} className={styles.checkboxLabel}>
              <input type="checkbox" value={option} disabled />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )
    case 'date':
      return <input type="date" disabled className={styles.previewInput} />
    case 'file':
      return (
        <div className={styles.fileInput}>
          <input type="file" disabled />
        </div>
      )
    default:
      return null
  }
}

const FieldEditor: React.FC<{
  field: FormField
  onChange: (updates: Partial<FormField>) => void
  onClose: () => void
}> = ({ field, onChange, onClose }) => {
  const [options, setOptions] = useState(field.options || [])
  const [newOption, setNewOption] = useState('')

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
    onChange({ options: newOptions })
  }

  const addOption = () => {
    if (!newOption.trim()) return
    
    const newOptions = [...options, newOption.trim()]
    setOptions(newOptions)
    onChange({ options: newOptions })
    setNewOption('')
  }

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    onChange({ options: newOptions })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addOption()
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Edit Field Settings</h3>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Field Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              className={styles.input}
              placeholder="Enter field label"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Placeholder Text</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onChange({ placeholder: e.target.value })}
              className={styles.input}
              placeholder="Enter placeholder text"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onChange({ required: e.target.checked })}
              />
              <span>Required field</span>
            </label>
          </div>

          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Options</label>
              <div className={styles.optionsList}>
                {options.map((option, index) => (
                  <div key={index} className={styles.optionItem}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className={styles.optionInput}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className={styles.removeOptionButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className={styles.addOption}>
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add new option"
                    className={styles.optionInput}
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className={styles.addOptionButton}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.secondaryButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}