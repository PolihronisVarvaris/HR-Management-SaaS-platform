import { useState, useCallback } from 'react';
import { Form, FormResponse, CreateFormData } from '../types/forms';
import { FormService } from '../services/form-service';

export const useForms = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createForm = useCallback(async (data: CreateFormData): Promise<Form> => {
    setLoading(true);
    setError(null);
    try {
      const form = await FormService.createForm(data);
      return form;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create form';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateForm = useCallback(async (id: string, data: Partial<CreateFormData>): Promise<Form> => {
    setLoading(true);
    setError(null);
    try {
      const form = await FormService.updateForm(id, data);
      return form;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update form';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteForm = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await FormService.deleteForm(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete form';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createForm,
    updateForm,
    deleteForm
  };
};