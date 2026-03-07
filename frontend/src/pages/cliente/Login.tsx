import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v3';
import { motion } from 'motion/react';
import { Scissors, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// ─── Schemas ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().optional(),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((d) => d.senha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [modo, setModo] = useState<'login' | 'register'>('login');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  // ─── Login Form ─────────────────────────────────────────────────────────
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.user, res.data.token);
      toast.success(`Bem-vindo de volta, ${res.data.user.nome}!`);
      navigate(res.data.user.papel === 'ADMIN' ? '/admin' : '/perfil');
    } catch {
      // erro já tratado pelo interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        telefone: data.telefone,
      });
      setAuth(res.data.user, res.data.token);
      toast.success('Conta criada com sucesso!');
      navigate('/perfil');
    } catch {
      // erro já tratado pelo interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (cred: CredentialResponse) => {
    if (!cred.credential) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/google', { idToken: cred.credential });
      setAuth(res.data.user, res.data.token);
      toast.success(`Bem-vindo, ${res.data.user.nome}!`);
      navigate('/perfil');
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-zinc-900 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-900 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>

        <div className="bg-white p-10 rounded-[48px] border border-zinc-100 shadow-2xl space-y-8">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-[24px] shadow-xl rotate-3">
              <Scissors className="text-white w-10 h-10" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-zinc-900 font-display">
                {modo === 'login' ? 'BEM-VINDO' : 'CRIAR CONTA'}
              </h2>
              <p className="text-zinc-500 font-medium mt-1">
                {modo === 'login' ? 'Acesse sua conta BarberFlow' : 'Junte-se à família BarberFlow'}
              </p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setModo(m)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  modo === m ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {modo === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <div className="relative">
                <Input
                  label="Senha"
                  type={showSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={loginForm.formState.errors.senha?.message}
                  {...loginForm.register('senha')}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  className="absolute right-4 top-9 text-zinc-400 hover:text-zinc-900"
                >
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <a href="#" className="text-xs font-bold text-zinc-900 hover:underline uppercase tracking-widest">
                  Esqueceu a senha?
                </a>
              </div>
              <Button type="submit" isLoading={loading} className="w-full py-5 text-base rounded-2xl shadow-xl shadow-zinc-900/20">
                ENTRAR NA CONTA
              </Button>
            </form>
          )}

          {/* Register Form */}
          {modo === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <Input
                label="Nome completo"
                placeholder="João da Silva"
                error={registerForm.formState.errors.nome?.message}
                {...registerForm.register('nome')}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
              />
              <Input
                label="Telefone (opcional)"
                placeholder="(11) 99999-9999"
                {...registerForm.register('telefone')}
              />
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                error={registerForm.formState.errors.senha?.message}
                {...registerForm.register('senha')}
              />
              <Input
                label="Confirmar senha"
                type="password"
                placeholder="••••••••"
                error={registerForm.formState.errors.confirmarSenha?.message}
                {...registerForm.register('confirmarSenha')}
              />
              <Button type="submit" isLoading={loading} className="w-full py-5 text-base rounded-2xl shadow-xl shadow-zinc-900/20 mt-2">
                CRIAR MINHA CONTA
              </Button>
            </form>
          )}

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Ou continue com
              </span>
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Falha ao autenticar com Google')}
              shape="pill"
              size="large"
              text={modo === 'login' ? 'signin_with' : 'signup_with'}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}