import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { KycDocument } from '../models/KycDocument';
import { encrypt } from '../services/auth/encryption';
import { config } from '../config/env';
import { AppError } from '../middleware/error';

const router = Router();

// Submit KYC document
router.post('/submit', auth, async (req: AuthRequest, res, next) => {
  try {
    const { documentType, documentData } = req.body;
    
    if (!req.user || !documentType || !documentData) {
      throw new AppError('Invalid request data', 400);
    }

    // Encrypt document data
    const encryptedData = await encrypt(
      JSON.stringify(documentData),
      config.encryptionKey as string
    );

    const kycDocument = await KycDocument.create({
      userId: req.user._id,
      documentType,
      documentHash: JSON.stringify(encryptedData),
      status: 'pending',
    });

    res.status(201).json(kycDocument);
  } catch (error) {
    next(error);
  }
});

// Get KYC status
router.get('/status', auth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const documents = await KycDocument.find({ userId: req.user._id });
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

export default router;
