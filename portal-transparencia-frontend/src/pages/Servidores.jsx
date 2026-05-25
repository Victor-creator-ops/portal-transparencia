import { useState } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

function Servidores() {
  const [servidores, setServidores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  
  // Controle de estado para saber se a tela está "virgem"
  const [buscaRealizada, setBuscaRealizada] = useState(false);

  // Estados dos Filtros (Iniciam vazios - Default Não Pesquisável)
  const [termoBusca, setTermoBusca] = useState('');
  const [estadoSelecionado, setEstadoSelecionado] = useState('');
  const [orgaoSelecionado, setOrgaoSelecionado] = useState('');
  const [tipoServidor, setTipoServidor] = useState(''); 
  const [situacaoServidor, setSituacaoServidor] = useState(''); 

  const [paginaAtual, setPaginaAtual] = useState(1);

  const orgaosFederais = [
    { value: '10000', label: 'Presidência da República' },
    { value: '26000', label: 'MEC - Ministério da Educação' },
    { value: '36000', label: 'MS - Ministério da Saúde' },
    { value: '30000', label: 'MJ - Ministério da Justiça e Segurança Pública' },
    { value: '40000', label: 'ME - Ministério da Economia / Fazenda' },
    { value: '55000', label: 'MDS - Desenvolvimento Social' }
  ];

  const buscarServidores = (pagina) => {
    // Bloqueia a pesquisa se os filtros estiverem no "Default"
    if (!estadoSelecionado || !orgaoSelecionado || !tipoServidor || !situacaoServidor) {
      setErro('Por favor, selecione o Órgão, Estado, Tipo e Situação para liberar a pesquisa.');
      return;
    }

    setLoading(true);
    setErro('');
    setPaginaAtual(pagina);
    
    // A mágica acontece aqui: apaga os dados antigos instantaneamente
    setServidores([]); 
    setBuscaRealizada(true);

    api.get('/servidores', { 
      params: { 
        estado: estadoSelecionado, 
        pagina: pagina, 
        qtdPaginas: 1, 
        orgao: orgaoSelecionado,
        tipoServidor: tipoServidor,
        situacaoServidor: situacaoServidor,
        nome: termoBusca
      } 
    })
      .then(response => {
        const respostaApi = response.data;
        if (respostaApi && respostaApi.sucesso) {
          setServidores(respostaApi.dados || []);
          if (respostaApi.dados.length === 0) {
            setErro('Nenhum servidor foi encontrado com os filtros informados.');
          }
        } else {
          setErro(respostaApi.mensagem || 'Aconteceu um erro ao processar os dados.');
        }
        setLoading(false);
      })
      .catch(error => {
        setErro(error.response?.data?.mensagem || '⚠️ O portal do governo está instável e recusou a conexão. Tente novamente.');
        setLoading(false);
      });
  };

  const handlePesquisaSubmit = (e) => {
    e.preventDefault();
    buscarServidores(1);
  };

  const limparFiltros = () => {
    // Retorna tudo para o default não pesquisável e zera a tela
    setTermoBusca('');
    setEstadoSelecionado('');
    setOrgaoSelecionado('');
    setTipoServidor('');
    setSituacaoServidor('');
    setServidores([]);
    setErro('');
    setBuscaRealizada(false);
    setPaginaAtual(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal de Servidores Públicos"
        description="Consulte ativamente a base de servidores do Governo Federal através de filtros combinados e pesquisa por nome."
      />

      <form onSubmit={handlePesquisaSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Digite o nome do servidor (opcional)..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-sm rounded-xl p-3 outline-none focus:border-blue-500 shadow-sm transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="md:w-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-8 py-3 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            Pesquisar
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 pt-2 border-t border-slate-100">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Órgão de Exercício</label>
            <select value={orgaoSelecionado} onChange={(e) => setOrgaoSelecionado(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none">
              <option value="">Selecione...</option>
              {orgaosFederais.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Estado (UF)</label>
            <select value={estadoSelecionado} onChange={(e) => setEstadoSelecionado(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none">
              <option value="">Selecione...</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              <option value="DF">Distrito Federal</option>
              <option value="BA">Bahia</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="PR">Paraná</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Tipo</label>
            <select value={tipoServidor} onChange={(e) => setTipoServidor(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none">
              <option value="">Selecione...</option>
              <option value="1">Civil</option>
              <option value="2">Militar</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase">Situação</label>
            <select value={situacaoServidor} onChange={(e) => setSituacaoServidor(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm outline-none">
              <option value="">Selecione...</option>
              <option value="1">Ativo</option>
              <option value="2">Inativo / Aposentado</option>
              <option value="3">Pensionista</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={limparFiltros} className="text-xs font-bold text-slate-500 hover:text-red-600 transition underline">
            Limpar todos os filtros
          </button>
        </div>
      </form>

      {erro && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl font-medium shadow-sm border border-amber-200">
          {erro}
        </div>
      )}

      {/* Estado Inicial (Default) */}
      {!buscaRealizada && !loading && !erro && (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-slate-400">
          <p className="font-bold">Nenhuma pesquisa realizada</p>
          <p className="text-sm mt-1">Preencha os filtros acima e clique em "Pesquisar" para listar os servidores.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-bold animate-pulse text-sm">Consultando registros na API do Governo...</p>
        </div>
      )}

      {!loading && buscaRealizada && servidores.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nome do Servidor</th>
                  <th className="px-6 py-4">CPF</th>
                  <th className="px-6 py-4">Órgão de Lotação</th>
                  <th className="px-6 py-4">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {servidores.map((item, index) => {
                  const nomeServidor = item.servidor?.pessoa?.nome || item.servidor?.nome || 'Nome não informado';
                  const cpfServidor = item.servidor?.pessoa?.cpfFormatado || item.servidor?.cpfFormatado || '***.***.***-**';
                  const nomeOrgao = item.orgaoServidorLotacao?.nome || item.orgaoLotacao?.nome || 'Órgão Federal';
                  const situacaoDesc = item.situacao?.descricao || item.situacao || 'Indefinida';

                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{nomeServidor}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {cpfServidor}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium truncate max-w-[250px]">{nomeOrgao}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${situacaoDesc.includes('Ativo') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {situacaoDesc}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center p-4 bg-slate-50 border-t border-slate-200">
            <button 
              disabled={paginaAtual === 1 || loading} 
              onClick={() => buscarServidores(Math.max(1, paginaAtual - 1))} 
              className="px-4 py-2 text-xs font-bold rounded-xl bg-white border border-slate-300 shadow-sm hover:bg-slate-100 disabled:opacity-40 transition"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-600">Página {paginaAtual}</span>
            <button 
              disabled={servidores.length === 0 || loading} 
              onClick={() => buscarServidores(paginaAtual + 1)} 
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 transition"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servidores;