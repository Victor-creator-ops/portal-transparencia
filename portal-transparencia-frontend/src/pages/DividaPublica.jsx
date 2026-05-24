import { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

function DividaPublica() {
  const [dividas, setDividas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (anoSelecionado) params.ano = anoSelecionado;
    if (tipoSelecionado) params.tipo = tipoSelecionado;

    api.get('/dividas', { params })
      .then(response => {
        // Lendo o novo formato da API
        const respostaApi = response.data;
        if (respostaApi && respostaApi.sucesso) {
          setDividas(respostaApi.dados || []);
        } else {
          setDividas([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar os dados da dívida pública:", error);
        setDividas([]);
        setLoading(false);
      });
  }, [anoSelecionado, tipoSelecionado]);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarMes = (mes) => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return meses[mes - 1];
  };

  return (
    <div>
      <PageHeader
        title="Dívida Pública"
        description="Monitore o saldo consolidado da dívida interna e externa do governo."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm">
            <span className="font-semibold">Ano:</span>
            <select
              id="filtroAno"
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              className="ml-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-sm text-slate-900 outline-none"
            >
              <option value="">Todos</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          <div className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm">
            <span className="font-semibold">Tipo:</span>
            <select
              id="filtroTipo"
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value)}
              className="ml-2 rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-sm text-slate-900 outline-none"
            >
              <option value="">Todos</option>
              <option value="Interna">Interna</option>
              <option value="Externa">Externa</option>
            </select>
          </div>
        </div>
      </PageHeader>

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">Carregando dados da dívida...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 tracking-wider text-gray-600 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4">
                  <p className="font-bold uppercase">Período</p>
                </th>
                <th className="px-6 py-4">
                  <p className="font-bold uppercase">Tipo de Dívida</p>
                  <p className="text-[10px] font-normal lowercase text-gray-500">
                    (Interna: Títulos no Brasil / Externa: Empréstimos fora)
                  </p>
                </th>
                <th className="px-6 py-4 text-right">
                  <p className="font-bold uppercase">Saldo Devedor</p>
                </th>
                <th className="px-6 py-4">
                  <p className="font-bold uppercase">Fonte dos Dados</p>
                  <p className="text-[10px] font-normal lowercase text-gray-500">(rastreabilidade de origem)</p>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dividas.map((divida) => (
                <tr key={divida.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 text-gray-700 font-medium">{formatarMes(divida.mesReferencia)} / {divida.anoExercicio}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center py-1 px-3 rounded-full text-xs font-semibold ${
                      divida.tipoDivida.toLowerCase() === 'interna' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                    }`}>{divida.tipoDivida}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600 text-right">{formatarMoeda(divida.valorSaldo)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{divida.fonteDados.nomeFonte}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {dividas.length === 0 && <div className="p-6 text-center text-gray-500">Nenhum registro de dívida encontrado.</div>}
        </div>
      )}
    </div>
  );
}

export default DividaPublica;