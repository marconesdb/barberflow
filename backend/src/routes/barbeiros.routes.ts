
// ════════════════════════════════════════════════════════════
// backend/src/routes/barbeiros.routes.ts
// ════════════════════════════════════════════════════════════
import { Router as BarbeirosRouter } from 'express';
import { auth as a2, role as r2, validate as v2 } from '../middlewares/index.js';
import { createBarbeiroSchema, horariosSchema } from '../schemas/index.js';
import prisma2 from '../lib/prisma.js';
import { AppError as AE2 } from '../lib/AppError.js';
import * as AgendService from '../services/agendamento.service.js';
import bcrypt2 from 'bcrypt';

export const barbeirosRouter = BarbeirosRouter();

barbeirosRouter.get('/', async (_req, res, next) => {
  try {
    const barbeiros = await prisma2.barbeiro.findMany({
      where: { ativo: true },
      include: {
        usuario: { select: { nome: true, email: true, fotoUrl: true } },
        horarios: { orderBy: { diaSemana: 'asc' } },
        avaliacoes: { select: { nota: true } },
      },
    });
    // Injeta média de avaliações
    const result = barbeiros.map((b) => ({
      ...b,
      mediaAvaliacao: b.avaliacoes.length
        ? b.avaliacoes.reduce((s, av) => s + av.nota, 0) / b.avaliacoes.length
        : null,
      totalAvaliacoes: b.avaliacoes.length,
    }));
    res.json(result);
  } catch (e) { next(e); }
});

barbeirosRouter.get('/:id', async (req, res, next) => {
  try {
    const b = await prisma2.barbeiro.findUnique({
      where: { id: req.params.id },
      include: {
        usuario: { select: { nome: true, email: true, fotoUrl: true } },
        horarios: { orderBy: { diaSemana: 'asc' } },
        avaliacoes: { include: { agendamento: { select: { cliente: { select: { nome: true, fotoUrl: true } } } } }, orderBy: { criadoEm: 'desc' }, take: 10 },
      },
    });
    if (!b) throw new AE2('Barbeiro não encontrado', 404);
    res.json(b);
  } catch (e) { next(e); }
});

barbeirosRouter.get('/:id/disponibilidade', async (req, res, next) => {
  try {
    const { data, servicoId } = req.query as { data?: string; servicoId?: string };
    if (!data || !servicoId) throw new AE2('data e servicoId são obrigatórios', 400);
    res.json(await AgendService.disponibilidade(req.params.id, data, servicoId));
  } catch (e) { next(e); }
});

barbeirosRouter.post('/', a2, r2('ADMIN'), v2(createBarbeiroSchema), async (req, res, next) => {
  try {
    const { nome, email, senha, especialidades, horarios } = req.body;
    const senhaHash = senha ? await bcrypt2.hash(senha, 12) : undefined;
    const usuario = await prisma2.usuario.create({
      data: {
        nome, email, senhaHash, papel: 'BARBEIRO', provedorAuth: 'LOCAL',
        barbeiro: {
          create: {
            especialidades,
            horarios: horarios ? { create: horarios } : undefined,
          },
        },
      },
      include: { barbeiro: { include: { horarios: true } } },
    });
    res.status(201).json(usuario);
  } catch (e) { next(e); }
});

barbeirosRouter.put('/:id/horarios', a2, r2('ADMIN'), v2(horariosSchema), async (req, res, next) => {
  try {
    await prisma2.horarioBarbeiro.deleteMany({ where: { barbeiroId: req.params.id } });
    const criados = await prisma2.horarioBarbeiro.createMany({
      data: req.body.horarios.map((h: any) => ({ ...h, barbeiroId: req.params.id })),
    });
    res.json({ criados: criados.count });
  } catch (e) { next(e); }
});