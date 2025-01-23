import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth';
import { validate } from '../../common/middleware/validation';
import identityController from '../controllers/identity.controller';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.post('/register', identityController.register);
router.post('/verify-email/:token', identityController.verifyEmail);

// Protected routes
router.use(authenticate);

// User routes
router.post(
  '/documents',
  upload.single('file'),
  identityController.uploadDocument
);

router.post('/wallet', identityController.createWallet);

// Admin routes
router.patch(
  '/documents/:documentId/verify',
  authorize('admin', 'moderator'),
  identityController.verifyDocument
);

export default router;
