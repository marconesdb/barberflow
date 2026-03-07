import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Scissors, Star, LogOut, ChevronRight, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

interface Agendamento {
  id: string;
  codigoControle: string;
  dataHora: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';
  servico: { nome: string; preco: number; duracaoMinutos: number };
  barbeiro: { usuario: { nome: string; fotoUrl: string | null } };
  avaliacao: { nota: number; comentario?: string } | null;
}

const STATUS_CONFIG = {
  CONFIRMADO:  { label: 'Confirmado',  color: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="w-4 h-4" /> },
  PENDENTE:    { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-700', icon: <AlertCircle className="w-4 h-4" /> },
  CANCELADO:   { label: 'Cancelado',  color: 'bg-red-100 text-red-700',       icon: <XCircle className="w-4 h-4" /> },
  CONCLUIDO:   { label: 'Concluído',  color: 'bg-zinc-100 text-zinc-600',     icon: <CheckCircle2 className="w-4 h-4" /> },
};

export default function Perfil() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [avaliacaoModal, setAvaliacaoModal] = useState<{ id: string; nota: number; comentario: string } | null>(null);
  const [submittingAvaliacao, setSubmittingAvaliacao] = useState(false);
  const [aba, setAba] = useState<'proximos' | 'historico'>('proximos');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/agendamentos/meus')
      .then((res) => setAgendamentos(res.data))
      .catch(() => toast.error('Erro ao carregar agendamentos'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleCancelar = async (id: string) => {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    setCancelingId(id);
    try {
      await api.patch(`/agendamentos/${id}/cancelar`);
      setAgendamentos((prev) => prev.map((ag) => ag.id === id ? { ...ag, status: 'CANCELADO' } : ag));
      toast.success('Agendamento cancelado.');
    } catch {
    } finally {
      setCancelingId(null);
    }
  };

  const handleAvaliar = async () => {
    if (!avaliacaoModal) return;
    setSubmittingAvaliacao(true);
    try {
      await api.post(`/agendamentos/${avaliacaoModal.id}/avaliar`, {
        nota: avaliacaoModal.nota,
        comentario: avaliacaoModal.comentario || undefined,
      });
      setAgendamentos((prev) =>
        prev.map((ag) =>
          ag.id === avaliacaoModal.id
            ? { ...ag, avaliacao: { nota: avaliacaoModal.nota, comentario: avaliacaoModal.comentario } }
            : ag
        )
      );
      toast.success('Avaliação enviada!');
      setAvaliacaoModal(null);
    } catch {
    } finally {
      setSubmittingAvaliacao(false);
    }
  };

  const agora = new Date();
  const proximos = agendamentos.filter(
    (ag) => new Date(ag.dataHora) >= agora && ag.status !== 'CANCELADO'
  );
  const historico = agendamentos.filter(
    (ag) => new Date(ag.dataHora) < agora || ag.status === 'CANCELADO'
  );
  const lista = aba === 'proximos' ? proximos : historico;

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10">

      {/* Header do perfil */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900 rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
          {user?.fotoUrl
            ? <img src={user.fotoUrl} alt={user.nome} className="w-full h-full object-cover" />
            : <User className="w-10 h-10 text-zinc-400" />
          }
        </div>
        <div className="text-center md:text-left flex-1 space-y-1">
          <h2 className="text-3xl font-black text-white tracking-tight">{user?.nome}</h2>
          <p className="text-zinc-400 font-medium">{user?.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <span className="text-xs font-bold px-3 py-1 bg-white/10 rounded-full text-zinc-300 uppercase tracking-widest">
              {user?.papel}
            </span>
            <span className="text-xs text-zinc-500">{agendamentos.length} agendamentos</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/agendar">
            <Button className="py-3 px-6 bg-white text-zinc-900 hover:bg-zinc-100">
              <Scissors className="w-4 h-4 mr-2" /> Novo Agendamento
            </Button>
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/20 hover:text-white transition-all"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex rounded-2xl overflow-hidden border border-zinc-100 bg-zinc-50 p-1 max-w-xs">
        {(['proximos', 'historico'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setAba(t)}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
              aba === t ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            {t === 'proximos' ? `Próximos (${proximos.length})` : `Histórico (${historico.length})`}
          </button>
        ))}
      </div>

      {/* Lista de agendamentos */}
      {lista.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-10 h-10 text-zinc-400" />
          </div>
          <p className="text-zinc-500 font-medium text-lg">
            {aba === 'proximos' ? 'Nenhum agendamento futuro.' : 'Nenhum histórico ainda.'}
          </p>
          {aba === 'proximos' && (
            <Link to="/agendar">
              <Button className="mt-2">Agendar agora <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {lista.map((ag) => {
            const cfg = STATUS_CONFIG[ag.status];
            const dataFormatada = new Date(ag.dataHora).toLocaleDateString('pt-BR', {
              weekday: 'long', day: '2-digit', month: 'long',
            });
            const horaFormatada = new Date(ag.dataHora).toLocaleTimeString('pt-BR', {
              hour: '2-digit', minute: '2-digit',
            });
            const podeAvaliar = ag.status === 'CONCLUIDO' && !ag.avaliacao;
            const podeCancelar = ag.status === 'CONFIRMADO' && new Date(ag.dataHora) > agora;

            return (
              <motion.div
                key={ag.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] border-2 border-zinc-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-zinc-200 transition-all"
              >
                {/* Avatar barbeiro */}
                <img
                  src={ag.barbeiro.usuario.fotoUrl || `https://picsum.photos/seed/${ag.barbeiro.usuario.nome}/80/80`}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  alt={ag.barbeiro.usuario.nome}
                  referrerPolicy="no-referrer"
                />

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-900">{ag.servico.nome}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm flex items-center gap-1">
                    <User className="w-3 h-3" /> {ag.barbeiro.usuario.nome}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-zinc-400 pt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dataFormatada}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {horaFormatada}</span>
                    <span className="flex items-center gap-1"><Scissors className="w-3 h-3" /> {ag.servico.duracaoMinutos} min</span>
                  </div>
                  {ag.avaliacao && (
                    <div className="flex items-center gap-1 pt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < ag.avaliacao!.nota ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}`} />
                      ))}
                      {ag.avaliacao.comentario && (
                        <span className="text-xs text-zinc-400 ml-1">"{ag.avaliacao.comentario}"</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Preço e ações */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <span className="text-2xl font-black text-zinc-900">R$ {ag.servico.preco.toFixed(0)}</span>
                  <div className="flex gap-2">
                    {podeCancelar && (
                      <button
                        onClick={() => handleCancelar(ag.id)}
                        disabled={cancelingId === ag.id}
                        className="text-xs font-bold px-4 py-2 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        {cancelingId === ag.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                    {podeAvaliar && (
                      <button
                        onClick={() => setAvaliacaoModal({ id: ag.id, nota: 5, comentario: '' })}
                        className="text-xs font-bold px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-700 transition-all flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" /> Avaliar
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">{ag.codigoControle}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Avaliação */}
      {avaliacaoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] p-10 max-w-md w-full space-y-6 shadow-2xl"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900">Como foi o atendimento?</h3>
              <p className="text-zinc-500 text-sm">Sua avaliação ajuda outros clientes a escolher melhor.</p>
            </div>

            {/* Estrelas */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setAvaliacaoModal((prev) => prev ? { ...prev, nota: n } : prev)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-10 h-10 transition-all ${n <= avaliacaoModal.nota ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}`} />
                </button>
              ))}
            </div>

            <textarea
              value={avaliacaoModal.comentario}
              onChange={(e) => setAvaliacaoModal((prev) => prev ? { ...prev, comentario: e.target.value } : prev)}
              placeholder="Deixe um comentário (opcional)..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:outline-none focus:border-zinc-900 text-sm resize-none"
            />

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 py-4" onClick={() => setAvaliacaoModal(null)}>
                Cancelar
              </Button>
              <Button className="flex-1 py-4" isLoading={submittingAvaliacao} onClick={handleAvaliar}>
                Enviar Avaliação
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}