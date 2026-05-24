import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import GastosSociais from './pages/GastosSociais';
import Orcamentos from './pages/Orcamentos';
import DividaPublica from './pages/DividaPublica';
import Servidores from './pages/Servidores';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-10">
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