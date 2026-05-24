import { useState, useEffect } from 'react';
import api from '../services/api';

function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orcamentos')
      .then(response => {
        setOrcamentos(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar os orçamentos:", error);
        setLoading(false);
      });
  }, []);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div>
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-blue-900">Previsão e Execução Orçamentária</h1>
        <p className="text-gray-600 mt-2">
          Compare os valores previstos no orçamento anual com o que foi efetivamente executado.
        </p>
      </header>

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">Carregando dados orçamentários...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 uppercase tracking-wider text-gray-600 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Ano de Exercício</th>
                <th className="px-6 py-4 font-bold text-right">Valor Previsto</th>
                <th className="px-6 py-4 font-bold text-right">Valor Executado</th>
                <th className="px-6 py-4 font-bold">Fonte dos Dados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orcamentos.map((orcamento) => (
                <tr key={orcamento.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-blue-800 font-bold text-lg">
                    {orcamento.anoExercicio}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600 text-right">
                    {formatarMoeda(orcamento.valorPrevisto)}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600 text-right">
                    {formatarMoeda(orcamento.valorExecutado)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {orcamento.fonteDados.nomeFonte}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orcamentos.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Nenhum registro de orçamento encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Orcamentos;