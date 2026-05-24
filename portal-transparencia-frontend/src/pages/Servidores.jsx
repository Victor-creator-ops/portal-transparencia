import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

function Servidores() {
  const [servidores, setServidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  // Filtros Avançados
  const [estadoSelecionado, setEstadoSelecionado] = useState('SP');
  const [orgaoSelecionado, setOrgaoSelecionado] = useState('26000');
  const [tipoServidor, setTipoServidor] = useState('1'); // 1 = Civil, 2 = Militar
  const [situacaoServidor, setSituacaoServidor] = useState('1'); // 1 = Ativo, 2 = Inativo, 3 = Pensionista
  const [termoBusca, setTermoBusca] = useState(''); // Campo de texto (Nome)
  
  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [qtdPaginas, setQtdPaginas] = useState(1);

  const buscarServidores = () => {
    // Busca servidores com base nos filtros e paginação atuais.
    setLoading(true);
    setErro('');
    
    api.get('/servidores', { 
      params: { 
        estado: estadoSelecionado, 
        pagina: paginaAtual, 
        qtdPaginas: qtdPaginas, 
        orgao: orgaoSelecionado,
        tipoServidor: tipoServidor,
        situacaoServidor: situacaoServidor,
        nome: termoBusca
      } 
    })
      .then(response => {
        const dados = Array.isArray(response.data) ? response.data : [];
        setServidores(dados);
        setLoading(false);
      })
      .catch(error => {
        setErro('⚠️ Não foi possível obter dados. Ajuste os filtros ou tente novamente.');
        setServidores([]);
        setLoading(false);
      });
  };

  // Define ação para restaurar filtros aos valores iniciais
  const limparFiltros = () => {
    setTermoBusca('');
    setEstadoSelecionado('SP');
    setOrgaoSelecionado('26000');
    setTipoServidor('1');
    setSituacaoServidor('1');
    setPaginaAtual(1);
    setQtdPaginas(1);
    // Após resetar, busca novamente
    setTimeout(buscarServidores, 100);
  };

  useEffect(() => {
    buscarServidores();
  }, [estadoSelecionado, orgaoSelecionado, tipoServidor, situacaoServidor, paginaAtual]); // Dispara sozinho ao mudar os dropdowns

  // Nova função para quando o usuário apertar "Enter" na barra de pesquisa
  const handlePesquisaSubmit = (e) => {
    e.preventDefault();
    setPaginaAtual(1);
    buscarServidores();
  };

  return (
    <div>
      <PageHeader
        title="Servidores Públicos"
        description="Pesquisa avançada na base de servidores do Governo Federal. Encontre resultados com rapidez e filtros intuitivos."
      >
        <form onSubmit={handlePesquisaSubmit} className="flex w-full max-w-lg gap-2">
          <input
            type="text"
            placeholder="Pesquisar por nome do servidor"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>
      </PageHeader>
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Filtrar resultados</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Órgão</label>
                  <select
                    value={orgaoSelecionado}
                    onChange={(e) => { setOrgaoSelecionado(e.target.value); setPaginaAtual(1); }}
                    className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
                  >
                    <option value="26000">MEC - Educação</option>
                    <option value="36000">MS - Saúde</option>
                    <option value="30000">MJ - Justiça</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Estado</label>
                  <select
                    value={estadoSelecionado}
                    onChange={(e) => { setEstadoSelecionado(e.target.value); setPaginaAtual(1); }}
                    className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
                  >
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="DF">DF</option>
                    <option value="BA">BA</option>
                    <option value="RS">RS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo</label>
                  <select
                    value={tipoServidor}
                    onChange={(e) => { setTipoServidor(e.target.value); setPaginaAtual(1); }}
                    className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
                  >
                    <option value="1">Civil</option>
                    <option value="2">Militar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Situação</label>
                  <select
                    value={situacaoServidor}
                    onChange={(e) => { setSituacaoServidor(e.target.value); setPaginaAtual(1); }}
                    className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
                  >
                    <option value="1">Ativo</option>
                    <option value="2">Inativo / Aposentado</option>
                    <option value="3">Pensionista</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={limparFiltros}
                className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                Limpar filtros
              </button>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                Páginas: {qtdPaginas}
              </div>
            </div>
          </div>
        </div>
      </div>

      {erro && <div className="mb-6 bg-amber-50 text-amber-800 p-4 rounded-lg font-medium shadow-sm border border-amber-200">{erro}</div>}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-40 gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 font-bold animate-pulse text-sm">Carregando servidores...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-blue-900 text-white font-bold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Nome do Servidor</th>
                  <th className="px-6 py-4">CPF (Mascarado)</th>
                  <th className="px-6 py-4">Órgão de Lotação</th>
                  <th className="px-6 py-4">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {servidores.map((item, index) => {
                  const nomeServidor = item.servidor?.pessoa?.nome || item.servidor?.nome || 'Nome não informado';
                  const cpfServidor = item.servidor?.pessoa?.cpfFormatado || item.servidor?.cpfFormatado || '***.***.***-**';
                  const nomeOrgao = item.orgaoServidorLotacao?.nome || item.orgaoLotacao?.nome || 'Órgão Federal';
                  const situacaoDesc = item.situacao?.descricao || item.situacao || 'Indefinida';

                  return (
                    <tr key={index} className="hover:bg-blue-50/50">
                      <td className="px-6 py-4 font-bold text-gray-800">{nomeServidor}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">{cpfServidor}</td>
                      <td className="px-6 py-4 text-xs text-gray-700 truncate max-w-xs">{nomeOrgao}</td>
                      <td className="px-6 py-4">
                        <span className={`py-1 px-3 rounded-full text-xs font-semibold ${situacaoDesc.includes('Ativo') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {situacaoDesc}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {servidores.length === 0 && <div className="p-8 text-center text-gray-500">Nenhum servidor encontrado com estes filtros.</div>}
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button disabled={paginaAtual === 1 || loading} onClick={() => setPaginaAtual(p => Math.max(1, p - 1))} className="px-4 py-2 text-xs font-bold rounded-lg bg-white border shadow-sm hover:bg-gray-100 disabled:opacity-50">Anterior</button>
            <span className="font-extrabold text-blue-900 text-sm">Página {paginaAtual}</span>
            <button disabled={servidores.length === 0 || loading} onClick={() => setPaginaAtual(p => p + qtdPaginas)} className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">Próxima</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servidores;