import { Router } from 'express';
import authRoutes from './auth';
import kycRoutes from './kyc';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
router.use('/auth', authRoutes);
router.use('/kyc', kycRoutes);

export default router;
