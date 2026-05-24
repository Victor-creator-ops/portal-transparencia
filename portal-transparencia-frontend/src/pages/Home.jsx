import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

function Home() {
  const [gastosAgrupados, setGastosAgrupados] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#9333ea'];

  useEffect(() => {
    Promise.all([
      api.get('/gastos'),
      api.get('/orcamentos')
    ]).then(([resGastos, resOrcamentos]) => {
      
      // Valida o novo formato da API e extrai os "dados"
      const dadosGastos = resGastos.data.sucesso ? resGastos.data.dados : [];
      const dadosOrcamentos = resOrcamentos.data.sucesso ? resOrcamentos.data.dados : [];
      
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
      
      const orcamentosOrdenados = dadosOrcamentos.sort((a, b) => a.anoExercicio - b.anoExercicio);
      setOrcamentos(orcamentosOrdenados);
      
      setLoading(false);
    }).catch(error => {
      console.error("Erro ao buscar dados do Dashboard:", error);
      setLoading(false);
    });
  }, []);

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
        description="Visão consolidada da distribuição e execução dos recursos públicos federais."
      />

      <div className="grid gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Gasto Social Total"
          value={formatarMoeda(gastosAgrupados.reduce((sum, item) => sum + item.value, 0))}
          trend="Categorias por área social"
        />
        <StatCard
          label="Orçamento Previsto"
          value={formatarMoeda(orcamentos.reduce((sum, item) => sum + Number(item.valorPrevisto || 0), 0))}
          trend="Soma dos anos carregados"
        />
        <StatCard
          label="Orçamento Executado"
          value={formatarMoeda(orcamentos.reduce((sum, item) => sum + Number(item.valorExecutado || 0), 0))}
          trend="Valores efetivamente gastos"
        />
      </div>

      {loading ? (
        <p className="text-gray-500 italic animate-pulse">Carregando gráficos...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Distribuição de Gastos por Área Social</h2>
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
                  <Tooltip formatter={(value) => formatarMoeda(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Previsão vs Execução do Orçamento</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orcamentos} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="anoExercicio" />
                  <YAxis tickFormatter={formatarEixoY} />
                  <Tooltip formatter={(value) => formatarMoeda(value)} cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="valorPrevisto" name="Valor Previsto" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="valorExecutado" name="Valor Executado" fill="#16a34a" radius={[4, 4, 0, 0]} />
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