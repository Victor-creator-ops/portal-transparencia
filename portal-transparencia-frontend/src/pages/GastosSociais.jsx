import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

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
  const [orgaoSelecionado, setOrgaoSelecionado] = useState('26000'); // Padrão: Educação
  const [termoBuscaTabela, setTermoBuscaTabela] = useState('');
  
  const fileInputRef = useRef(null);

  const buscarGastos = () => {
    setLoading(true);
    const parametros = {};
    if (anoSelecionado) parametros.ano = anoSelecionado;
    if (estadoSelecionado) parametros.estado = estadoSelecionado;

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
  }, [anoSelecionado, estadoSelecionado]);

  const handleUploadCsv = async () => {
    if (!arquivoSelecionado) {
      setMensagemAcao('⚠️ Por favor, selecione um arquivo .csv primeiro.');
      return;
    }
    const formData = new FormData();
    formData.append('arquivo', arquivoSelecionado);
    setUploading(true);
    setMensagemAcao('');

    try {
      await api.post('/gastos/importar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMensagemAcao('✅ Lote CSV processado com sucesso!');
      setArquivoSelecionado(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      buscarGastos();
      setTimeout(() => setMensagemAcao(''), 6000);
    } catch (error) {
      setMensagemAcao('❌ Erro ao processar o lote de dados.');
    } finally {
      setUploading(false);
    }
  };

  const handleSincronizacaoGov = async () => {
    setSincronizandoGov(true);
    setMensagemAcao('⏳ Conectando aos servidores de Brasília...');
    const estadoParaSalvar = estadoSelecionado || 'DF';

    try {
      // Enviando Ano, Estado E ÓRGÃO na requisição!
      const anoParaBuscar = anoSelecionado || '2024'; // Força 2024 se estiver "Todos"
      const response = await api.post(`/gastos/sincronizar-gov?ano=${anoParaBuscar}&pagina=1&estado=${estadoParaSalvar}&orgao=${orgaoSelecionado}`);
      setMensagemAcao(`🏛️ ${response.data}`);
      buscarGastos();
      setTimeout(() => setMensagemAcao(''), 6000);
    } catch (error) {
      setMensagemAcao('❌ Erro ao conectar com o Portal da Transparência.');
    } finally {
      setSincronizandoGov(false);
    }
  };

  // 🔥 Nova Função: Botão do Pânico
  const handleLimparBase = async () => {
    const confirmar = window.confirm("⚠️ ATENÇÃO: Tem certeza que deseja apagar TODOS os registros do banco de dados? Esta ação não pode ser desfeita.");
    
    if (confirmar) {
      setMensagemAcao('🗑️ Apagando registros...');
      try {
        await api.delete('/gastos/limpar');
        setMensagemAcao('✅ Base de dados limpa com sucesso!');
        buscarGastos(); // Recarrega a tabela (que vai ficar vazia)
        setTimeout(() => setMensagemAcao(''), 6000);
      } catch (error) {
        setMensagemAcao('❌ Erro ao tentar limpar a base.');
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
      <header className="mb-6 border-b pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Despesas e Gastos Sociais</h1>
          <p className="text-gray-600 mt-2">Acompanhe a execução financeira dos recursos aplicados diretamente em áreas sociais.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium text-sm">Exercício:</label>
            <select value={anoSelecionado} onChange={(e) => setAnoSelecionado(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-md p-2 focus:ring-blue-500">
              <option value="">Todos os Anos</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
            <label className="text-gray-700 font-medium text-sm">Estado (UF):</label>
            <select value={estadoSelecionado} onChange={(e) => setEstadoSelecionado(e.target.value)} className="bg-gray-50 border border-gray-300 text-sm rounded-md p-2 focus:ring-blue-500">
              <option value="">Todos os Estados</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
            </select>
          </div>
        </div>
      </header>

      <section className="mb-8 bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Painel Administrativo: Gestão de Dados</h3>
          {mensagemAcao && <span className={`text-sm font-bold ${mensagemAcao.includes('❌') ? 'text-red-600' : 'text-emerald-600'}`}>{mensagemAcao}</span>}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 mb-3">1. CARGA MANUAL (CSV)</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="file" accept=".csv" ref={fileInputRef} onChange={(e) => setArquivoSelecionado(e.target.files[0])} className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 w-full" />
              <button onClick={handleUploadCsv} disabled={uploading || sincronizandoGov} className="px-4 py-1.5 rounded-md font-bold text-white text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400">Processar CSV</button>
            </div>
          </div>

          <div className="flex-[1.5] bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between border-l-4 border-l-emerald-500">
            <div>
              <h4 className="text-xs font-bold text-slate-500 mb-2">2. INTEGRAÇÃO DIRETA (GOV.BR)</h4>
              <select value={orgaoSelecionado} onChange={(e) => setOrgaoSelecionado(e.target.value)} className="w-full bg-gray-50 border border-gray-300 text-sm rounded-md p-2 mb-3">
                <option value="26000">Ministério da Educação (Educação)</option>
                <option value="36000">Ministério da Saúde (Saúde)</option>
                <option value="55000">Ministério do Desenv. Social (Assistência Social)</option>
              </select>
            </div>
            <button onClick={handleSincronizacaoGov} disabled={uploading || sincronizandoGov} className="w-full px-4 py-2 rounded-md font-bold text-white text-sm bg-emerald-600 hover:bg-emerald-700 shadow-sm">
              {sincronizandoGov ? '⏳ Buscando dados em Brasília...' : '🏛️ Sincronizar Órgão Selecionado'}
            </button>
          </div>

          {/* NOVO: A ZONA DE PERIGO */}
          <div className="flex-1 bg-white p-4 rounded-lg border border-red-200 shadow-sm flex flex-col justify-center items-center">
            <h4 className="text-xs font-bold text-red-500 mb-2 uppercase">Zona de Perigo</h4>
            <p className="text-xs text-gray-500 text-center mb-3">Apaga todo o histórico salvo.</p>
            <button onClick={handleLimparBase} className="w-full px-4 py-2 rounded-md font-bold text-red-600 border border-red-600 hover:bg-red-50 text-sm transition-colors">
              🗑️ Limpar Base de Dados
            </button>
          </div>
        </div>
      </section>

      {/* 🔍 BARRA DE PESQUISA DA TABELA */}
      {!loading && (
        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Filtrar tabela por Área Social (ex: Saúde) ou Estado (ex: SP)..." 
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
            {/* ... THEAD continua igual ... */}
            <tbody className="divide-y divide-gray-100">
              
              {/* 🔥 MUDAMOS PARA gastosFiltrados.map */}
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
          {gastos.length === 0 && <div className="p-6 text-center text-gray-500">Nenhum registro encontrado para os filtros selecionados.</div>}
        </div>
      )}
    </div>
  );
}

export default GastosSociais;