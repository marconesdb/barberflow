import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, User, Scissors, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

interface Servico {
  id: string;
  nome: string;
  preco: number;
  duracaoMinutos: number;
  descricao?: string;
}

interface Barbeiro {
  id: string;
  usuario: { nome: string };
  especialidades: string;
}

export default function Agendar() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [selectedBarbeiro, setSelectedBarbeiro] = useState<Barbeiro | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, bRes] = await Promise.all([
          api.get('/servicos'),
          api.get('/barbeiros')
        ]);
        setServicos(sRes.data);
        setBarbeiros(bRes.data);
      } catch (error) {
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAgendar = async () => {
    if (!selectedServico || !selectedBarbeiro || !selectedDate || !selectedTime) {
      toast.error('Preencha todos os campos');
      return;
    }
    const loadingToast = toast.loading('Processando seu agendamento...');
    
    // Simulate API call
    setTimeout(() => {
      toast.dismiss(loadingToast);
      setStep(4);
      toast.success('Agendamento confirmado!');
    }, 1500);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Progress */}
        <div className="md:w-1/3 space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter text-zinc-900 font-display">RESERVE SEU MOMENTO</h2>
            <p className="text-zinc-500 font-medium">Siga os passos para garantir seu horário.</p>
          </div>

          <div className="space-y-4">
            {[
              { id: 1, label: 'Serviço', icon: <Scissors className="w-4 h-4" />, value: selectedServico?.nome },
              { id: 2, label: 'Profissional', icon: <User className="w-4 h-4" />, value: selectedBarbeiro?.usuario.nome },
              { id: 3, label: 'Data e Hora', icon: <Calendar className="w-4 h-4" />, value: selectedDate ? `${selectedDate} às ${selectedTime}` : null },
            ].map((s) => (
              <div 
                key={s.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  step === s.id ? 'border-zinc-900 bg-white shadow-lg' : 'border-zinc-100 bg-zinc-50 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  step >= s.id ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-400'
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Passo 0{s.id}</p>
                  <p className="text-sm font-bold text-zinc-900">{s.value || s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedServico && (
            <div className="glass p-6 rounded-3xl space-y-4">
              <h4 className="font-bold text-zinc-900 uppercase text-xs tracking-widest">Resumo do Pedido</h4>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">{selectedServico.nome}</span>
                <span className="font-bold">R$ {selectedServico.preco.toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-100 pt-4 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-black">R$ {selectedServico.preco.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid gap-4">
                  {servicos.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedServico(s);
                        setStep(2);
                      }}
                      className="group p-6 rounded-[32px] border-2 border-zinc-100 bg-white text-left transition-all hover:border-zinc-900 hover:shadow-xl flex justify-between items-center"
                    >
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-zinc-900">{s.nome}</h3>
                        <p className="text-zinc-500 text-sm">{s.descricao || 'Serviço premium com finalização profissional.'}</p>
                        <div className="flex gap-4 pt-2">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {s.duracaoMinutos} MIN
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-zinc-900">R$ {s.preco.toFixed(0)}</div>
                        <div className="text-zinc-400 group-hover:text-zinc-900 transition-colors">
                          <ChevronRight className="w-6 h-6 ml-auto" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  {barbeiros.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBarbeiro(b);
                        setStep(3);
                      }}
                      className="group p-8 rounded-[40px] border-2 border-zinc-100 bg-white text-center transition-all hover:border-zinc-900 hover:shadow-xl space-y-4"
                    >
                      <img 
                        src={`https://picsum.photos/seed/${b.id}/200/200`} 
                        className="w-24 h-24 rounded-full mx-auto object-cover grayscale group-hover:grayscale-0 transition-all" 
                        alt={b.usuario.nome}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900">{b.usuario.nome}</h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">{b.especialidades}</p>
                      </div>
                      <div className="pt-4">
                        <span className="text-xs font-bold px-3 py-1 bg-zinc-100 rounded-full text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                          SELECIONAR
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
                  &larr; Voltar para serviços
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Selecione a Data</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-6 rounded-3xl border-2 border-zinc-100 bg-white focus:outline-none focus:border-zinc-900 text-lg font-bold"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Horários Disponíveis</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-4 rounded-2xl border-2 font-bold transition-all ${
                            selectedTime === time 
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' 
                            : 'border-zinc-100 bg-white hover:border-zinc-300'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex gap-4">
                  <Button variant="outline" className="flex-1 py-6" onClick={() => setStep(2)}>Voltar</Button>
                  <Button 
                    className="flex-[2] py-6 text-lg" 
                    onClick={handleAgendar}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Finalizar Reserva
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-12 rounded-[48px] border-2 border-zinc-100 text-center space-y-8 shadow-2xl"
              >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tighter text-zinc-900 font-display">TUDO PRONTO!</h2>
                  <p className="text-zinc-500 font-medium text-lg">Seu horário foi reservado com sucesso.</p>
                </div>
                <div className="glass p-8 rounded-3xl text-left space-y-4 max-w-sm mx-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Serviço</span>
                    <span className="font-bold text-zinc-900">{selectedServico?.nome}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Profissional</span>
                    <span className="font-bold text-zinc-900">{selectedBarbeiro?.usuario.nome}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Data</span>
                    <span className="font-bold text-zinc-900">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Horário</span>
                    <span className="font-bold text-zinc-900">{selectedTime}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full py-6" onClick={() => window.location.href = '/'}>Voltar para o Início</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
