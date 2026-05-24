import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function GastosSociais() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState('');
  
  // Estados do CSV
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Estado da Integração com Governo
  const [sincronizandoGov, setSincronizandoGov] = useState(false);
  
  // Mensagem unificada de feedback
  const [mensagemAcao, setMensagemAcao] = useState('');
  const fileInputRef = useRef(null);

  const buscarGastos = () => {
    setLoading(true);
    const parametros = anoSelecionado ? { ano: anoSelecionado } : {};

    api.get('/gastos', { params: parametros })
      .then(response => {
        setGastos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar os gastos sociais:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    buscarGastos();
  }, [anoSelecionado]);

  // Função 1: Upload de CSV (Local)
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
      await api.post('/gastos/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMensagemAcao('✅ Lote CSV processado com sucesso!');
      setArquivoSelecionado(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      buscarGastos();
      setTimeout(() => setMensagemAcao(''), 6000);
    } catch (error) {
      console.error("Erro na importação:", error);
      setMensagemAcao('❌ Erro ao processar o lote de dados.');
    } finally {
      setUploading(false);
    }
  };

  // Função 2: Integração Direta com Governo Federal (API Gov.br)
  const handleSincronizacaoGov = async () => {
    setSincronizandoGov(true);
    setMensagemAcao('⏳ Conectando aos servidores de Brasília...');

    try {
      // Estamos forçando o ano de 2026 como padrão para o teste
      const response = await api.post('/gastos/sincronizar-gov?ano=2026&pagina=1');
      setMensagemAcao(`🏛️ ${response.data}`);
      buscarGastos();
      setTimeout(() => setMensagemAcao(''), 6000);
    } catch (error) {
      console.error("Erro na sincronização:", error);
      setMensagemAcao('❌ Erro ao conectar com o Portal da Transparência.');
    } finally {
      setSincronizandoGov(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarMes = (mes) => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses[mes - 1];
  };

  return (
    <div>
      <header className="mb-6 border-b pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Despesas e Gastos Sociais</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe a execução financeira dos recursos aplicados diretamente em áreas sociais.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <label htmlFor="filtroAno" className="text-gray-700 font-medium text-sm">Filtrar Exercício:</label>
          <select 
            id="filtroAno"
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 cursor-pointer transition-colors"
          >
            <option value="">Todos os Anos</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </header>

      {/* ÁREA ADMINISTRATIVA UNIFICADA: ETL E INTEGRAÇÃO */}
      <section className="mb-8 bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Painel Administrativo: Carga de Dados</h3>
          {mensagemAcao && (
            <span className={`text-sm font-bold ${mensagemAcao.includes('❌') ? 'text-red-600' : 'text-emerald-600'}`}>
              {mensagemAcao}
            </span>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Coluna 1: Carga Manual (CSV) */}
          <div className="flex-1 bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 mb-3">1. CARGA MANUAL (ARQUIVO LOCAL)</h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="file" 
                accept=".csv"
                ref={fileInputRef}
                onChange={(e) => setArquivoSelecionado(e.target.files[0])}
                className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer w-full"
              />
              <button 
                onClick={handleUploadCsv}
                disabled={uploading || sincronizandoGov}
                className="px-4 py-1.5 rounded-md font-bold text-white text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 whitespace-nowrap transition-colors"
              >
                {uploading ? 'Enviando...' : 'Processar CSV'}
              </button>
            </div>
          </div>

          {/* Coluna 2: Carga Automática (Gov.br) */}
          <div className="flex-1 bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center border-l-4 border-l-emerald-500">
            <h4 className="text-xs font-bold text-slate-500 mb-2">2. INTEGRAÇÃO DIRETA (GOV.BR)</h4>
            <p className="text-xs text-slate-500 mb-3">Busca os dados mais recentes do Ministério da Educação.</p>
            <button 
              onClick={handleSincronizacaoGov}
              disabled={uploading || sincronizandoGov}
              className="w-full px-4 py-2 rounded-md font-bold text-white text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 transition-colors flex justify-center items-center gap-2 shadow-sm"
            >
              {sincronizandoGov ? (
                <>⏳ Buscando dados em Brasília...</>
              ) : (
                <>🏛️ Sincronizar Agora</>
              )}
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">Buscando registros financeiros...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 uppercase tracking-wider text-gray-600 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Período</th>
                <th className="px-6 py-4 font-bold">Área Social</th>
                <th className="px-6 py-4 font-bold text-right">Valor Gasto</th>
                <th className="px-6 py-4 font-bold">Fonte dos Dados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gastos.map((gasto) => (
                <tr key={gasto.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {formatarMes(gasto.mesReferencia)} / {gasto.anoExercicio}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {gasto.categoriaTematica.nomeCategoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600 text-right">
                    {formatarMoeda(gasto.valorGasto)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {gasto.fonteDados.nomeFonte}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {gastos.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Nenhum registro encontrado para o ano selecionado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GastosSociais;