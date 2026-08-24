import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Request validation middleware using Zod schemas.
 * Validates body, query, and/or params against provided schemas.
 */
export function validate(schema: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        (req as any).validatedQuery = schema.query.parse(req.query);
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        sendError(res, 400, 'VALIDATION_ERROR', 'Request validation failed', details);
        return;
      }
      next(error);
    }
  };
}
