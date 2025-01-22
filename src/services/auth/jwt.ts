import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { IUser } from '../../models/User';

export interface JwtPayload {
  userId: string;
  jewishId: string;
  email: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    jewishId: user.jewishId,
    email: user.email,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '24h',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
