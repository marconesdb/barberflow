import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { Scissors, Calendar, Clock, MapPin, Phone, Instagram, Facebook, ChevronRight, Star, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Admin from './pages/admin/Admin';
import Agendar from './pages/cliente/Agendar';
import Login from './pages/cliente/Login';
import Perfil from './pages/cliente/Perfil';
import { Button } from './components/ui/Button';

// ─── Imagens ────────────────────────────────────────────────────────────────
const IMGS = {
  hero:  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
  shop1: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80',
  shop2: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
};

// ─── Rota protegida para Admin ───────────────────────────────────────────────
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (user.papel !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
};

// ─── Layout ──────────────────────────────────────────────────────────────────
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
              <Scissors className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-zinc-900 font-display">BARBERFLOW</span>
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            <Link to="/" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">Início</Link>
            <a href="/#servicos" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">Serviços</a>
            <Link to="/sobre" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">Sobre</Link>

            {/* ✅ Link Admin — visível só para ADMIN */}
            {user?.papel === 'ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl hover:bg-amber-100 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Link>
            )}

            <Link to="/agendar" className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 active:scale-95">
              Agendar Agora
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Link Admin no mobile */}
                {user.papel === 'ADMIN' && (
                  <Link to="/admin" className="md:hidden flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </Link>
                )}
                <Link to="/perfil" className="hidden md:flex items-center gap-2 text-sm font-bold text-zinc-900 hover:underline">
                  {user.fotoUrl
                    ? <img src={user.fotoUrl} className="w-7 h-7 rounded-full object-cover" alt={user.nome} />
                    : <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold">{user.nome[0]}</div>
                  }
                  {user.nome.split(' ')[0]}
                </Link>
                <button onClick={logout} className="hidden md:block text-xs font-bold text-zinc-400 hover:text-zinc-900">Sair</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-zinc-900 hover:underline md:hidden">Entrar</Link>
                <Link to="/login" className="hidden md:block text-sm font-bold text-zinc-900 hover:underline">Área do Cliente</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24">{children}</main>

      <footer className="bg-zinc-950 text-zinc-400 py-20 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Scissors className="text-zinc-950 w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white font-display">BARBERFLOW</span>
            </div>
            <p className="text-sm leading-relaxed">Elevando o conceito de barbearia com precisão, estilo e atendimento exclusivo.</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-zinc-950 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Navegação</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Início</Link></li>
              <li><Link to="/agendar" className="hover:text-white transition-colors">Agendar Horário</Link></li>
              <li><Link to="/perfil" className="hover:text-white transition-colors">Minha Conta</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Contato</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3"><Phone className="w-4 h-4" /> (11) 99999-9999</li>
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4" /> Av. Paulista, 1000 - SP</li>
              <li className="flex items-center gap-3"><Clock className="w-4 h-4" /> Seg - Sáb: 09h às 20h</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Newsletter</h4>
            <p className="text-sm mb-4">Receba promoções e dicas de estilo.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Seu e-mail" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-white/30" />
              <button className="bg-white text-zinc-950 px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 transition-colors">OK</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-20 pt-8 text-center text-xs">
          &copy; 2024 BarberFlow. Crafted with precision.
        </div>
      </footer>
    </div>
  );
};

