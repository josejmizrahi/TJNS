import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/app';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    verificationLevel: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      role: string;
      verificationLevel: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireVerificationLevel = (level: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const verificationLevels = ['none', 'basic', 'verified', 'complete'];
    const userLevel = verificationLevels.indexOf(req.user.verificationLevel);
    const requiredLevel = verificationLevels.indexOf(level);

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        message: `This action requires ${level} verification level` 
      });
    }

    next();
  };
};
