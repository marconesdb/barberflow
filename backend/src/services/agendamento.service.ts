import prisma from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function gerarCodigo() {
  return `BF-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36).substring(2, 6).toUpperCase()}`;
}

async function registrarHistorico(
  agendamentoId: string,
  statusAnterior: string,
  statusNovo: string,
  alteradoPor: string
) {
  await prisma.historicoAgendamento.create({
    data: { agendamentoId, statusAnterior, statusNovo, alteradoPor },
  });
}

// Verifica conflito de horário para um barbeiro
async function verificarConflito(
  barbeiroId: string,
  dataHora: Date,
  duracaoMinutos: number,
  ignorarId?: string
) {
  const fimNovo = new Date(dataHora.getTime() + duracaoMinutos * 60000);

  const conflitos = await prisma.agendamento.findMany({
    where: {
      barbeiroId,
      status: { in: ['CONFIRMADO', 'PENDENTE'] },
      ...(ignorarId && { id: { not: ignorarId } }),
      dataHora: { lt: fimNovo },
    },
    include: { servico: true },
  });

  for (const ag of conflitos) {
    const fimExistente = new Date(
      new Date(ag.dataHora).getTime() + ag.servico.duracaoMinutos * 60000
    );
    if (fimExistente > dataHora) return true;
  }
  return false;
}

// ─── Disponibilidade ─────────────────────────────────────────────────────────
export async function disponibilidade(barbeiroId: string, data: string, servicoId: string) {
  const servico = await prisma.servico.findUnique({ where: { id: servicoId } });
  if (!servico) throw new AppError('Serviço não encontrado', 404);

  const date = new Date(`${data}T00:00:00`);
  const diaSemana = date.getDay();

  const horario = await prisma.horarioBarbeiro.findFirst({ where: { barbeiroId, diaSemana } });
  if (!horario) return { data, barbeiroId, horariosDisponiveis: [] };

  const inicioDia = new Date(`${data}T00:00:00`);
  const fimDia = new Date(`${data}T23:59:59`);

  const existentes = await prisma.agendamento.findMany({
    where: {
      barbeiroId,
      dataHora: { gte: inicioDia, lte: fimDia },
      status: { in: ['CONFIRMADO', 'PENDENTE'] },
    },
    include: { servico: true },
  });

  const ocupados = existentes.map((ag) => {
    const h = new Date(ag.dataHora);
    const ini = h.getHours() * 60 + h.getMinutes();
    return { inicio: ini, fim: ini + ag.servico.duracaoMinutos };
  });

  const [hI, mI] = horario.horaInicio.split(':').map(Number);
  const [hF, mF] = horario.horaFim.split(':').map(Number);
  const iniMin = hI * 60 + mI;
  const fimMin = hF * 60 + mF;

  const slots: string[] = [];
  const agora = new Date();

  for (let min = iniMin; min + servico.duracaoMinutos <= fimMin; min += 30) {
    const slotDate = new Date(`${data}T${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}:00`);
    if (slotDate <= agora) continue; // ignora horários passados

    const conflito = ocupados.some((oc) => min < oc.fim && min + servico.duracaoMinutos > oc.inicio);
    if (!conflito) {
      slots.push(`${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`);
    }
  }

  return { data, barbeiroId, horariosDisponiveis: slots };
}

// ─── Criar agendamento ───────────────────────────────────────────────────────
// Substitua a função criar completa:
export async function criar(
  clienteId: string,
  data: { barbeiroId: string; servicoId: string; dataHora: string; observacao?: string }
) {
  const [servico, barbeiro] = await Promise.all([
    prisma.servico.findUnique({ where: { id: data.servicoId } }),
    prisma.barbeiro.findUnique({ where: { id: data.barbeiroId } }),
  ]);

  if (!servico?.ativo) throw new AppError('Serviço não encontrado', 404);
  if (!barbeiro?.ativo) throw new AppError('Barbeiro não encontrado', 404);

  const dataHora = new Date(data.dataHora);
  if (dataHora <= new Date()) throw new AppError('Não é possível agendar em data/hora passada', 400);

  // ── Verifica se o dia está bloqueado ─────────────────────
  const dataStr = dataHora.toISOString().split('T')[0]; // "2026-03-10"
  const diaBloqueado = await prisma.diaBloqueado.findUnique({ where: { data: dataStr } });
  if (diaBloqueado) throw new AppError('Este dia está bloqueado para agendamentos.', 422);

  const conflito = await verificarConflito(data.barbeiroId, dataHora, servico.duracaoMinutos);
  if (conflito) throw new AppError('Horário indisponível. Escolha outro horário.', 409);

  const agendamento = await prisma.agendamento.create({
    data: {
      codigoControle: gerarCodigo(),
      clienteId,
      barbeiroId: data.barbeiroId,
      servicoId: data.servicoId,
      dataHora,
      status: 'CONFIRMADO',
      observacao: data.observacao,
    },
    include: {
      servico: true,
      barbeiro: { include: { usuario: { select: { nome: true } } } },
      cliente: { select: { nome: true, email: true } },
    },
  });

  await registrarHistorico(agendamento.id, 'NOVO', 'CONFIRMADO', clienteId);
  return agendamento;
}

