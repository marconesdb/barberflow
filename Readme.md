# 💈 BarberFlow

Sistema completo de agendamento para barbearias, com painel administrativo, calendário de gestão e emissão de comprovantes.

---

![BarberFlow](/Preview.png)

## 🚀 Tecnologias

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- React Hook Form + Zod
- Zustand (gerenciamento de estado)
- Axios
- Motion (animações)
- Lucide React (ícones)
- React Hot Toast

**Backend**
- Node.js + Express
- Prisma ORM
- SQLite (better-sqlite3)
- JWT (autenticação)
- Bcrypt
- Nodemailer
- Node-cron
- Helmet + CORS + Rate Limit

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm

### Clone o repositório

```bash
git clone https://github.com/marconesdb/barberflow
cd barberflow
```

### Instale as dependências

```bash
npm install
```

### Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3000

# E-mail (opcional — para envio de confirmações)
MAIL_HOST=smtp.exemplo.com
MAIL_PORT=587
MAIL_USER=seu@email.com
MAIL_PASS=sua_senha
```

### Execute as migrations do banco

```bash
npx prisma migrate dev
```

### (Opcional) Popule o banco com dados iniciais

```bash
npx prisma db seed
```

---

## ▶️ Executando o projeto

### Desenvolvimento

```bash
npm run dev
```

O servidor inicia em `http://localhost:3000` e o frontend em `http://localhost:5173`.

### Build para produção

```bash
npm run build
```

---

## 🗂️ Estrutura do Projeto

```
barberflow/
├── frontend/
│   └── src/
│       ├── components/       # Componentes reutilizáveis
│       ├── pages/            # Páginas da aplicação
│       │   ├── admin/        # Painel administrativo
│       │   ├── agendar/      # Fluxo de agendamento
│       │   └── perfil/       # Perfil do usuário
│       ├── services/         # Configuração do Axios
│       ├── store/            # Zustand (authStore)
│       └── styles/           # CSS global e print
├── prisma/
│   ├── schema.prisma         # Modelos do banco
│   └── seed.ts               # Dados iniciais
├── server.ts                 # Entry point do servidor
└── .env                      # Variáveis de ambiente
```

---

## ✨ Funcionalidades

### Cliente
- 📅 Agendamento em 4 passos (serviço → barbeiro → data/hora → confirmação)
- 🖨️ Emissão de comprovante em PDF
- 👤 Gerenciamento de perfil
- 🔐 Autenticação com Google OAuth

### Administrador
- 📋 Extrato completo de agendamentos com filtros
- 🖨️ Impressão do extrato em PDF
- 📆 Calendário de gestão com bloqueio de dias
- 📊 Cards de resumo (total, confirmados, cancelados, receita)
- 🔒 Bloqueio/liberação de datas

---

## 🌐 Deploy

O projeto está configurado para deploy na **Vercel**.

```bash
vercel --prod
```

> **Atenção:** configure as variáveis de ambiente no painel da Vercel antes do deploy.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com ❤️ para barbearias modernas</p>