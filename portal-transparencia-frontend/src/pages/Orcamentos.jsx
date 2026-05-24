import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState('');

  useEffect(() => {
    setLoading(true);
    const parametros = anoSelecionado ? { ano: anoSelecionado } : {};

    api.get('/orcamentos', { params: parametros })
      .then(response => {
        // Lendo o novo formato da API
        const respostaApi = response.data;
        if (respostaApi && respostaApi.sucesso) {
          setOrcamentos(respostaApi.dados || []);
        } else {
          setOrcamentos([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar os orçamentos:", error);
        setOrcamentos([]);
        setLoading(false);
      });
  }, [anoSelecionado]);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div>
      <PageHeader
        title="Previsão e Execução Orçamentária"
        description="Compare os valores previstos no orçamento anual com o que foi efetivamente executado."
      >
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="filtroAno" className="text-sm font-medium text-slate-700">Ano:</label>
          <select
            id="filtroAno"
            value={anoSelecionado}
            onChange={(e) => setAnoSelecionado(e.target.value)}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Todos os Anos</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </PageHeader>

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">Carregando dados orçamentários...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 tracking-wider text-gray-600 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4">
                  <p className="font-bold uppercase">Ano de Exercício</p>
                </th>
                <th className="px-6 py-4 text-right">
                  <p className="font-bold uppercase">Valor Previsto</p>
                  <p className="text-[10px] font-normal lowercase text-gray-500">(estimativa inicial de gastos)</p>
                </th>
                <th className="px-6 py-4 text-right">
                  <p className="font-bold uppercase">Valor Executado</p>
                  <p className="text-[10px] font-normal lowercase text-gray-500">(gasto real realizado)</p>
                </th>
                <th className="px-6 py-4">
                  <p className="font-bold uppercase">Fonte dos Dados</p>
                  <p className="text-[10px] font-normal lowercase text-gray-500">(rastreabilidade de origem)</p>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orcamentos.map((orcamento) => (
                <tr key={orcamento.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-blue-800 font-bold text-lg">{orcamento.anoExercicio}</td>
                  <td className="px-6 py-4 font-medium text-gray-600 text-right">{formatarMoeda(orcamento.valorPrevisto)}</td>
                  <td className="px-6 py-4 font-bold text-green-600 text-right">{formatarMoeda(orcamento.valorExecutado)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{orcamento.fonteDados.nomeFonte}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orcamentos.length === 0 && <div className="p-6 text-center text-gray-500">Nenhum registro encontrado.</div>}
        </div>
      )}
    </div>
  );
}

export default Orcamentos;