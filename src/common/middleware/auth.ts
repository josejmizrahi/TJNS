import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { UserRole, VerificationLevel } from '../types/models';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    verificationLevel: VerificationLevel;
    email?: string;
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

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get user metadata from Supabase
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, verification_level')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return res.status(401).json({ message: 'User profile not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role as UserRole,
      verificationLevel: profile.verification_level as VerificationLevel
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
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

export const requireVerificationLevel = (level: VerificationLevel) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const verificationLevels = [
      VerificationLevel.NONE,
      VerificationLevel.BASIC,
      VerificationLevel.VERIFIED,
      VerificationLevel.COMPLETE
    ];
    
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
