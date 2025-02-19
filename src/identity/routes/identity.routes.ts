import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth';
import { requireMFA } from '../../common/middleware';
import identityController from '../controllers/identity.controller';
import identityService from '../services/identity.service';
import { MFAService } from '../../common/utils/mfa';
import { UserRole } from '../../common/enums/user';
import { SupabaseAdapter } from '../../common/adapters/supabase.adapter';
import { AppError } from '../../common/middleware/error';
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
  requireMFA,
  identityController.uploadDocument
);

router.post('/wallet', requireMFA, identityController.createWallet);

// MFA routes
router.post('/mfa/verify', async (req, res, next) => {
  try {
    const { token, type } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const database = req.app.get('database') as SupabaseAdapter;

    if (type === 'totp') {
      await identityService.verifyMFA(userId, token);
    } else if (type === 'backup') {
      const isValid = await MFAService.validateBackupCode(token, userId, database);
      if (!isValid) {
        throw new AppError(401, 'Invalid backup code');
      }
    } else {
      throw new AppError(400, 'Invalid verification type');
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.patch(
  '/documents/:documentId/verify',
  authorize(UserRole.ADMIN, UserRole.MODERATOR),
  requireMFA,
  identityController.verifyDocument
);

export default router;
