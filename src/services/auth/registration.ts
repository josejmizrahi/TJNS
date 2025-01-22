import bcrypt from 'bcryptjs';
import { User, IUser } from '../../models/User';
import { generateToken } from './jwt';
import crypto from 'crypto';

interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
}

export const registerUser = async (data: RegistrationData): Promise<{ user: IUser; token: string }> => {
  // Generate unique JewishID
  const jewishId = generateJewishId();
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);
  
  // Create user
  const user = await User.create({
    ...data,
    jewishId,
    passwordHash,
    status: 'pending',
    kycStatus: 'not_started',
  });
  
  // Generate JWT
  const token = generateToken(user);
  
  return { user, token };
};

export const generateJewishId = (): string => {
  // Generate a unique ID with prefix JID
  const uniqueId = crypto.randomBytes(8).toString('hex').toUpperCase();
  return `JID${uniqueId}`;
};

export const validatePassword = async (user: IUser, password: string): Promise<boolean> => {
  return bcrypt.compare(password, user.passwordHash);
};
