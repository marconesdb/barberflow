-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT NOT NULL,
    "endereco" TEXT,
    "senhaHash" TEXT,
    "papel" TEXT NOT NULL DEFAULT 'CLIENTE',
    "googleId" TEXT,
    "fotoUrl" TEXT,
    "provedorAuth" TEXT NOT NULL DEFAULT 'LOCAL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "auth_provedores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "provedor" TEXT NOT NULL,
    "provedorUid" TEXT NOT NULL,
    "email" TEXT,
    "fotoUrl" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auth_provedores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "barbeiros" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "especialidades" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "barbeiros_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "horarios_barbeiro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barbeiroId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFim" TEXT NOT NULL,
    CONSTRAINT "horarios_barbeiro_barbeiroId_fkey" FOREIGN KEY ("barbeiroId") REFERENCES "barbeiros" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "imagemUrl" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigoControle" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "barbeiroId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "dataHora" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',
    "observacao" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladoEm" DATETIME,
    "atualizadoEm" DATETIME NOT NULL,
    CONSTRAINT "agendamentos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_barbeiroId_fkey" FOREIGN KEY ("barbeiroId") REFERENCES "barbeiros" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agendamentos_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "servicos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historico_agendamentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agendamentoId" TEXT NOT NULL,
    "statusAnterior" TEXT NOT NULL,
    "statusNovo" TEXT NOT NULL,
    "alteradoPor" TEXT NOT NULL,
    "alteradoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historico_agendamentos_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agendamentoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "enviadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificacoes_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agendamentoId" TEXT NOT NULL,
    "barbeiroId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "avaliacoes_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "agendamentos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "avaliacoes_barbeiroId_fkey" FOREIGN KEY ("barbeiroId") REFERENCES "barbeiros" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_googleId_key" ON "usuarios"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_provedores_provedor_provedorUid_key" ON "auth_provedores"("provedor", "provedorUid");

-- CreateIndex
CREATE UNIQUE INDEX "barbeiros_usuarioId_key" ON "barbeiros"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "agendamentos_codigoControle_key" ON "agendamentos"("codigoControle");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_agendamentoId_key" ON "avaliacoes"("agendamentoId");
