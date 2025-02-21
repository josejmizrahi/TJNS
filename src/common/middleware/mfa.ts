import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';

// Extend Express Request type
declare module 'express' {
  interface Request {
    user?: {
      id: string;
      [key: string]: unknown;
    };
  }
}

import { adapterFactory } from '../adapters';

export const requireMFA = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError(401, 'User not authenticated'));
  }

  const database = adapterFactory.getDatabaseAdapter();
  const user = await database.getUserById(userId);

  if (!user?.profile?.mfaEnabled || !user?.profile?.mfaVerified) {
    return next(new AppError(403, 'MFA verification required'));
  }

  next();
};
