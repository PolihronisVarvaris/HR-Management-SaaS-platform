import { Form, FormResponse, CreateFormData } from '../types/forms';
import apiClient from './api-client';

export const FormService = {
  // Get all forms
  async getForms(params?: { page?: number; limit?: number; jobId?: string }) {
    const response = await apiClient.get('/forms', { params });
    return response.data;
  },

  // Get form by ID
  async getForm(id: string) {
    const response = await apiClient.get(`/forms/${id}`);
    return response.data;
  },

  // Create form
  async createForm(data: CreateFormData) {
    const response = await apiClient.post('/forms', data);
    return response.data;
  },

  // Update form
  async updateForm(id: string, data: Partial<CreateFormData>) {
    const response = await apiClient.put(`/forms/${id}`, data);
    return response.data;
  },

  // Delete form
  async deleteForm(id: string) {
    await apiClient.delete(`/forms/${id}`);
  },

  // Submit form response
  async submitResponse(formId: string, data: {
    answers: Record<string, any>;
    applicationId?: string;
    candidateId?: string;
  }) {
    const response = await apiClient.post(`/forms/${formId}/responses`, data);
    return response.data;
  },

  // Get form responses
  async getFormResponses(formId: string, params?: { page?: number; limit?: number }) {
    const response = await apiClient.get(`/forms/${formId}/responses`, { params });
    return response.data;
  }
};