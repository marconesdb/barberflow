import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Scissors, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-zinc-900 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-zinc-900 blur-[100px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors font-bold text-sm uppercase tracking-widest mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>

        <div className="bg-white p-12 rounded-[48px] border border-zinc-100 shadow-2xl space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-[24px] shadow-xl rotate-3">
              <Scissors className="text-white w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter text-zinc-900 font-display">BEM-VINDO</h2>
              <p className="text-zinc-500 font-medium">Acesse sua conta BarberFlow</p>
            </div>
          </div>

          <form className="space-y-6">
            <div className="space-y-4">
              <Input label="E-mail" type="email" placeholder="seu@email.com" className="py-4 rounded-2xl" />
              <Input label="Senha" type="password" placeholder="••••••••" className="py-4 rounded-2xl" />
            </div>
            
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer hover:text-zinc-900 transition-colors">
                <input type="checkbox" className="rounded-md border-zinc-200 text-zinc-900 focus:ring-zinc-900" />
                Lembrar de mim
              </label>
              <a href="#" className="text-zinc-900 hover:underline">Esqueceu a senha?</a>
            </div>

            <Button className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-zinc-900/20">ENTRAR NA CONTA</Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="px-4 bg-white text-zinc-400">Ou continue com</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" className="w-full py-5 rounded-2xl flex gap-3 font-bold">
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              GOOGLE ACCOUNT
            </Button>
          </div>

          <p className="text-center text-sm font-medium text-zinc-500">
            Novo por aqui? <a href="#" className="font-bold text-zinc-900 hover:underline">Crie sua conta</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
