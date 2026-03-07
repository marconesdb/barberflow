import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes
  await prisma.notificacao.deleteMany();
  await prisma.historicoAgendamento.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.horarioBarbeiro.deleteMany();
  await prisma.barbeiro.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar Admin
  const admin = await prisma.usuario.create({
    data: {
      nome: 'Admin BarberFlow',
      email: 'admin@barberflow.com',
      papel: 'ADMIN',
      provedorAuth: 'LOCAL',
    },
  });

  // Criar Serviços
  const servicos = await Promise.all([
    prisma.servico.create({
      data: { nome: 'Corte Moderno', preco: 50.0, duracaoMinutos: 45, descricao: 'Corte com degradê e finalização' },
    }),
    prisma.servico.create({
      data: { nome: 'Barba Completa', preco: 35.0, duracaoMinutos: 30, descricao: 'Barba com toalha quente' },
    }),
    prisma.servico.create({
      data: { nome: 'Combo Premium', preco: 75.0, duracaoMinutos: 75, descricao: 'Corte + Barba + Sobrancelha' },
    }),
  ]);

  // Criar Barbeiros
  const barbeiro1 = await prisma.usuario.create({
    data: {
      nome: 'Carlos Silva',
      email: 'carlos@barberflow.com',
      papel: 'BARBEIRO',
      barbeiro: {
        create: {
          especialidades: 'Degradê, Barba',
        },
      },
    },
  });

  const barbeiro2 = await prisma.usuario.create({
    data: {
      nome: 'João Santos',
      email: 'joao@barberflow.com',
      papel: 'BARBEIRO',
      barbeiro: {
        create: {
          especialidades: 'Corte Clássico, Tesoura',
        },
      },
    },
  });

  console.log('Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
