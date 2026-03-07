
// ════════════════════════════════════════════════════════════
// backend/src/routes/servicos.routes.ts
// ════════════════════════════════════════════════════════════
import { Router as ServicosRouter } from 'express';
import { auth as authMid, role, validate as val } from '../middlewares/index.js';
import { createServicoSchema, updateServicoSchema } from '../schemas/index.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';

export const servicosRouter = ServicosRouter();

servicosRouter.get('/', async (_req, res, next) => {
  try {
    const servicos = await prisma.servico.findMany({ where: { ativo: true }, orderBy: { preco: 'asc' } });
    res.json(servicos);
  } catch (e) { next(e); }
});

servicosRouter.get('/:id', async (req, res, next) => {
  try {
    const s = await prisma.servico.findUnique({ where: { id: req.params.id } });
    if (!s) throw new AppError('Serviço não encontrado', 404);
    res.json(s);
  } catch (e) { next(e); }
});

servicosRouter.post('/', authMid, role('ADMIN'), val(createServicoSchema), async (req, res, next) => {
  try {
    const s = await prisma.servico.create({ data: req.body });
    res.status(201).json(s);
  } catch (e) { next(e); }
});

servicosRouter.put('/:id', authMid, role('ADMIN'), val(updateServicoSchema), async (req, res, next) => {
  try {
    const s = await prisma.servico.update({ where: { id: req.params.id }, data: req.body });
    res.json(s);
  } catch (e) { next(e); }
});

servicosRouter.delete('/:id', authMid, role('ADMIN'), async (req, res, next) => {
  try {
    await prisma.servico.update({ where: { id: req.params.id }, data: { ativo: false } });
    res.json({ message: 'Serviço desativado' });
  } catch (e) { next(e); }
});

