import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'barberflow_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export function gerarToken(userId: string, papel: string) {
  return jwt.sign({ userId, papel }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

function userPayload(u: { id: string; nome: string; email: string; papel: string; fotoUrl: string | null }) {
  return { id: u.id, nome: u.nome, email: u.email, papel: u.papel, fotoUrl: u.fotoUrl };
}

// ─── Register ────────────────────────────────────────────────────────────────
export async function register(data: {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}) {
  const existe = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (existe) throw new AppError('E-mail já cadastrado', 409);

  const senhaHash = await bcrypt.hash(data.senha, 12);
  const usuario = await prisma.usuario.create({
    data: { nome: data.nome, email: data.email, senhaHash, telefone: data.telefone, provedorAuth: 'LOCAL' },
  });

  return { token: gerarToken(usuario.id, usuario.papel), user: userPayload(usuario) };
}

// ─── Login ───────────────────────────────────────────────────────────────────
export async function login(email: string, senha: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.senhaHash) throw new AppError('Credenciais inválidas', 401);
  if (!usuario.ativo) throw new AppError('Conta desativada', 403);

  const ok = await bcrypt.compare(senha, usuario.senhaHash);
  if (!ok) throw new AppError('Credenciais inválidas', 401);

  return { token: gerarToken(usuario.id, usuario.papel), user: userPayload(usuario) };
}

// ─── Google Login ────────────────────────────────────────────────────────────
export async function loginComGoogle(idToken: string) {
  const ticket = await googleClient
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .catch(() => { throw new AppError('Token Google inválido', 401); });

  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError('Payload Google inválido', 401);

  let usuario = await prisma.usuario.findUnique({ where: { email: payload.email } });

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        nome: payload.name || payload.email,
        email: payload.email,
        googleId: payload.sub,
        fotoUrl: payload.picture,
        provedorAuth: 'GOOGLE',
      },
    });
  } else if (!usuario.googleId) {
    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { googleId: payload.sub, fotoUrl: payload.picture, provedorAuth: 'BOTH' },
    });
  }

  return { token: gerarToken(usuario.id, usuario.papel), user: userPayload(usuario) };
}

// ─── Me ──────────────────────────────────────────────────────────────────────
export async function me(userId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { id: true, nome: true, email: true, papel: true, fotoUrl: true, telefone: true },
  });
  if (!usuario) throw new AppError('Usuário não encontrado', 404);
  return usuario;
}