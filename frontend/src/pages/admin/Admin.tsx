import { useState, useEffect } from 'react';
import { Printer, Calendar, Users, Scissors, TrendingUp, Lock, Unlock, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const FERIADOS: Record<string, string> = {
  '2026-01-01': 'Confraternização Universal',
  '2026-02-16': 'Carnaval',
  '2026-02-17': 'Carnaval',
  '2026-02-18': 'Quarta-feira de Cinzas',
  '2026-04-03': 'Sexta-feira Santa',
  '2026-04-05': 'Páscoa',
  '2026-04-21': 'Tiradentes',
  '2026-05-01': 'Dia do Trabalho',
  '2026-06-04': 'Corpus Christi',
  '2026-09-07': 'Independência do Brasil',
  '2026-10-12': 'Nossa Sra. Aparecida',
  '2026-11-02': 'Finados',
  '2026-11-15': 'Proclamação da República',
  '2026-11-20': 'Consciência Negra',
  '2026-12-25': 'Natal',
  '2025-01-01': 'Confraternização Universal',
  '2025-03-03': 'Carnaval',
  '2025-03-04': 'Carnaval',
  '2025-04-18': 'Sexta-feira Santa',
  '2025-04-20': 'Páscoa',
  '2025-04-21': 'Tiradentes',
  '2025-05-01': 'Dia do Trabalho',
  '2025-06-19': 'Corpus Christi',
  '2025-09-07': 'Independência do Brasil',
  '2025-10-12': 'Nossa Sra. Aparecida',
  '2025-11-02': 'Finados',
  '2025-11-15': 'Proclamação da República',
  '2025-11-20': 'Consciência Negra',
  '2025-12-25': 'Natal',
};

interface Agendamento {
  id: string;
  codigoControle: string;
  dataHora: string;
  status: string;
  cliente: { nome: string; email: string; telefone?: string; endereco?: string };
  barbeiro: { usuario: { nome: string } };
  servico: { nome: string; preco: number; duracaoMinutos: number };
}

const STATUS_COLOR: Record<string, string> = {
  CONFIRMADO: 'bg-green-100 text-green-700',
  CANCELADO: 'bg-red-100 text-red-700',
  CONCLUIDO: 'bg-blue-100 text-blue-700',
  PENDENTE: 'bg-yellow-100 text-yellow-700',
};

// ─── Calendário ───────────────────────────────────────────────────────────────
function AdminCalendario({ agendamentos }: { agendamentos: Agendamento[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [bloqueados, setBloqueados] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    api.get('/bloqueios').then(r => {
      setBloqueados(new Set(r.data.map((b: any) => b.data)));
    }).catch(() => {});
  }, []);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const pad = (n: number) => String(n).padStart(2, '0');
  const toKey = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`;
  const agendPorDia = (d: number) => agendamentos.filter(a => a.dataHora.startsWith(toKey(d)));

  const toggleBloqueio = async (key: string) => {
    try {
      if (bloqueados.has(key)) {
        await api.delete(`/bloqueios/${key}`);
        setBloqueados(prev => { const n = new Set(prev); n.delete(key); return n; });
        toast.success('Dia liberado!');
      } else {
        await api.post('/bloqueios', { data: key });
        setBloqueados(prev => new Set(prev).add(key));
        toast.success('Dia bloqueado!');
      }
    } catch {
      toast.error('Erro ao alterar bloqueio');
    }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button type="button" onClick={prevMonth} className="px-3 py-1 rounded-lg border hover:bg-zinc-100 font-bold">‹</button>
        <h3 className="font-black text-zinc-900 uppercase tracking-widest text-sm capitalize">{monthName}</h3>
        <button type="button" onClick={nextMonth} className="px-3 py-1 rounded-lg border hover:bg-zinc-100 font-bold">›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-black text-zinc-400 uppercase tracking-widest">
        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const d = i + 1;
          const key = toKey(d);
          const isFeriado = !!FERIADOS[key];
          const isBloqueado = bloqueados.has(key);
          const isToday = key === `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;
          const agends = agendPorDia(d);
          const isSelected = selectedDay === key;
          return (
            <button type="button" key={d} onClick={() => setSelectedDay(isSelected ? null : key)}
              className={`relative p-1 rounded-xl text-xs font-bold transition-all border-2 min-h-[52px] flex flex-col items-center justify-start pt-1 gap-0.5
                ${isSelected ? 'border-zinc-900 bg-zinc-900 text-white' : ''}
                ${!isSelected && isToday ? 'border-blue-400 bg-blue-50' : ''}
                ${!isSelected && isBloqueado ? 'bg-red-50 border-red-200 text-red-400' : ''}
                ${!isSelected && isFeriado && !isBloqueado ? 'bg-amber-50 border-amber-200' : ''}
                ${!isSelected && !isToday && !isBloqueado && !isFeriado ? 'border-zinc-100 hover:border-zinc-300 bg-white' : ''}
              `}>
              <span>{d}</span>
              {isFeriado && !isSelected && <span className="text-[8px] text-amber-600 font-bold leading-tight">feriado</span>}
              {isBloqueado && !isSelected && <Lock className="w-3 h-3 text-red-400" />}
              {agends.length > 0 && (
                <span className={`text-[9px] font-black px-1 rounded-full ${isSelected ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'}`}>
                  {agends.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-xs pt-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block" /> Hoje</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" /> Feriado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Bloqueado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-zinc-900 inline-block" /> Selecionado</span>
      </div>
      {selectedDay && (
        <div className="border-2 border-zinc-900 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-zinc-900 text-sm">
              {new Date(selectedDay + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
              {FERIADOS[selectedDay] && <span className="ml-2 text-amber-600 text-xs">🎉 {FERIADOS[selectedDay]}</span>}
            </h4>
            <button type="button" onClick={() => setSelectedDay(null)}><X className="w-4 h-4" /></button>
          </div>
          <button type="button" onClick={() => toggleBloqueio(selectedDay)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              bloqueados.has(selectedDay) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}>
            {bloqueados.has(selectedDay) ? <><Unlock className="w-3 h-3" /> Liberar este dia</> : <><Lock className="w-3 h-3" /> Bloquear este dia</>}
          </button>
          {agendPorDia(Number(selectedDay.split('-')[2])).length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Agendamentos</p>
              {agendPorDia(Number(selectedDay.split('-')[2])).map(a => (
                <div key={a.id} className="bg-zinc-50 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{new Date(a.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — {a.servico.nome}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${STATUS_COLOR[a.status] || 'bg-zinc-100'}`}>{a.status}</span>
                  </div>
                  <p className="text-zinc-500">Cliente: {a.cliente.nome}</p>
                  <p className="text-zinc-500">Barbeiro: {a.barbeiro.usuario.nome}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">Nenhum agendamento neste dia.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Admin Principal ──────────────────────────────────────────────────────────
export default function Admin() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'extrato' | 'calendario'>('extrato');

  useEffect(() => {
    api.get('/admin/agendamentos')
      .then(r => setAgendamentos(r.data))
      .catch(() => toast.error('Erro ao carregar agendamentos'))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = agendamentos.filter(a => {
    const matchStatus = filtroStatus === 'TODOS' || a.status === filtroStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.cliente.nome.toLowerCase().includes(q) ||
      a.servico.nome.toLowerCase().includes(q) ||
      a.codigoControle.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalReceita = filtrados
    .filter(a => a.status !== 'CANCELADO')
    .reduce((acc, a) => acc + a.servico.preco, 0);

  // ─── Imprime em nova janela limpa ─────────────────────────────────────────
  const handlePrint = () => {
    const linhas = filtrados.map((a, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'}">
        <td style="font-family:monospace">${a.codigoControle}</td>
        <td>${new Date(a.dataHora).toLocaleDateString('pt-BR')} ${new Date(a.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
        <td><strong>${a.cliente.nome}</strong></td>
        <td>${a.cliente.email}<br/><small>${a.cliente.telefone || '—'}</small></td>
        <td>${a.cliente.endereco || '—'}</td>
        <td><strong>${a.servico.nome}</strong> <small>${a.servico.duracaoMinutos}min</small></td>
        <td>${a.barbeiro.usuario.nome}</td>
        <td><strong>R$ ${a.servico.preco.toFixed(2)}</strong></td>
        <td>${a.status}</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Extrato BarberFlow</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; padding:10mm; font-size:9px; color:#18181b; }
    h1 { font-size:16px; font-weight:900; margin-bottom:2px; }
    .sub { font-size:9px; color:#71717a; margin-bottom:14px; }
    table { width:100%; border-collapse:collapse; }
    th { background:#18181b; color:white; padding:5px 6px; text-align:left; font-size:8px; text-transform:uppercase; letter-spacing:1px; }
    td { padding:4px 6px; border-bottom:1px solid #f4f4f5; font-size:8px; word-break:break-word; }
    tfoot td { font-weight:900; border-top:2px solid #e5e7eb; background:#fafafa; }
    .rodape { text-align:center; font-size:9px; color:#a1a1aa; border-top:1px solid #e5e7eb; padding-top:10px; margin-top:20px; }
    @page { size:A4 landscape; margin:10mm 8mm; }
    @media print { body { margin:0; padding:0; } }
  </style>
</head>
<body>
  <h1>BARBERFLOW — Extrato de Agendamentos</h1>
  <p class="sub">Gerado em ${new Date().toLocaleString('pt-BR')}</p>
  <table>
    <thead>
      <tr>
        <th>Protocolo</th><th>Data/Hora</th><th>Cliente</th><th>Contato</th>
        <th>Endereço</th><th>Serviço</th><th>Barbeiro</th><th>Valor</th><th>Status</th>
      </tr>
    </thead>
    <tbody>${linhas}</tbody>
    <tfoot>
      <tr>
        <td colspan="7">Total (${filtrados.filter(a => a.status !== 'CANCELADO').length} agendamentos)</td>
        <td>R$ ${totalReceita.toFixed(2)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <div class="rodape">
    <strong>BarberFlow — Av. Paulista, 1000 · São Paulo/SP</strong><br/>
    (11) 99999-9999 · contato@barberflow.com.br · Seg a Sáb: 09h às 20h
  </div>
  <script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`;

    const janela = window.open('', '_blank', 'width=1000,height=700');
    if (!janela) {
      toast.error('Permita popups para imprimir');
      return;
    }
    janela.document.write(html);
    janela.document.close();
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 font-display">PAINEL ADMIN</h1>
          <p className="text-zinc-500 font-medium">Extrato de agendamentos e gestão da agenda</p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Imprimir Extrato
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: agendamentos.length, icon: <Scissors className="w-5 h-5" />, color: 'bg-zinc-900 text-white' },
          { label: 'Confirmados', value: agendamentos.filter(a => a.status === 'CONFIRMADO').length, icon: <Calendar className="w-5 h-5" />, color: 'bg-green-600 text-white' },
          { label: 'Cancelados', value: agendamentos.filter(a => a.status === 'CANCELADO').length, icon: <Users className="w-5 h-5" />, color: 'bg-red-500 text-white' },
          { label: 'Receita', value: `R$ ${totalReceita.toFixed(2)}`, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-blue-600 text-white' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`${color} p-6 rounded-3xl space-y-3`}>
            <div className="opacity-70">{icon}</div>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ position: 'relative', zIndex: 50 }}>
        <a href="#extrato" onClick={e => { e.preventDefault(); setTab('extrato'); handlePrint(); }}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'extrato' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
          📋 Extrato
        </a>
        <a href="#calendario" onClick={e => { e.preventDefault(); setTab('calendario'); }}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === 'calendario' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>
          📅 Calendário
        </a>
      </div>

      {/* Tab Extrato */}
      {tab === 'extrato' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cliente, serviço ou protocolo..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-zinc-100 focus:outline-none focus:border-zinc-900 text-sm font-medium" />
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-zinc-100 focus:outline-none focus:border-zinc-900 text-sm font-bold bg-white">
              {['TODOS','CONFIRMADO','CANCELADO','CONCLUIDO','PENDENTE'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-zinc-100 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-white">
                <tr>
                  {['Protocolo','Data/Hora','Cliente','Contato','Endereço','Serviço','Barbeiro','Valor','Status'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtrados.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-zinc-400 font-medium">Nenhum agendamento encontrado.</td></tr>
                ) : filtrados.map((a, i) => (
                  <tr key={a.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} hover:bg-zinc-100 transition-colors`}>
                    <td className="px-4 py-4 font-mono text-xs font-bold text-zinc-500 whitespace-nowrap">{a.codigoControle}</td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium">
                      {new Date(a.dataHora).toLocaleDateString('pt-BR')}{' '}
                      <span className="text-zinc-400 text-xs">{new Date(a.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-4 py-4 font-bold text-zinc-900 whitespace-nowrap">{a.cliente.nome}</td>
                    <td className="px-4 py-4 text-zinc-500 whitespace-nowrap">
                      {a.cliente.email}<br />
                      <span className="text-xs">{a.cliente.telefone || '—'}</span>
                    </td>
                    <td className="px-4 py-4 text-zinc-500 text-xs max-w-[140px]">{a.cliente.endereco || '—'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-bold text-zinc-900">{a.servico.nome}</span><br />
                      <span className="text-xs text-zinc-400">{a.servico.duracaoMinutos}min</span>
                    </td>
                    <td className="px-4 py-4 font-medium whitespace-nowrap">{a.barbeiro.usuario.nome}</td>
                    <td className="px-4 py-4 font-black text-zinc-900 whitespace-nowrap">R$ {a.servico.preco.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap ${STATUS_COLOR[a.status] || 'bg-zinc-100 text-zinc-600'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-50 border-t-2 border-zinc-200">
                <tr>
                  <td colSpan={7} className="px-4 py-4 font-black text-zinc-900 uppercase tracking-widest text-xs">
                    Total ({filtrados.filter(a => a.status !== 'CANCELADO').length} agendamentos)
                  </td>
                  <td className="px-4 py-4 font-black text-zinc-900 text-base">R$ {totalReceita.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab Calendário */}
      {tab === 'calendario' && (
        <div className="max-w-lg">
          <AdminCalendario agendamentos={agendamentos} />
        </div>
      )}

    </div>
  );
}