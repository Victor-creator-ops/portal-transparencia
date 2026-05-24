import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    // O Router envelopa todo o app para habilitar a navegação
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        
        {/* O Menu fica aqui fora para aparecer em TODAS as páginas */}
        <Navbar />

        {/* O conteúdo dinâmico de cada página é renderizado aqui dentro */}
        <main className="container mx-auto p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Telas que vamos criar em seguida */}
            <Route path="/gastos" element={
              <h2 className="text-3xl font-bold text-gray-800">🚧 Página de Gastos em Construção...</h2>
            } />
            <Route path="/orcamentos" element={
              <h2 className="text-3xl font-bold text-gray-800">🚧 Página de Orçamentos em Construção...</h2>
            } />
            <Route path="/dividas" element={
              <h2 className="text-3xl font-bold text-gray-800">🚧 Página de Dívidas em Construção...</h2>
            } />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;