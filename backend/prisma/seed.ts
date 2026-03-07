import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Limpar dados existentes na ordem correta
  await prisma.avaliacao.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.historicoAgendamento.deleteMany();
  await prisma.agendamento.deleteMany();
  await prisma.horarioBarbeiro.deleteMany();
  await prisma.barbeiro.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.authProvedor.deleteMany();
  await prisma.usuario.deleteMany();

  // ─── Admin ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  await prisma.usuario.create({
    data: {
      nome: 'Admin BarberFlow',
      email: 'admin@barberflow.com',
      senhaHash: adminHash,
      papel: 'ADMIN',
      provedorAuth: 'LOCAL',
    },
  });
  console.log('✅ Admin criado — admin@barberflow.com / admin123');

  // ─── Serviços ────────────────────────────────────────────────────────────
  const [corte, barba, combo] = await Promise.all([
    prisma.servico.create({
      data: {
        nome: 'Corte Moderno',
        preco: 50.0,
        duracaoMinutos: 45,
        descricao: 'Degradê, Scissor Cut ou Clássico com finalização premium.',
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Barba de Respeito',
        preco: 35.0,
        duracaoMinutos: 30,
        descricao: 'Toalha quente, óleos essenciais e alinhamento preciso.',
      },
    }),
    prisma.servico.create({
      data: {
        nome: 'Combo Premium',
        preco: 75.0,
        duracaoMinutos: 75,
        descricao: 'A experiência completa: Cabelo, Barba e Sobrancelha.',
      },
    }),
  ]);
  console.log('✅ Serviços criados');

  // Horários padrão: Seg–Sex 09:00–20:00, Sáb 09:00–18:00
  const horariosPadrao = [
    { diaSemana: 1, horaInicio: '09:00', horaFim: '20:00' },
    { diaSemana: 2, horaInicio: '09:00', horaFim: '20:00' },
    { diaSemana: 3, horaInicio: '09:00', horaFim: '20:00' },
    { diaSemana: 4, horaInicio: '09:00', horaFim: '20:00' },
    { diaSemana: 5, horaInicio: '09:00', horaFim: '20:00' },
    { diaSemana: 6, horaInicio: '09:00', horaFim: '18:00' },
  ];

  // ─── Barbeiros ───────────────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash('barber123', 12);

  const carlos = await prisma.usuario.create({
    data: {
      nome: 'Carlos Silva',
      email: 'carlos@barberflow.com',
      senhaHash,
      papel: 'BARBEIRO',
      provedorAuth: 'LOCAL',
      barbeiro: {
        create: {
          especialidades: 'Degradê, Barba',
          horarios: { create: horariosPadrao },
        },
      },
    },
    include: { barbeiro: true },
  });

  const joao = await prisma.usuario.create({
    data: {
      nome: 'João Santos',
      email: 'joao@barberflow.com',
      senhaHash,
      papel: 'BARBEIRO',
      provedorAuth: 'LOCAL',
      barbeiro: {
        create: {
          especialidades: 'Corte Clássico, Tesoura',
          horarios: { create: horariosPadrao },
        },
      },
    },
    include: { barbeiro: true },
  });
  console.log('✅ Barbeiros criados — senha: barber123');

  // ─── Cliente de teste ────────────────────────────────────────────────────
  const clienteHash = await bcrypt.hash('cliente123', 12);
  const cliente = await prisma.usuario.create({
    data: {
      nome: 'João Teste',
      email: 'cliente@barberflow.com',
      senhaHash: clienteHash,
      telefone: '(11) 99999-9999',
      papel: 'CLIENTE',
      provedorAuth: 'LOCAL',
    },
  });
  console.log('✅ Cliente criado — cliente@barberflow.com / cliente123');

  // ─── Agendamentos de exemplo ─────────────────────────────────────────────
  if (carlos.barbeiro && joao.barbeiro) {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(10, 0, 0, 0);

    const depois = new Date();
    depois.setDate(depois.getDate() + 3);
    depois.setHours(14, 0, 0, 0);

    await prisma.agendamento.create({
      data: {
        codigoControle: 'BF-DEMO-0001',
        clienteId: cliente.id,
        barbeiroId: carlos.barbeiro.id,
        servicoId: corte.id,
        dataHora: amanha,
        status: 'CONFIRMADO',
      },
    });

    await prisma.agendamento.create({
      data: {
        codigoControle: 'BF-DEMO-0002',
        clienteId: cliente.id,
        barbeiroId: joao.barbeiro.id,
        servicoId: combo.id,
        dataHora: depois,
        status: 'CONFIRMADO',
      },
    });

    console.log('✅ Agendamentos de exemplo criados');
  }

  console.log('\n🎉 Seed concluído!\n');
  console.log('Usuários criados:');
  console.log('  Admin  → admin@barberflow.com    / admin123');
  console.log('  Carlos → carlos@barberflow.com   / barber123');
  console.log('  João   → joao@barberflow.com     / barber123');
  console.log('  Client → cliente@barberflow.com  / cliente123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());