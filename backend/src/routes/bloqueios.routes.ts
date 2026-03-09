import { Router } from 'express';
import { auth, role } from '../middlewares/index.js';
import prisma from '../lib/prisma.js';
import { AuthRequest } from '../types/index.js';

export const bloqueiosRouter = Router();

// Listar todos os dias bloqueados (público)
bloqueiosRouter.get('/', async (_req, res, next) => {
  try {
    const bloqueios = await prisma.diaBloqueado.findMany({ orderBy: { data: 'asc' } });
    res.json(bloqueios);
  } catch (e) { next(e); }
});

// Bloquear um dia (admin)
bloqueiosRouter.post('/', auth, role('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    const { data, motivo } = req.body;
    if (!data) { res.status(400).json({ error: 'data é obrigatória' }); return; }
    const bloqueio = await prisma.diaBloqueado.upsert({
      where: { data },
      update: { motivo: motivo || null, criadoPor: req.user!.userId },
      create: { data, motivo: motivo || null, criadoPor: req.user!.userId },
    });
    res.status(201).json(bloqueio);
  } catch (e) { next(e); }
});

// Desbloquear um dia (admin)
bloqueiosRouter.delete('/:data', auth, role('ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    await prisma.diaBloqueado.delete({ where: { data: req.params.data } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});