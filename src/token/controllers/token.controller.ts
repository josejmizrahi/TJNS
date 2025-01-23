import { Request, Response, NextFunction } from 'express';
import { validate } from '../../common/middleware/validation';
import { authenticate, authorize } from '../../common/middleware/auth';
import tokenService from '../services/token.service';
import { TokenType } from '../../common/types/models';
import { z } from 'zod';

// Validation schemas
const transferSchema = z.object({
  toUserId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  currency: z.enum([TokenType.SHK, TokenType.MVP])
});

const trustLineSchema = z.object({
  currency: z.enum([TokenType.SHK, TokenType.MVP]),
  limit: z.string().regex(/^\d+(\.\d+)?$/)
});

export class TokenController {
  async setupTrustLine(req: Request, res: Response, next: NextFunction) {
    try {
      await tokenService.setupTrustLine(
        req.user!.id,
        req.body.currency,
        req.body.limit
      );
      res.status(200).json({
        status: 'success',
        message: 'Trust line established'
      });
    } catch (error) {
      next(error);
    }
  }

  async transfer(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await tokenService.transfer(
        req.user!.id,
        req.body.toUserId,
        req.body.amount,
        req.body.currency
      );
      res.status(200).json({
        status: 'success',
        data: transaction
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const balance = await tokenService.getBalance(
        req.user!.id,
        req.query.currency as TokenType
      );
      res.status(200).json({
        status: 'success',
        data: { balance }
      });
    } catch (error) {
      next(error);
    }
  }

  async awardMitzvahPoints(req: Request, res: Response, next: NextFunction) {
    try {
      await tokenService.awardMitzvahPoints(
        req.body.userId,
        req.body.points,
        req.body.reason
      );
      res.status(200).json({
        status: 'success',
        message: 'MitzvahPoints awarded'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TokenController();
