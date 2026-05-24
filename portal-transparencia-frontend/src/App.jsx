import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GastosSociais from './pages/GastosSociais';
import Orcamentos from './pages/Orcamentos';
import DividaPublica from './pages/DividaPublica';
import Servidores from './pages/Servidores';

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
            
            <Route path="/gastos" element={<GastosSociais />} />
            <Route path="/orcamentos" element={<Orcamentos />} />
            <Route path="/dividas" element={<DividaPublica />} />
            <Route path="/servidores" element={<Servidores />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;