// ─── Meus agendamentos ───────────────────────────────────────────────────────
export async function meus(clienteId: string) {
  return prisma.agendamento.findMany({
    where: { clienteId },
    include: {
      servico: true,
      barbeiro: { include: { usuario: { select: { nome: true, fotoUrl: true } } } },
      avaliacao: true,
    },
    orderBy: { dataHora: 'desc' },
  });
}

// ─── Buscar por ID ───────────────────────────────────────────────────────────
export async function buscarPorId(id: string, userId: string, papel: string) {
  const ag = await prisma.agendamento.findUnique({
    where: { id },
    include: {
      servico: true,
      barbeiro: { include: { usuario: true } },
      cliente: { select: { nome: true, email: true, telefone: true, endereco: true } },
      historico: { orderBy: { alteradoEm: 'desc' } },
      avaliacao: true,
    },
  });

  if (!ag) throw new AppError('Agendamento não encontrado', 404);

  const isOwner = ag.clienteId === userId;
  const isBarbeiro = papel === 'BARBEIRO' && ag.barbeiro.usuarioId === userId;
  const isAdmin = papel === 'ADMIN';

  if (!isOwner && !isBarbeiro && !isAdmin) throw new AppError('Acesso negado', 403);
  return ag;
}

// ─── Cancelar ────────────────────────────────────────────────────────────────
export async function cancelar(id: string, userId: string, papel: string) {
  const ag = await prisma.agendamento.findUnique({ where: { id } });
  if (!ag) throw new AppError('Agendamento não encontrado', 404);

  const isOwner = ag.clienteId === userId;
  const isAdmin = papel === 'ADMIN';
  if (!isOwner && !isAdmin) throw new AppError('Acesso negado', 403);

  if (['CANCELADO', 'CONCLUIDO'].includes(ag.status)) {
    throw new AppError(`Não é possível cancelar um agendamento com status ${ag.status}`, 400);
  }

  const [atualizado] = await prisma.$transaction([
    prisma.agendamento.update({
      where: { id },
      data: { status: 'CANCELADO', canceladoEm: new Date() },
    }),
    prisma.historicoAgendamento.create({
      data: { agendamentoId: id, statusAnterior: ag.status, statusNovo: 'CANCELADO', alteradoPor: userId },
    }),
  ]);

  return atualizado;
}

// ─── Avaliar ─────────────────────────────────────────────────────────────────
export async function avaliar(
  agendamentoId: string,
  clienteId: string,
  data: { nota: number; comentario?: string }
) {
  const ag = await prisma.agendamento.findUnique({
    where: { id: agendamentoId },
    include: { avaliacao: true },
  });

  if (!ag) throw new AppError('Agendamento não encontrado', 404);
  if (ag.clienteId !== clienteId) throw new AppError('Acesso negado', 403);
  if (ag.status !== 'CONCLUIDO') throw new AppError('Só é possível avaliar agendamentos concluídos', 400);
  if (ag.avaliacao) throw new AppError('Agendamento já foi avaliado', 409);

  return prisma.avaliacao.create({
    data: {
      agendamentoId,
      barbeiroId: ag.barbeiroId,
      clienteId,
      nota: data.nota,
      comentario: data.comentario,
    },
  });
}

// ─── Admin: listar com filtros ────────────────────────────────────────────────
export async function listarAdmin(filtros: {
  data?: string;
  status?: string;
  barbeiroId?: string;
  userId: string;
  papel: string;
}) {
  const where: any = {};

  if (filtros.data) {
    where.dataHora = {
      gte: new Date(`${filtros.data}T00:00:00`),
      lte: new Date(`${filtros.data}T23:59:59`),
    };
  }

  if (filtros.status) where.status = filtros.status;

  if (filtros.papel === 'BARBEIRO') {
    const barbeiro = await prisma.barbeiro.findUnique({ where: { usuarioId: filtros.userId } });
    where.barbeiroId = barbeiro?.id;
  } else if (filtros.barbeiroId) {
    where.barbeiroId = filtros.barbeiroId;
  }

  return prisma.agendamento.findMany({
    where,
    include: {
      servico: true,
      barbeiro: { include: { usuario: { select: { nome: true } } } },
      cliente: { select: { nome: true, email: true, telefone: true } },
    },
    orderBy: { dataHora: 'asc' },
  });
}

// ─── Admin: mudar status ──────────────────────────────────────────────────────
export async function mudarStatus(
  id: string,
  novoStatus: string,
  alteradoPor: string
) {
  const ag = await prisma.agendamento.findUnique({ where: { id } });
  if (!ag) throw new AppError('Agendamento não encontrado', 404);

  const [atualizado] = await prisma.$transaction([
    prisma.agendamento.update({
      where: { id },
      data: {
        status: novoStatus,
        ...(novoStatus === 'CANCELADO' && { canceladoEm: new Date() }),
      },
    }),
    prisma.historicoAgendamento.create({
      data: { agendamentoId: id, statusAnterior: ag.status, statusNovo: novoStatus, alteradoPor },
    }),
  ]);

  return atualizado;
}