import { z } from 'zod/v3';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  telefone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1),
});

// ─── Serviços ────────────────────────────────────────────────────────────────
export const createServicoSchema = z.object({
  nome: z.string().min(2),
  descricao: z.string().optional(),
  preco: z.number().positive(),
  duracaoMinutos: z.number().int().positive(),
  imagemUrl: z.string().url().optional(),
});

export const updateServicoSchema = createServicoSchema.partial().extend({
  ativo: z.boolean().optional(),
});

// ─── Barbeiros ───────────────────────────────────────────────────────────────
export const createBarbeiroSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6).optional(),
  especialidades: z.string().min(2),
  horarios: z
    .array(
      z.object({
        diaSemana: z.number().int().min(0).max(6),
        horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
        horaFim: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .optional(),
});

export const horariosSchema = z.object({
  horarios: z.array(
    z.object({
      diaSemana: z.number().int().min(0).max(6),
      horaInicio: z.string().regex(/^\d{2}:\d{2}$/),
      horaFim: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ),
});

// ─── Agendamentos ────────────────────────────────────────────────────────────
export const createAgendamentoSchema = z.object({
  barbeiroId: z.string().uuid(),
  servicoId: z.string().uuid(),
  dataHora: z.string().datetime({ message: 'dataHora deve ser ISO 8601' }),
  observacao: z.string().max(300).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO']),
});

// ─── Avaliação ───────────────────────────────────────────────────────────────
export const avaliacaoSchema = z.object({
  nota: z.number().int().min(1).max(5),
  comentario: z.string().max(500).optional(),
});
