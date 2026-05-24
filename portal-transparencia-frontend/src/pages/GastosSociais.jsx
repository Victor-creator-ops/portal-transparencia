import { useState, useEffect } from 'react';
import api from '../services/api';

function GastosSociais() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gastos')
      .then(response => {
        setGastos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar os gastos sociais:", error);
        setLoading(false);
      });
  }, []);

  // Função para formatar o valor para Real Brasileiro (R$)
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Função para formatar o mês (de 1 para "Janeiro", por exemplo)
  const formatarMes = (mes) => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses[mes - 1];
  };

  return (
    <div>
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-blue-900">Despesas e Gastos Sociais</h1>
        <p className="text-gray-600 mt-2">
          Acompanhe a execução financeira dos recursos aplicados diretamente em áreas sociais.
        </p>
      </header>

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">Carregando dados financeiros...</p>
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
              Nenhum registro de gasto encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GastosSociais;