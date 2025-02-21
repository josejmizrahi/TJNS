import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth';
import { requireMFA } from '../../common/middleware';
import identityController from '../controllers/identity.controller';
import identityService from '../services/identity.service';
import jewishIdentityService from '../services/jewish-id.service';
import { MFAService } from '../../common/utils/mfa';
import { UserRole } from '../../common/enums/user';
import { SupabaseAdapter } from '../../common/adapters/supabase.adapter';
import { AppError } from '../../common/middleware/error';
import { auditLogger, AuditEventType } from '../../common/utils/audit';
import { verificationRateLimit, documentRateLimit, mfaRateLimit } from './rate-limits';
import multer from 'multer';

interface RequestWithFiles extends Request {
  file?: any; // Multer adds this
  files?: any[]; // Multer adds this
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await identityController.register(req, res, next);
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: req.body.userId,
      action: 'register',
      status: 'success'
    });
  } catch (error) {
    auditLogger.logEvent({
      type: AuditEventType.VERIFICATION_ATTEMPT,
      userId: req.body.userId,
      action: 'register',
      status: 'failure',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    next(error);
  }
});
router.post('/verify-email/:token', verificationRateLimit, identityController.verifyEmail);

// Protected routes
router.use(authenticate);

// User routes
router.post(
  '/documents',
  upload.single('file'),
  requireMFA,
  documentRateLimit,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await identityController.uploadDocument(req, res, next);
      auditLogger.logEvent({
        type: AuditEventType.DOCUMENT_ACCESS,
        userId: req.user!.id,
        action: 'upload_document',
        status: 'success',
        metadata: {
          documentType: req.body.documentType
        }
      });
    } catch (error) {
      auditLogger.logEvent({
        type: AuditEventType.DOCUMENT_ACCESS,
        userId: req.user!.id,
        action: 'upload_document',
        status: 'failure',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      next(error);
    }
  }
);

router.post('/wallet', requireMFA, verificationRateLimit, identityController.createWallet);

// Jewish Identity routes
router.post(
  '/jewish-identity/:id/documents',
  requireMFA,
  documentRateLimit,
  upload.single('file'),
  async (req: RequestWithFiles, res: Response, next: NextFunction) => {
    try {
      await jewishIdentityService.uploadVerificationDocument(
        req.params.id,
        req.body.documentType,
        req.file!.buffer
      );
      auditLogger.logEvent({
        type: AuditEventType.DOCUMENT_ACCESS,
        userId: req.user!.id,
        action: 'upload_verification_document',
        status: 'success',
        metadata: {
          identityId: req.params.id,
          documentType: req.body.documentType
        }
      });
      res.status(200).json({ success: true });
    } catch (error) {
      auditLogger.logEvent({
        type: AuditEventType.DOCUMENT_ACCESS,
        userId: req.user!.id,
        action: 'upload_verification_document',
        status: 'failure',
        metadata: {
          identityId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      next(error);
    }
  }
);

router.post(
  '/jewish-identity/:id/family',
  requireMFA,
  documentRateLimit,
  upload.array('documents'),
  async (req: RequestWithFiles, res: Response, next: NextFunction) => {
    try {
      await jewishIdentityService.addFamilyMember(
        req.params.id,
        req.body.relation,
        req.body.memberId,
        Array.isArray(req.files) ? req.files.map((f) => ({
          type: f.fieldname,
          file: f.buffer
        })) : []
      );
      auditLogger.logEvent({
        type: AuditEventType.DOCUMENT_ACCESS,
        userId: req.user!.id,
        action: 'add_family_member',
        status: 'success',
        metadata: {
          identityId: req.params.id,
          relation: req.body.relation,
          memberId: req.body.memberId,
          documentCount: req.files?.length || 0
        }
      });
      res.status(200).json({ success: true });
    } catch (error) {
      auditLogger.logEvent({
        type: AuditEventType.DOCUMENT_ACCESS,
        userId: req.user!.id,
        action: 'add_family_member',
        status: 'failure',
        metadata: {
          identityId: req.params.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      next(error);
    }
  }
);

// MFA routes
router.post('/mfa/verify', mfaRateLimit, async (req: Request, res: Response, next: NextFunction) => {
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
