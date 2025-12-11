export type FormFieldType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'number' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'file';

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  jobId?: string;
  fields: FormField[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormResponse {
  id: string;
  formId: string;
  applicationId?: string;
  candidateId?: string;
  answers: Record<string, any>;
  submittedAt: Date;
}

export interface CreateFormInput {
  title: string;
  description?: string;
  jobId?: string;
  fields: FormField[];
}

export interface UpdateFormInput {
  title?: string;
  description?: string;
  fields?: FormField[];
  isActive?: boolean;
}