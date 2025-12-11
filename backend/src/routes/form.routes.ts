import { Router } from 'express';
import { FormController } from '../controllers/forms.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/forms', FormController.getForms);
router.get('/forms/:id', FormController.getForm);
router.post('/forms/:formId/responses', FormController.submitResponse);

// Protected routes (HR/Admin only)
router.post('/forms', authenticate, FormController.createForm);
router.put('/forms/:id', authenticate, FormController.updateForm);
router.delete('/forms/:id', authenticate, FormController.deleteForm);
router.get('/forms/:formId/responses', authenticate, FormController.getFormResponses);

export default router;