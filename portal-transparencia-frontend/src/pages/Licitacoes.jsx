import { useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

function Licitacoes() {
  const [licitacoesBase, setLicitacoesBase] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // Estados da Busca Local (Filtros)
  const [anoInput, setAnoInput] = useState('');
  const [orgaoInput, setOrgaoInput] = useState('');
  const [situacaoInput, setSituacaoInput] = useState('');
  const [termoInput, setTermoInput] = useState('');
  const [valorMinInput, setValorMinInput] = useState('');
  const [valorMaxInput, setValorMaxInput] = useState('');
  const [filtrosAtivos, setFiltrosAtivos] = useState(null);
  
  // Estado de Ordenação da Tabela (Sort)
  const [ordenacao, setOrdenacao] = useState({ campo: '', direcao: 'asc' });

  // Paginação
  const [paginaTabela, setPaginaTabela] = useState(1);
  const itensPorPagina = 10;

  // Estados da Sincronização API GOV
  const [modoSincronizar, setModoSincronizar] = useState(false);
  const [sincronizandoGov, setSincronizandoGov] = useState(false);
  const [orgaoSinc, setOrgaoSinc] = useState('26000'); 
  const [anoSinc, setAnoSinc] = useState('2024');
  const [mesSinc, setMesSinc] = useState('01');

  const orgaosFederais = [
    { value: '26000', label: 'MEC - Ministério da Educação' },
    { value: '36000', label: 'MS - Ministério da Saúde' },
    { value: '30000', label: 'MJ - Ministério da Justiça e Segurança Pública' },
    { value: '40000', label: 'ME - Ministério da Economia / Fazenda' },
    { value: '55000', label: 'MDS - Desenvolvimento Social' }
  ];

  const normalizarTexto = (texto) => {
    return (texto || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  };

  // 1. PESQUISA LOCAL NO BANCO
  const handlePesquisaSubmit = (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setErro('');
    setBuscaRealizada(true);
    setPaginaTabela(1);
    
    api.get('/licitacoes')
      .then(response => {
        const respostaApi = response.data;
        if (respostaApi && respostaApi.sucesso) {
          setLicitacoesBase(respostaApi.dados || []);
          setFiltrosAtivos({ 
            ano: anoInput, 
            orgao: orgaoInput, 
            situacao: situacaoInput, 
            termo: termoInput,
            valorMin: valorMinInput,
            valorMax: valorMaxInput
          });
        } else {
          setErro(respostaApi?.mensagem || 'Aconteceu um erro ao processar os dados.');
          setLicitacoesBase([]);
        }
        setLoading(false);
      })
      .catch(error => {
        setErro('Falha de comunicação com o banco de dados local.');
        setLicitacoesBase([]);
        setLoading(false);
      });
  };

  // 2. SINCRONIZAÇÃO COM A API DO GOVERNO
  const handleSincronizarGov = async (e) => {
    e.preventDefault();
    setSincronizandoGov(true);
    const ultimoDia = new Date(anoSinc, parseInt(mesSinc), 0).getDate();
    const dataInicial = `01/${mesSinc}/${anoSinc}`;
    const dataFinal = `${ultimoDia}/${mesSinc}/${anoSinc}`;
    
    try {
      const response = await api.post(`/licitacoes/sincronizar-gov?dataInicial=${dataInicial}&dataFinal=${dataFinal}&orgao=${orgaoSinc}`);
      alert(`✅ Sucesso no período de ${dataInicial} a ${dataFinal}! \n\n${response.data?.mensagem}`);
      setModoSincronizar(false);
      handlePesquisaSubmit(); 
    } catch (err) {
      alert('❌ Erro de conexão com o Portal da Transparência em Brasília.');
    } finally {
      setSincronizandoGov(false);
    }
  };

  const limparFiltros = () => {
    setAnoInput(''); setOrgaoInput(''); setSituacaoInput(''); setTermoInput(''); setValorMinInput(''); setValorMaxInput('');
    setFiltrosAtivos(null); setLicitacoesBase([]); setBuscaRealizada(false); setErro(''); setPaginaTabela(1);
    setOrdenacao({ campo: '', direcao: 'asc' });
  };

  // 3. FUNÇÃO DE ORDENAÇÃO (SORT)
  const handleOrdenar = (campo) => {
    setOrdenacao(prev => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  // 4. FILTRAGEM LOCAL DOS DADOS
  let licitacoesProcessadas = licitacoesBase.filter(licitacao => {
    if (!filtrosAtivos) return true;

    const orgaoDb = normalizarTexto(licitacao.orgao);
    const objetoDb = normalizarTexto(licitacao.objeto);
    const situacaoDb = normalizarTexto(licitacao.situacao);
    const anoDb = (licitacao.ano || '').toString();
    const valorDb = Number(licitacao.valor) || 0;

    const orgaoFiltro = normalizarTexto(filtrosAtivos.orgao);
    const termoFiltro = normalizarTexto(filtrosAtivos.termo);
    const situacaoFiltro = normalizarTexto(filtrosAtivos.situacao);
    const anoFiltro = filtrosAtivos.ano;
    
    const min = filtrosAtivos.valorMin ? Number(filtrosAtivos.valorMin) : 0;
    const max = filtrosAtivos.valorMax ? Number(filtrosAtivos.valorMax) : Infinity;

    return orgaoDb.includes(orgaoFiltro) && 
           objetoDb.includes(termoFiltro) &&
           anoDb.includes(anoFiltro) &&
           situacaoDb.includes(situacaoFiltro) &&
           (valorDb >= min && valorDb <= max);
  });

  // 5. PROCESSAMENTO DA ORDENAÇÃO (SORT)
  if (ordenacao.campo) {
    licitacoesProcessadas.sort((a, b) => {
      let valA, valB;

      switch (ordenacao.campo) {
        case 'numero':
          valA = a.numero || ''; valB = b.numero || '';
          break;
        case 'orgao':
          valA = a.orgao || ''; valB = b.orgao || '';
          break;
        case 'objeto':
          valA = a.objeto || ''; valB = b.objeto || '';
          break;
        case 'situacao':
          valA = a.situacao || ''; valB = b.situacao || '';
          break;
        case 'valor':
          valA = Number(a.valor) || 0; valB = Number(b.valor) || 0;
          return ordenacao.direcao === 'asc' ? valA - valB : valB - valA;
        default:
          return 0;
      }

      if (normalizarTexto(valA) < normalizarTexto(valB)) return ordenacao.direcao === 'asc' ? -1 : 1;
      if (normalizarTexto(valA) > normalizarTexto(valB)) return ordenacao.direcao === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const indiceInicial = (paginaTabela - 1) * itensPorPagina;
  const licitacoesPaginadas = licitacoesProcessadas.slice(indiceInicial, indiceInicial + itensPorPagina);
  const totalPaginasTabela = Math.ceil(licitacoesProcessadas.length / itensPorPagina) || 1;

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

  const RenderSortIcon = ({ campo }) => {
    if (ordenacao.campo !== campo) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-blue-600 ml-1">{ordenacao.direcao === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel de Licitações"
        description="Acompanhe ativamente os processos de compras e contratações do Governo Federal."
      >
        <button
          onClick={() => setModoSincronizar(!modoSincronizar)}
          className="rounded-full border border-emerald-600 bg-emerald-50 px-5 py-2 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 flex items-center gap-2"
        >
          {modoSincronizar ? 'Fechar Painel' : '⬇️ Sincronizar da API Oficial'}
        </button>
      </PageHeader>

      {/* PAINEL DE SINCRONIZAÇÃO */}
      {modoSincronizar && (
        <form onSubmit={handleSincronizarGov} className="bg-emerald-900 rounded-2xl p-6 shadow-md text-white space-y-4 border border-emerald-700">
          <div>
            <h3 className="font-bold text-lg text-emerald-100">Buscador Oficial do Portal da Transparência</h3>
            <p className="text-xs text-emerald-300 mt-1">O sistema extrairá as licitações de Brasília limitadas ao período de 1 mês para garantir estabilidade.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-emerald-800 pt-4">
            <div className="flex flex-col"><label className="text-xs font-bold text-emerald-200 mb-1">Órgão para consultar</label>
              <select value={orgaoSinc} onChange={e => setOrgaoSinc(e.target.value)} className="p-3 rounded-xl bg-emerald-800 border-none outline-none text-sm font-medium text-white">
                {orgaosFederais.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col"><label className="text-xs font-bold text-emerald-200 mb-1">Mês</label>
              <select value={mesSinc} onChange={e => setMesSinc(e.target.value)} className="p-3 rounded-xl bg-emerald-800 border-none outline-none text-sm font-medium text-white">
                <option value="01">Janeiro</option><option value="02">Fevereiro</option><option value="03">Março</option>
                <option value="04">Abril</option><option value="05">Maio</option><option value="06">Junho</option>
                <option value="07">Julho</option><option value="08">Agosto</option><option value="09">Setembro</option>
                <option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
              </select>
            </div>
            <div className="flex flex-col"><label className="text-xs font-bold text-emerald-200 mb-1">Ano de Exercício</label>
              <select value={anoSinc} onChange={e => setAnoSinc(e.target.value)} className="p-3 rounded-xl bg-emerald-800 border-none outline-none text-sm font-medium text-white">
                <option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={sincronizandoGov} className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-2.5 px-6 rounded-xl shadow-sm transition disabled:opacity-50">
              {sincronizandoGov ? '⏳ Conectando em Brasília (Aguarde)...' : 'Iniciar Sincronização'}
            </button>
          </div>
        </form>
      )}

      {/* PAINEL DE BUSCA LOCAL AVANÇADO */}
      <form onSubmit={handlePesquisaSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text" placeholder="Buscar por palavras no objeto (ex: computadores, asfalto, hospital)..."
            value={termoInput} onChange={(e) => setTermoInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-sm rounded-xl p-3 outline-none focus:border-blue-500 shadow-sm transition"
          />
          <button type="submit" disabled={loading} className="md:w-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-sm transition disabled:opacity-50">
            Pesquisar
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-5 pt-2 border-t border-slate-100 items-end">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Filtrar Órgão</label>
            <select value={orgaoInput} onChange={(e) => setOrgaoInput(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none">
              <option value="">Todos os Órgãos</option>
              <option value="educacao">MEC - Ministério da Educação</option>
              <option value="saude">MS - Ministério da Saúde</option>
              <option value="justica">MJ - Ministério da Justiça e Segurança Pública</option>
              <option value="economia">ME - Ministério da Economia / Fazenda</option>
              <option value="desenvolvimento">MDS - Desenvolvimento Social</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Ano do Processo</label>
            <select value={anoInput} onChange={(e) => setAnoInput(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none">
              <option value="">Todos os Anos</option>
              <option value="2023">2023</option><option value="2024">2024</option><option value="2025">2025</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Situação</label>
            <select value={situacaoInput} onChange={(e) => setSituacaoInput(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none">
              <option value="">Todas as Situações</option>
              <option value="homologada">Homologada / Concluída</option>
              <option value="andamento">Em Andamento</option>
              <option value="revogada">Revogada / Cancelada</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Valor Mínimo (R$)</label>
            <input type="number" min="0" placeholder="Ex: 5000" value={valorMinInput} onChange={(e) => setValorMinInput(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none" />
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-slate-600 uppercase">Valor Máximo (R$)</label>
            <input type="number" min="0" placeholder="Ex: 100000" value={valorMaxInput} onChange={(e) => setValorMaxInput(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" onClick={limparFiltros} className="text-xs font-bold text-slate-500 hover:text-red-600 transition underline">Limpar todos os filtros e ordenações</button>
        </div>
      </form>

      {erro && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl font-bold shadow-sm border border-red-200 text-center">{erro}</div>
      )}

      {!buscaRealizada && !loading && !erro && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-400">
          <p className="font-bold">A base local está pronta</p>
          <p className="text-sm mt-1">Clique em "Pesquisar" para consultar ou sincronize novos dados da API do Governo.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-bold animate-pulse text-sm">Carregando dados da base...</p>
        </div>
      )}

      {!loading && buscaRealizada && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200 select-none">
                <tr>
                  <th onClick={() => handleOrdenar('numero')} className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition">
                    Número/Ano <RenderSortIcon campo="numero" />
                  </th>
                  <th onClick={() => handleOrdenar('orgao')} className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition">
                    Órgão Solicitante <RenderSortIcon campo="orgao" />
                  </th>
                  <th onClick={() => handleOrdenar('objeto')} className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition">
                    Objeto da Compra <RenderSortIcon campo="objeto" />
                  </th>
                  <th onClick={() => handleOrdenar('situacao')} className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition">
                    Situação <RenderSortIcon campo="situacao" />
                  </th>
                  <th onClick={() => handleOrdenar('valor')} className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition text-right">
                    Valor Consolidado <RenderSortIcon campo="valor" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {licitacoesPaginadas.map((licitacao) => (
                  <tr key={licitacao.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{licitacao.numero}</td>
                    <td className="px-6 py-4 text-blue-800 font-bold max-w-[200px] truncate">{licitacao.orgao}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-[350px] truncate" title={licitacao.objeto}>{licitacao.objeto}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${(licitacao.situacao || '').toLowerCase().includes('homologada') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {licitacao.situacao}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-right">{formatarMoeda(licitacao.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {licitacoesProcessadas.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              Nenhuma licitação localizada com os filtros aplicados.
            </div>
          )}
          
          {totalPaginasTabela > 1 && (
            <div className="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-200">
              <button disabled={paginaTabela === 1} onClick={() => setPaginaTabela(p => p - 1)} className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-300 shadow-sm hover:bg-slate-100 disabled:opacity-40 transition">Anterior</button>
              <span className="text-xs font-bold text-slate-600">Página {paginaTabela} de {totalPaginasTabela}</span>
              <button disabled={paginaTabela === totalPaginasTabela} onClick={() => setPaginaTabela(p => p + 1)} className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 transition">Próxima</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Licitacoes;