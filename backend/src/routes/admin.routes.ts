
// ════════════════════════════════════════════════════════════
// backend/src/routes/admin.routes.ts
// ════════════════════════════════════════════════════════════
import { Router as AdminRouter } from 'express';
import { auth as a4, role as r4, validate as v4 } from '../middlewares/index.js';
import { updateStatusSchema } from '../schemas/index.js';
import * as AS2 from '../services/agendamento.service.js';
import prisma4 from '../lib/prisma.js';
import { AuthRequest as AR4 } from '../types/index.js';

export const adminRouter = AdminRouter();

adminRouter.get('/agendamentos', a4, r4('ADMIN', 'BARBEIRO'), async (req: AR4, res, next) => {
  try {
    const { data, status, barbeiroId } = req.query as Record<string, string>;
    res.json(await AS2.listarAdmin({ data, status, barbeiroId, userId: req.user!.userId, papel: req.user!.papel }));
  } catch (e) { next(e); }
});

adminRouter.patch('/agendamentos/:id/status', a4, r4('ADMIN', 'BARBEIRO'), v4(updateStatusSchema), async (req: AR4, res, next) => {
  try { res.json(await AS2.mudarStatus(req.params.id, req.body.status, req.user!.userId)); }
  catch (e) { next(e); }
});

adminRouter.get('/dashboard', a4, r4('ADMIN'), async (_req, res, next) => {
  try {
    const hoje = new Date();
    const ini = new Date(hoje); ini.setHours(0, 0, 0, 0);
    const fim = new Date(hoje); fim.setHours(23, 59, 59, 999);

    const [agHoje, confirmados, cancelados, concluidos, totalClientes, agendamentosDetalhados] =
      await Promise.all([
        prisma4.agendamento.count({ where: { dataHora: { gte: ini, lte: fim } } }),
        prisma4.agendamento.count({ where: { dataHora: { gte: ini, lte: fim }, status: 'CONFIRMADO' } }),
        prisma4.agendamento.count({ where: { status: 'CANCELADO' } }),
        prisma4.agendamento.findMany({ where: { status: 'CONCLUIDO' }, include: { servico: true } }),
        prisma4.usuario.count({ where: { papel: 'CLIENTE' } }),
        prisma4.agendamento.findMany({
          where: { dataHora: { gte: ini, lte: fim } },
          include: {
            servico: true,
            barbeiro: { include: { usuario: { select: { nome: true } } } },
            cliente: { select: { nome: true } },
          },
          orderBy: { dataHora: 'asc' },
        }),
      ]);

    res.json({
      agendamentosHoje: agHoje,
      confirmadosHoje: confirmados,
      totalCancelados: cancelados,
      receitaTotal: concluidos.reduce((s, ag) => s + ag.servico.preco, 0),
      totalClientes,
      agendamentosHojeDetalhado: agendamentosDetalhados,
    });
  } catch (e) { next(e); }
});