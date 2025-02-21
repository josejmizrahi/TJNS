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

export const requireMFA = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    return next(new AppError(401, 'User not authenticated'));
  }

  // Rest of the MFA logic...
  next();
};
