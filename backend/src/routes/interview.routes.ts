import { Router } from 'express';
import {
  getInterviews,
  scheduleInterview,
  getInterviewById,
  updateInterview,
  cancelInterview,
} from '../controllers/interviews.controller';

const router = Router();

router.get('/', getInterviews);
router.post('/', scheduleInterview);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.patch('/:id/cancel', cancelInterview);

export default router;