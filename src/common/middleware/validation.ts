import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './error';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      next(new AppError(400, error.errors?.[0]?.message || 'Validation error'));
    }
  };
};

export const sanitize = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc: any, key) => {
      // Remove any potential XSS content
      if (typeof obj[key] === 'string') {
        acc[key] = obj[key]
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      } else {
        acc[key] = sanitize(obj[key]);
      }
      return acc;
    }, {});
  }
  
  return obj;
};
