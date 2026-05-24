import { useState, useEffect } from 'react';
import api from '../services/api';

function Home() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    api.get('/categorias')
      .then(response => {
        setCategorias(response.data);
      })
      .catch(error => console.error("Erro ao buscar as categorias:", error));
  }, []);

  return (
    <div>
      <header className="mb-10 text-center md:text-left border-b pb-6">
        <h1 className="text-4xl font-extrabold text-blue-900">Visão Geral</h1>
        <p className="text-lg text-gray-600 mt-2">
          Acompanhe os dados públicos federais de forma simplificada e acessível.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-blue-600 pl-3">
          Áreas Sociais Monitoradas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categorias.length === 0 ? (
            <p className="text-gray-500 italic">Carregando dados do servidor...</p>
          ) : (
            categorias.map((categoria) => (
              <div key={categoria.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-bold text-blue-800 mb-2">{categoria.nomeCategoria}</h3>
                <p className="text-gray-600 leading-relaxed">{categoria.descricaoSimplificada}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;