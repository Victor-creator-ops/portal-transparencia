import { useState, useEffect } from 'react';
import api from '../services/api';

function GastosSociais() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Novo Estado: Guarda o ano que o cidadão selecionou no menu
  const [anoSelecionado, setAnoSelecionado] = useState('');

  // 2. O useEffect agora tem 'anoSelecionado' como dependência. 
  // Isso significa: "React, rode isso novamente sempre que o ano mudar!"
  useEffect(() => {
    setLoading(true);
    
    // Configuramos o parâmetro apenas se um ano foi selecionado
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
  }, [anoSelecionado]);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarMes = (mes) => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses[mes - 1];
  };

  return (
    <div>
      <header className="mb-8 border-b pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Despesas e Gastos Sociais</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe a execução financeira dos recursos aplicados diretamente em áreas sociais.
          </p>
        </div>

        {/* 3. O nosso novo Filtro Visual */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <label htmlFor="filtroAno" className="text-gray-700 font-medium text-sm">
            Filtrar Exercício:
          </label>
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