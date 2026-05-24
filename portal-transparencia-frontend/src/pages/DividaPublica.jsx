import { useState, useEffect } from 'react';
import api from '../services/api';

function DividaPublica() {
  const [dividas, setDividas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dividas')
      .then(response => {
        setDividas(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar os dados da dívida pública:", error);
        setLoading(false);
      });
  }, []);

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
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-blue-900">Dívida Pública</h1>
        <p className="text-gray-600 mt-2">
          Monitore o saldo consolidado da dívida interna e externa do governo.
        </p>
      </header>

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">Carregando dados da dívida...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 uppercase tracking-wider text-gray-600 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Período</th>
                <th className="px-6 py-4 font-bold">Tipo de Dívida</th>
                <th className="px-6 py-4 font-bold text-right">Saldo Devedor</th>
                <th className="px-6 py-4 font-bold">Fonte dos Dados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dividas.map((divida) => (
                <tr key={divida.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-gray-700 font-medium">
                    {formatarMes(divida.mesReferencia)} / {divida.anoExercicio}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold ${
                      divida.tipoDivida.toLowerCase() === 'interna' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {divida.tipoDivida}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600 text-right">
                    {formatarMoeda(divida.valorSaldo)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {divida.fonteDados.nomeFonte}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {dividas.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              Nenhum registro de dívida encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DividaPublica;