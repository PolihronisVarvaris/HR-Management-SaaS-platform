import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// Basic job routes for now
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Jobs route - not implemented yet' });
});

router.get('/:id', authenticate, (req, res) => {
  res.json({ message: 'Get job by ID - not implemented yet' });
});

export default router;