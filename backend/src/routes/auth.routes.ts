// ════════════════════════════════════════════════════════════
// backend/src/routes/auth.routes.ts
// ════════════════════════════════════════════════════════════
import { Router } from 'express';
import { auth, authLimiter, validate } from '../middlewares/index.js';
import { loginSchema, registerSchema, googleLoginSchema } from '../schemas/index.js';
import * as AuthService from '../services/auth.service.js';
import { AuthRequest } from '../types/index.js';
import prisma from '../lib/prisma.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try { res.status(201).json(await AuthService.register(req.body)); }
  catch (e) { next(e); }
});

authRouter.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try { res.json(await AuthService.login(req.body.email, req.body.senha)); }
  catch (e) { next(e); }
});

authRouter.post('/google', authLimiter, validate(googleLoginSchema), async (req, res, next) => {
  try { res.json(await AuthService.loginComGoogle(req.body.idToken)); }
  catch (e) { next(e); }
});

authRouter.get('/me', auth, async (req: AuthRequest, res, next) => {
  try { res.json(await AuthService.me(req.user!.userId)); }
  catch (e) { next(e); }
});

authRouter.patch('/perfil', auth, async (req: AuthRequest, res, next) => {
  try {
    const { nome, telefone, endereco } = req.body;
    if (!nome?.trim()) {
      res.status(400).json({ error: 'Nome é obrigatório' });
      return;
    }
    const usuario = await prisma.usuario.update({
      where: { id: req.user!.userId },
      data: {
        nome: nome.trim(),
        telefone: telefone?.trim() || null,
        endereco: endereco?.trim() || null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        endereco: true,
        papel: true,
        fotoUrl: true,
      },
    });
    res.json(usuario);
  } catch (e) { next(e); }
});