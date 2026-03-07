import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { authRouter } from './routes/auth.routes.js';
import { servicosRouter } from './routes/servicos.routes.js';
import { barbeirosRouter } from './routes/barbeiros.routes.js';
import { agendamentosRouter } from './routes/agendamentos.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = Number(process.env.PORT) || 3333;

// ─── Middlewares globais ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginOpenerPolicy: false,
}));
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// ─── Rotas ──────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',         authRouter);
app.use('/api/servicos',     servicosRouter);
app.use('/api/barbeiros',    barbeirosRouter);
app.use('/api/agendamentos', agendamentosRouter);
app.use('/api/admin',        adminRouter);

// ─── Error handler global ───────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BarberFlow API rodando em http://localhost:${PORT}`);
});