
// ════════════════════════════════════════════════════════════
// backend/src/routes/agendamentos.routes.ts
// ════════════════════════════════════════════════════════════
import { Router as AgendRouter } from 'express';
import { auth as a3, validate as v3 } from '../middlewares/index.js';
import { createAgendamentoSchema, avaliacaoSchema } from '../schemas/index.js';
import * as AS from '../services/agendamento.service.js';
import { AuthRequest as AR3 } from '../types/index.js';

export const agendamentosRouter = AgendRouter();

agendamentosRouter.post('/', a3, v3(createAgendamentoSchema), async (req: AR3, res, next) => {
  try {
    res.status(201).json(await AS.criar(req.user!.userId, req.body));
  } catch (e) { next(e); }
});

agendamentosRouter.get('/meus', a3, async (req: AR3, res, next) => {
  try { res.json(await AS.meus(req.user!.userId)); }
  catch (e) { next(e); }
});

agendamentosRouter.get('/:id', a3, async (req: AR3, res, next) => {
  try { res.json(await AS.buscarPorId(req.params.id, req.user!.userId, req.user!.papel)); }
  catch (e) { next(e); }
});

agendamentosRouter.patch('/:id/cancelar', a3, async (req: AR3, res, next) => {
  try { res.json(await AS.cancelar(req.params.id, req.user!.userId, req.user!.papel)); }
  catch (e) { next(e); }
});

agendamentosRouter.post('/:id/avaliar', a3, v3(avaliacaoSchema), async (req: AR3, res, next) => {
  try {
    res.status(201).json(await AS.avaliar(req.params.id, req.user!.userId, req.body));
  } catch (e) { next(e); }
});