import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../services/auth/jwt';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};
