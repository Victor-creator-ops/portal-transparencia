import { useState, useEffect } from 'react';
import api from '../services/api';

function Servidores() {
  const [servidores, setServidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  
  const [estadoSelecionado, setEstadoSelecionado] = useState('SP');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [qtdPaginas, setQtdPaginas] = useState(1); // Novo Filtro!

  const buscarServidores = () => {
    setLoading(true);
    setErro('');
    
    api.get('/servidores', { 
      params: { estado: estadoSelecionado, pagina: paginaAtual, qtdPaginas: qtdPaginas } 
    })
      .then(response => {
        const dados = Array.isArray(response.data) ? response.data : [];
        setServidores(dados);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar servidores:", error);
        setErro('⚠️ O servidor do governo rejeitou a busca. Verifique sua conexão ou tente novamente.');
        setServidores([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    buscarServidores();
  }, [estadoSelecionado, paginaAtual]);

  return (
    <div>
      <header className="mb-6 border-b pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Servidores Públicos</h1>
          <p className="text-gray-600 mt-2">Consulte servidores ativos por Estado em tempo real.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-medium text-sm">Estado:</label>
            <select 
              value={estadoSelecionado}
              onChange={(e) => { setEstadoSelecionado(e.target.value); setPaginaAtual(1); }}
              className="bg-gray-50 border border-gray-300 text-sm rounded-md p-2"
            >
              <option value="AC">AC</option><option value="BA">BA</option><option value="DF">DF</option>
              <option value="MG">MG</option><option value="RJ">RJ</option><option value="SP">SP</option>
              <option value="PR">PR</option><option value="RS">RS</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
            <label className="text-gray-700 font-medium text-sm">Páginas por vez:</label>
            <select 
              value={qtdPaginas}
              onChange={(e) => setQtdPaginas(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-sm rounded-md p-2"
            >
              <option value={1}>1 página (15 itens)</option>
              <option value={3}>3 páginas (45 itens)</option>
              <option value={5}>5 páginas (75 itens)</option>
            </select>
            <button 
              onClick={buscarServidores}
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-md"
            >
              Aplicar
            </button>
          </div>
        </div>
      </header>

      {erro && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg font-bold shadow-sm">{erro}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-blue-600 font-bold animate-pulse text-lg">📡 Conectando com Brasília e puxando {qtdPaginas} página(s)...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-6 py-4 font-bold">Nome do Servidor</th>
                  <th className="px-6 py-4 font-bold">CPF</th>
                  <th className="px-6 py-4 font-bold">Órgão</th>
                  <th className="px-6 py-4 font-bold">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {servidores.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="px-6 py-4 font-bold text-gray-800">{item.servidor?.nome || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono">{item.servidor?.cpfFormatado || 'N/A'}</td>
                    <td className="px-6 py-4 text-xs">{item.orgaoServidorLotacao?.nome || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full text-xs font-semibold">{item.situacao || 'Ativo'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
            <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(p => p - 1)} className="px-5 py-2 font-bold rounded-lg bg-white border">⬅️ Anterior</button>
            <span className="font-extrabold text-blue-900 text-lg">Página base: {paginaAtual}</span>
            <button onClick={() => setPaginaAtual(p => p + 1)} className="px-5 py-2 font-bold rounded-lg bg-blue-600 text-white">Próxima ➡️</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Servidores;