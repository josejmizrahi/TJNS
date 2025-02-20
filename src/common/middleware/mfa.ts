import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';
import { SupabaseAdapter } from '../adapters/supabase.adapter';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

export const requireMFA = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError(401, 'Unauthorized'));
  }

  const database = req.app.get('database') as SupabaseAdapter;
  const user = await database.getUserById(userId);

  if (!user?.profile.mfaEnabled || !user?.profile.mfaVerified) {
    return next(new AppError(403, 'MFA required'));
  }

  next();
};
