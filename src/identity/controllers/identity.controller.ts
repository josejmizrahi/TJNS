import { Request, Response, NextFunction } from 'express';
import identityService from '../services/identity.service';

// Validation schemas will be moved to a separate validation module

export class IdentityController {
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await identityService.verifyEmail(
        req.params.userId,
        req.params.token
      );
      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await identityService.registerUser(
        req.body.email,
        req.body.password,
        req.body.profile
      );
      res.status(201).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await identityService.uploadKYCDocument(
        req.user!.id,
        req.body.documentType,
        req.file!.buffer
      );
      res.status(200).json({
        status: 'success',
        data: document
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyDocument(req: Request, res: Response, next: NextFunction) {
    try {
      await identityService.verifyDocument(
        req.params.documentId,
        req.user!.id,
        req.body.approved
      );
      res.status(200).json({
        status: 'success',
        message: 'Document verification updated'
      });
    } catch (error) {
      next(error);
    }
  }

  async createWallet(req: Request, res: Response, next: NextFunction) {
    try {
      const walletAddress = await identityService.createWallet(req.user!.id);
      res.status(200).json({
        status: 'success',
        data: { walletAddress }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new IdentityController();
