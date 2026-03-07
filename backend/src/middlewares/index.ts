import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { ZodSchema } from 'zod/v3';
import { AppError } from '../lib/AppError.js';
import { AuthRequest, JwtPayload, Papel } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'barberflow_dev_secret';

// ─── Auth ───────────────────────────────────────────────────────────────────
export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Token não fornecido', 401));
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    next();
  } catch {
    next(new AppError('Token inválido ou expirado', 401));
  }
}

// ─── Role Guard ─────────────────────────────────────────────────────────────
export function role(...papeis: Papel[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !papeis.includes(req.user.papel)) {
      return next(new AppError('Acesso negado', 403));
    }
    next();
  };
}

// ─── Zod Validator ──────────────────────────────────────────────────────────
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const msg = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return next(new AppError(msg, 422));
    }
    req.body = result.data;
    next();
  };
}

// ─── Rate Limiters ──────────────────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Limite de requisições atingido.' },
});
