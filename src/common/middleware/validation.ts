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
    } catch (error) {
      if (error instanceof Error) {
        next(new AppError(400, error.message || 'Validation error'));
      } else {
        next(new AppError(400, 'Unknown validation error'));
      }
    }
  };
};

type SanitizedValue = string | number | boolean | null | undefined | SanitizedObject | SanitizedArray;
interface SanitizedObject { [key: string]: SanitizedValue }
type SanitizedArray = SanitizedValue[];

export const sanitize = (obj: unknown): SanitizedValue => {
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  
  if (obj && typeof obj === 'object') {
    return Object.keys(obj as object).reduce((acc: SanitizedObject, key) => {
      const value = (obj as Record<string, unknown>)[key];
      // Remove any potential XSS content
      if (typeof value === 'string') {
        acc[key] = value
          .replace(/[<>]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      } else {
        acc[key] = sanitize(value);
      }
      return acc;
    }, {});
  }
  
  return obj as SanitizedValue;
};
