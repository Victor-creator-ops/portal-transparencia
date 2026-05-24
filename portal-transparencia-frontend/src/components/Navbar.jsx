import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/gastos', label: 'Gastos Sociais' },
  { to: '/orcamentos', label: 'Orçamentos' },
  { to: '/dividas', label: 'Dívida Pública' },
  { to: '/servidores', label: 'Servidores Públicos' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-950/95 text-white shadow-sm sticky top-0 z-40 backdrop-blur-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
        <NavLink to="/" className="text-2xl font-extrabold tracking-widest text-white">
          Portal Transparência
        </NavLink>

        <button
          type="button"
          className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          Menu
        </button>

        <div className={`${menuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}>
          <div className="mt-3 flex flex-col gap-3 text-sm font-medium md:mt-0 md:flex-row md:items-center md:gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 transition duration-200 ${
                    isActive ? 'bg-white/15 text-blue-100 font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;