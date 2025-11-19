import { Router } from 'express';
import multer from 'multer';
import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadCV,
  getCVs,
  applyForJob,
  getApplications,
  getCandidates,
  getCandidateById
} from '../controllers/candidateController';
import { authenticate, requireHR } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Candidate routes (authenticated candidates)
router.get('/profile', authenticate, getCandidateProfile);
router.put('/profile', authenticate, updateCandidateProfile);
router.post('/cv', authenticate, upload.single('cv'), uploadCV);
router.get('/cv', authenticate, getCVs);
router.post('/applications', authenticate, applyForJob);
router.get('/applications', authenticate, getApplications);

// HR routes (HR employees only)
router.get('/', authenticate, requireHR, getCandidates);
router.get('/:id', authenticate, requireHR, getCandidateById);

export default router;