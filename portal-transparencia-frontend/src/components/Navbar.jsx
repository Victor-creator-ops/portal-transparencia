import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-blue-900 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center text-white">
        
        {/* Logotipo do Portal */}
        <Link to="/" className="text-2xl font-extrabold tracking-wider flex items-center gap-2">
          🏛️ Portal Transparência
        </Link>
        
        {/* Links de Navegação */}
        <div className="space-x-6 font-medium">
          <Link to="/" className="hover:text-blue-300 transition duration-200">Início</Link>
          <Link to="/gastos" className="hover:text-blue-300 transition duration-200">Gastos Sociais</Link>
          <Link to="/orcamentos" className="hover:text-blue-300 transition duration-200">Orçamentos</Link>
          <Link to="/dividas" className="hover:text-blue-300 transition duration-200">Dívida Pública</Link>
          <Link to="/servidores" className="text-white hover:text-gray-200 font-bold">Servidores Públicos</Link>
        </div>
        
      </div>
    </nav>
  );
}

export default Navbar;