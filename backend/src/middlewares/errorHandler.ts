import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Erros do Prisma
  if ((err as any).code === 'P2002') {
    return res.status(409).json({ error: 'Registro duplicado.' });
  }
  if ((err as any).code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado.' });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}