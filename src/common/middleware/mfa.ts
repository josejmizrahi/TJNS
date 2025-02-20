import { Request, Response, NextFunction } from 'express';
import { AppError } from './error';
import { SupabaseAdapter } from '../adapters/supabase.adapter';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: unknown;
  };
}

export const requireMFA = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Rest of the MFA logic...
  next();
};