// ─── Home ────────────────────────────────────────────────────────────────────
const Home = () => (
  <div className="space-y-32">
    <section className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
      <div className="space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/5 border border-zinc-900/10 text-zinc-900 text-xs font-bold uppercase tracking-widest"
        >
          <Star className="w-3 h-3 fill-zinc-900" /> A Melhor Experiência de Minas Gerais
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 leading-[0.9] font-display"
        >
          ESTILO QUE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">DEFINE VOCÊ.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-xl text-zinc-600 max-w-lg leading-relaxed font-medium"
        >
          Não é apenas um corte. É um ritual de cuidado e confiança. Agende agora e descubra o padrão BarberFlow.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 pt-4"
        >
          <Link to="/agendar" className="bg-zinc-900 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-zinc-800 shadow-2xl shadow-zinc-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
            AGENDAR AGORA <ChevronRight className="w-5 h-5" />
          </Link>
          <a href="#servicos" className="bg-white border-2 border-zinc-100 text-zinc-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-zinc-50 transition-all hover:border-zinc-200">
            VER SERVIÇOS
          </a>
        </motion.div>

        <div className="flex items-center gap-6 pt-8">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} className="w-12 h-12 rounded-full border-4 border-zinc-50 object-cover" alt="User" referrerPolicy="no-referrer" />
            ))}
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-1 text-zinc-900 font-bold"><Star className="w-4 h-4 fill-zinc-900" /> 4.9/5</div>
            <p className="text-zinc-500 font-medium">+2.000 clientes satisfeitos</p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
        className="relative hidden lg:block"
      >
        <div className="absolute -inset-4 bg-zinc-900/5 rounded-[40px] rotate-3"></div>
        <img src={IMGS.hero} className="relative rounded-[32px] shadow-2xl w-full aspect-[4/5] object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Barbeiro BarberFlow" />
        <div className="absolute -bottom-10 -left-10 glass p-8 rounded-3xl shadow-xl animate-float">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center">
              <Calendar className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Próximo Horário</p>
              <p className="text-lg font-bold text-zinc-900">Hoje às 14:30</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>

    <section id="servicos" className="bg-zinc-900 py-32 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-500 blur-[120px] rounded-full"></div>
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h3 className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-sm">Nossa Expertise</h3>
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight font-display">SERVIÇOS DE ELITE</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Corte Moderno', price: '50', desc: 'Degradê, Scissor Cut ou Clássico com finalização premium.', icon: <Scissors className="w-6 h-6" /> },
            { title: 'Barba de Respeito', price: '35', desc: 'Toalha quente, óleos essenciais e alinhamento preciso.', icon: <Star className="w-6 h-6" /> },
            { title: 'Combo Premium', price: '75', desc: 'A experiência completa: Cabelo, Barba e Sobrancelha.', icon: <Star className="w-6 h-6" /> },
          ].map((service, i) => (
            <motion.div key={i} whileHover={{ y: -10 }} className="bg-white/5 border border-white/10 p-10 rounded-[32px] backdrop-blur-sm group hover:bg-white/10 transition-all">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-zinc-900 transition-all text-white">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
              <p className="text-zinc-400 mb-8 leading-relaxed">{service.desc}</p>
              <div className="flex justify-between items-end">
                <div className="text-white">
                  <span className="text-sm font-medium opacity-50">A partir de</span>
                  <div className="text-3xl font-bold">R$ {service.price}</div>
                </div>
                <Link to="/agendar" className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-zinc-900 transition-all">
                  <ChevronRight className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <div className="grid grid-cols-2 gap-4">
          <img src={IMGS.shop1} className="rounded-3xl w-full aspect-[3/4] object-cover mt-12" alt="Interior da BarberFlow" />
          <img src={IMGS.shop2} className="rounded-3xl w-full aspect-[3/4] object-cover" alt="Barbeiro aparando barba" />
        </div>
        <div className="space-y-8">
          <h3 className="text-zinc-900 text-5xl font-bold tracking-tight font-display">MAIS QUE UMA BARBEARIA, UM ESTILO DE VIDA.</h3>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Fundada em 2018, a BarberFlow nasceu com o propósito de resgatar a tradição das barbearias clássicas, unindo-a às técnicas mais modernas de visagismo.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <div className="text-4xl font-black text-zinc-900 mb-2">06+</div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Anos de História</p>
            </div>
            <div>
              <div className="text-4xl font-black text-zinc-900 mb-2">15k</div>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Cortes Realizados</p>
            </div>
          </div>
          <Button className="py-6 px-12 text-lg rounded-2xl">CONHEÇA NOSSA HISTÓRIA</Button>
        </div>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-6 pb-32">
      <div className="bg-zinc-950 rounded-[48px] p-12 md:p-24 text-center space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tighter font-display leading-none">
          PRONTO PARA O SEU <br /> MELHOR VISUAL?
        </h2>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">Não deixe para depois. Garanta seu horário agora mesmo.</p>
        <div className="flex justify-center">
          <Link to="/agendar" className="bg-white text-zinc-950 px-12 py-6 rounded-2xl font-black text-xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10">
            AGENDAR AGORA
          </Link>
        </div>
      </div>
    </section>
  </div>
);

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/"        element={<MainLayout><Home /></MainLayout>} />
        <Route path="/agendar" element={<MainLayout><Agendar /></MainLayout>} />
        <Route path="/perfil"  element={<MainLayout><Perfil /></MainLayout>} />
        <Route path="/login"   element={<Login />} />

        {/* ✅ Rota Admin protegida */}
        <Route path="/admin" element={
          <AdminRoute>
            <MainLayout><Admin /></MainLayout>
          </AdminRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}