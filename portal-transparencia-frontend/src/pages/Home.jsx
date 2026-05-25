import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

function Home() {
  const [gastosAgrupados, setGastosAgrupados] = useState([]);
  const [licitacoesAgrupadas, setLicitacoesAgrupadas] = useState([]);
  const [totalLicitado, setTotalLicitado] = useState(0);
  const [totalLicitacoes, setTotalLicitacoes] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cores padronizadas para os gráficos
  const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#9333ea'];

  useEffect(() => {
    Promise.all([
      api.get('/gastos'),
      api.get('/licitacoes')
    ]).then(([resGastos, resLicitacoes]) => {
      
      const dadosGastos = resGastos.data.sucesso ? resGastos.data.dados : [];
      const dadosLicitacoes = resLicitacoes.data.sucesso ? resLicitacoes.data.dados : [];
      
      // 1. Processamento dos Gastos Sociais (Gráfico de Pizza)
      const gastosMapeados = dadosGastos.reduce((acc, gasto) => {
        const nome = gasto.categoriaTematica?.nomeCategoria || 'Sem Categoria';
        const valor = gasto.valorGasto;
        
        const index = acc.findIndex(item => item.name === nome);
        if (index !== -1) {
          acc[index].value += valor;
        } else {
          acc.push({ name: nome, value: valor });
        }
        return acc;
      }, []);
      setGastosAgrupados(gastosMapeados);

      // 2. Processamento das Licitações (Gráfico de Barras e Indicadores)
      let somaTotalLicitado = 0;
      const mapaLicitacoes = {};

      dadosLicitacoes.forEach(lic => {
        const valor = Number(lic.valor || 0);
        somaTotalLicitado += valor;
        
        const situacao = lic.situacao || 'Indefinida';
        if (!mapaLicitacoes[situacao]) {
          mapaLicitacoes[situacao] = 0;
        }
        mapaLicitacoes[situacao] += valor;
      });

      const licitacoesChart = Object.keys(mapaLicitacoes).map(key => ({
        situacao: key,
        valor: mapaLicitacoes[key]
      }));

      setLicitacoesAgrupadas(licitacoesChart);
      setTotalLicitado(somaTotalLicitado);
      setTotalLicitacoes(dadosLicitacoes.length);
      
      setLoading(false);
    }).catch(error => {
      console.error("Erro ao buscar dados do Dashboard:", error);
      setLoading(false);
    });
  }, []);

  // Botão do Pânico Global
  const handleLimpezaGlobal = async () => {
    const confirmar = window.confirm('ATENÇÃO: Esta ação vai apagar TUDO (Gastos, Licitações, Dívidas). O sistema será zerado. Deseja continuar?');
    if (confirmar) {
      try {
        await api.delete('/admin/limpar-banco');
        alert('Base de dados limpa com sucesso! O sistema está pronto para recomeçar.');
        window.location.reload(); 
      } catch (error) {
        alert('Erro ao limpar a base de dados.');
      }
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarEixoY = (valor) => {
    if (valor >= 1000000000) return `R$ ${(valor / 1000000000).toFixed(1)}B`;
    if (valor >= 1000000) return `R$ ${(valor / 1000000).toFixed(1)}M`;
    return `R$ ${valor}`;
  };

  return (
    <div>
      <PageHeader
        title="Painel de Transparência"
        description="Visão consolidada da distribuição de recursos em áreas sociais e processos de compras públicas."
      >
        <button
          onClick={handleLimpezaGlobal}
          className="rounded-full border border-red-600 bg-white px-5 py-2 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50"
        >
          Limpar Base de Dados (Zerar)
        </button>
      </PageHeader>

      <div className="grid gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Gasto Social Total"
          value={formatarMoeda(gastosAgrupados.reduce((sum, item) => sum + item.value, 0))}
          trend="Recursos aplicados em áreas sociais"
        />
        <StatCard
          label="Processos Licitatórios"
          value={totalLicitacoes.toString()}
          trend="Total de licitações registradas"
        />
        <StatCard
          label="Volume Licitado"
          value={formatarMoeda(totalLicitado)}
          trend="Soma do valor das licitações"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-bold animate-pulse text-sm">Carregando painel de indicadores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Distribuição de Gastos por Área Social</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gastosAgrupados}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gastosAgrupados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatarMoeda(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">Volume Financeiro por Situação da Licitação</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={licitacoesAgrupadas} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="situacao" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tickFormatter={formatarEixoY} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip formatter={(value) => formatarMoeda(value)} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="valor" name="Valor Consolidado" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Home;