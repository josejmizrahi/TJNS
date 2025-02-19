import { Router, Request, Response, NextFunction } from 'express';
import { Express } from 'express-serve-static-core';
import { authenticate, authorize } from '../../common/middleware/auth';
import { requireMFA } from '../../common/middleware';
import identityController from '../controllers/identity.controller';
import identityService from '../services/identity.service';
import jewishIdentityService from '../services/jewish-id.service';
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

// Jewish Identity routes
router.post(
  '/jewish-identity/:id/documents',
  requireMFA,
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await jewishIdentityService.uploadVerificationDocument(
        req.params.id,
        req.body.documentType,
        req.file!.buffer
      );
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/jewish-identity/:id/family',
  requireMFA,
  upload.array('documents'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await jewishIdentityService.addFamilyMember(
        req.params.id,
        req.body.relation,
        req.body.memberId,
        Array.isArray(req.files) ? req.files.map((f: Express.Multer.File) => ({
          type: f.fieldname,
          file: f.buffer
        })) : []
      );
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// MFA routes
router.post('/mfa/verify', async (req: Request, res: Response, next: NextFunction) => {
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
