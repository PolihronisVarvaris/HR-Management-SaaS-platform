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
  options?: string[];
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
  createdAt: string;
  updatedAt: string;
  job?: {
    title: string;
  };
  _count?: {
    formResponses: number;
  };
}

export interface FormResponse {
  id: string;
  formId: string;
  applicationId?: string;
  candidateId?: string;
  answers: Record<string, any>;
  submittedAt: string;
  application?: {
    candidate: {
      firstName: string;
      lastName: string;
      email: string;
    };
    job?: {
      title: string;
    };
  };
  candidate?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateFormData {
  title: string;
  description?: string;
  jobId?: string;
  fields: FormField[];
}