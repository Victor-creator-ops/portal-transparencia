import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

function GastosSociais() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros Combinados
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [estadoSelecionado, setEstadoSelecionado] = useState('');
  
  // Estados do Painel Administrativo
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sincronizandoGov, setSincronizandoGov] = useState(false);
  const [mensagemAcao, setMensagemAcao] = useState('');
  
  // Novo: Estado para escolher o Órgão do Governo
  const [orgaoSelecionado, setOrgaoSelecionado] = useState('');
  const [orgaoTexto, setOrgaoTexto] = useState('');
  const [termoBuscaTabela, setTermoBuscaTabela] = useState('');

  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = Array.from({ length: 5 }, (_, index) => String(anoAtual - index));
  const orgaosFederais = [
    { value: '', label: 'Todos os Órgãos' },
    { value: '10000', label: 'Presidência da República' },
    { value: '26000', label: 'Ministério da Educação' },
    { value: '36000', label: 'Ministério da Saúde' },
    { value: '40000', label: 'Ministério da Economia' },
    { value: '15000', label: 'Ministério da Justiça e Segurança Pública' },
    { value: '55000', label: 'Ministério do Desenvolvimento Social' },
  ];
  const orgaoSelecionadoLabel = orgaosFederais.find(item => item.value === orgaoSelecionado)?.label || orgaoTexto || 'Todos os Órgãos';

  const atualizarOrgaoTexto = (value) => {
    setOrgaoTexto(value);
    const match = orgaosFederais.find(item => item.label === value);
    setOrgaoSelecionado(match ? match.value : '');
  };
  
  const fileInputRef = useRef(null);
  const totalRegistros = gastos.length;
  const registrosExibidos = gastos.filter(gasto => {
    const termo = termoBuscaTabela.toLowerCase();
    const nomeCategoria = gasto.categoriaTematica?.nomeCategoria?.toLowerCase() || '';
    const estado = gasto.estadoUf?.toLowerCase() || '';
    return nomeCategoria.includes(termo) || estado.includes(termo);
  }).length;

  const buscarGastos = () => {
    setLoading(true);
    const parametros = {};
    if (anoSelecionado) parametros.ano = anoSelecionado;
    if (estadoSelecionado) parametros.estado = estadoSelecionado;
    if (orgaoSelecionado) parametros.orgao = orgaoSelecionado;

    api.get('/gastos', { params: parametros })
      .then(response => {
        setGastos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar os gastos:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    buscarGastos();
  }, [anoSelecionado, estadoSelecionado, orgaoSelecionado]);

  const exportarParaExcel = () => {
    const headers = ['Categoria', 'Estado', 'Valor'];
    const csvRows = gastosFiltrados.map(g => [(g.categoriaTematica?.nomeCategoria || '').replace(/,/g, ''), g.estadoUf || '', g.valorGasto].join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const url = window.URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio.csv');
    link.click();
  };

  const handleUploadCsv = async () => {
    if (!arquivoSelecionado) {
      setMensagemAcao('Por favor, selecione um arquivo CSV.');
      return;
    }
    const formData = new FormData();
    formData.append('arquivo', arquivoSelecionado);
    setUploading(true);
    setMensagemAcao('');

    try {
      await api.post('/gastos/importar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMensagemAcao('Lote CSV processado com sucesso.');
      setArquivoSelecionado(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      buscarGastos();
      setTimeout(() => setMensagemAcao(''), 6000);
    } catch (error) {
      setMensagemAcao('Erro ao processar o lote de dados.');
    } finally {
      setUploading(false);
    }
  };

  const handleSincronizacaoGov = async () => {
    setSincronizandoGov(true);
    setMensagemAcao('Buscando dados do governo...');
    const estadoParaSalvar = estadoSelecionado || 'DF';

    try {
      const anoParaBuscar = anoSelecionado || String(anoAtual);
      const orgaoParaBuscar = orgaoSelecionado || '26000';
      const response = await api.post(`/gastos/sincronizar-gov?ano=${anoParaBuscar}&pagina=1&estado=${estadoParaSalvar}&orgao=${orgaoParaBuscar}`);
      setMensagemAcao(response.data || 'Sincronização concluída.');
      buscarGastos();
      setTimeout(() => setMensagemAcao(''), 6000);
    } catch (error) {
      setMensagemAcao('Erro ao conectar com o Portal da Transparência.');
    } finally {
      setSincronizandoGov(false);
    }
  };

  const handleLimparBase = async () => {
    const confirmar = window.confirm('ATENÇÃO: Tem certeza que deseja apagar todos os registros do banco de dados? Esta ação não pode ser desfeita.');
    
    if (confirmar) {
      setMensagemAcao('Apagando registros...');
      try {
        await api.delete('/gastos/limpar');
        setMensagemAcao('Base de dados limpa com sucesso.');
        buscarGastos();
        setTimeout(() => setMensagemAcao(''), 6000);
      } catch (error) {
        setMensagemAcao('Erro ao tentar limpar a base.');
      }
    }
  };

  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  const formatarMes = (mes) => ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][mes - 1];

  // Filtra os gastos baseados no que o usuário digitar na barra de pesquisa
  const gastosFiltrados = gastos.filter(gasto => {
    const termo = termoBuscaTabela.toLowerCase();
    const nomeCategoria = gasto.categoriaTematica?.nomeCategoria?.toLowerCase() || '';
    const estado = gasto.estadoUf?.toLowerCase() || '';
    
    return nomeCategoria.includes(termo) || estado.includes(termo);
  });

  return (
    <div>
      <PageHeader
        title="Despesas e Gastos Sociais"
        description="Acompanhe a execução financeira dos recursos aplicados diretamente em áreas sociais."
      >
        <button
          onClick={exportarParaExcel}
          disabled={loading || totalRegistros === 0}
          className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Exportar CSV
        </button>
      </PageHeader>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Exercício</label>
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
            >
              <option value="">Últimos 5 anos</option>
              {anosDisponiveis.map((ano) => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Órgão</label>
            <select
              value={orgaoSelecionado}
              onChange={(e) => setOrgaoSelecionado(e.target.value)}
              className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
            >
              {orgaosFederais.map((orgao) => (
                <option key={orgao.value} value={orgao.value}>{orgao.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Estado (UF)</label>
            <select
              value={estadoSelecionado}
              onChange={(e) => setEstadoSelecionado(e.target.value)}
              className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none"
            >
              <option value="">Todos os Estados</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 mb-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Resumo dos dados</p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{totalRegistros} registros</p>
              <p className="text-sm text-slate-500">{registrosExibidos} exibidos com base no filtro atual</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Filtrar por Ano</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{anoSelecionado || 'Todos'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Filtrar por Estado</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{estadoSelecionado || 'Todos'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
              <p className="text-sm text-slate-500">Filtrar por Órgão</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{orgaoSelecionadoLabel}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Painel Administrativo</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Gerencie uploads, sincronizações e limpeza de base com controle.</p>
            </div>
            {mensagemAcao && (
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${mensagemAcao.includes('Erro') ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                {mensagemAcao}
              </span>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-white p-4 border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Carga manual (CSV)</p>
              <div className="mt-3 flex flex-col gap-3">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={(e) => setArquivoSelecionado(e.target.files[0])}
                  className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 w-full"
                />
                <button
                  onClick={handleUploadCsv}
                  disabled={uploading || sincronizandoGov}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Processar CSV
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 border border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Integração com governo</p>
              <input
                list="orgaos-list"
                value={orgaoTexto}
                onChange={(e) => atualizarOrgaoTexto(e.target.value)}
                placeholder="Digite ou escolha um órgão federal"
                className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none"
              />
              <datalist id="orgaos-list">
                {orgaosFederais.map((orgao) => (
                  <option key={orgao.value} value={orgao.label} />
                ))}
              </datalist>
              <button
                onClick={handleSincronizacaoGov}
                disabled={uploading || sincronizandoGov}
                className="mt-4 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {sincronizandoGov ? 'Buscando dados em Brasília...' : 'Sincronizar órgão selecionado'}
              </button>
            </div>

            <div className="rounded-3xl bg-red-50 p-4 border border-red-200 text-red-700">
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">Zona de Perigo</p>
              <p className="mt-3 text-sm text-red-600">Apaga todo o histórico salvo. Use apenas em casos de correção completa.</p>
              <button
                onClick={handleLimparBase}
                className="mt-4 w-full rounded-full border border-red-600 bg-white px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                Limpar base de dados
              </button>
            </div>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Filtrar tabela por área social ou estado"
            value={termoBuscaTabela}
            onChange={(e) => setTermoBuscaTabela(e.target.value)}
            className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-3 shadow-sm"
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">Buscando registros financeiros...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 uppercase tracking-wider text-gray-600 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Período</th>
                <th className="px-6 py-4 font-bold">Área Social</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Valor Gasto</th>
                <th className="px-6 py-4 font-bold">Fonte dos Dados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              
              {gastosFiltrados.map((gasto) => (
                <tr key={gasto.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-gray-700 font-medium">{formatarMes(gasto.mesReferencia)} / {gasto.anoExercicio}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold ${gasto.categoriaTematica.nomeCategoria.includes('Educação') ? 'bg-blue-100 text-blue-800' : gasto.categoriaTematica.nomeCategoria.includes('Saúde') ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                      {gasto.categoriaTematica.nomeCategoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{gasto.estadoUf || '-'}</td>
                  <td className="px-6 py-4 font-bold text-red-600 text-right">{formatarMoeda(gasto.valorGasto)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{gasto.fonteDados.nomeFonte}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {gastosFiltrados.length === 0 && <div className="p-6 text-center text-gray-500">Nenhum registro encontrado para os filtros selecionados.</div>}
        </div>
      )}
    </div>
  );
}

export default GastosSociais;