import { Router } from 'express';
import { authenticate, authorize } from '../../common/middleware/auth';
import { UserRole } from '../../common/enums/user';
// Validation middleware will be added when schemas are implemented
import tokenController from '../controllers/token.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User routes
router.post('/trust-line', tokenController.setupTrustLine);
router.post('/transfer', tokenController.transfer);
router.get('/balance', tokenController.getBalance);

// Admin/Oracle routes
router.post(
  '/award-mitzvah-points',
  authorize(UserRole.ADMIN, UserRole.VERIFIER),
  tokenController.awardMitzvahPoints
);

export default router;
