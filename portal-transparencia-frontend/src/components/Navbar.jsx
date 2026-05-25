import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/gastos', label: 'Gastos Sociais' },
    { to: '/licitacoes', label: 'Licitações' },
    { to: '/dividas', label: 'Dívida Pública' },
    { to: '/servidores', label: 'Servidores' },
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 font-extrabold text-xl tracking-wider text-blue-100">
              Portal Transparência
            </div>
            <div className="hidden md:flex space-x-2">
              {links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition duration-150 ${
                      isActive
                        ? 'bg-blue-800 text-white shadow-inner'
                        : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;