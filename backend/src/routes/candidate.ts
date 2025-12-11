// backend/src/routes/candidate.ts - FIXED
import { Router } from 'express';
import multer from 'multer';
import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadCV,
  getCVs,
  applyForJob,
  getApplications,
  getCandidates,  // This function exists
  getCandidateById
} from '../controllers/candidateController';
import { authenticate, requireHR } from '../middleware/auth'; // Use authenticate instead of auth

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// REMOVE THIS DUPLICATE LINE:
// router.get('/', auth, candidateController.getCandidates); // DELETE THIS LINE

// Candidate routes (authenticated candidates)
router.get('/profile', authenticate, getCandidateProfile);
router.put('/profile', authenticate, updateCandidateProfile);
router.post('/cv', authenticate, upload.single('cv'), uploadCV);
router.get('/cv', authenticate, getCVs);
router.post('/applications', authenticate, applyForJob);
router.get('/applications', authenticate, getApplications);

// HR routes (HR employees only) - This is the correct route
router.get('/', authenticate, requireHR, getCandidates); // This uses the imported getCandidates function
router.get('/:id', authenticate, requireHR, getCandidateById);

export default router;