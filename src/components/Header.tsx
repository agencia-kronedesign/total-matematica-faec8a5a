import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { Link } from 'react-router-dom';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return <header className="sticky top-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center bg-[fcff00]">
        <Logo />
        
        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex gap-4">
          <Link to="/cadastrar" className="btn-amarelo">Cadastrar</Link>
          <Link to="/entrar" className="btn-azul">Entrar</Link>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && <div className="md:hidden bg-white py-4 px-4 shadow-md">
          <nav className="flex flex-col space-y-3">
            <Link to="/cadastrar" className="btn-amarelo text-center">Cadastrar</Link>
            <Link to="/entrar" className="btn-azul text-center">Entrar</Link>
          </nav>
        </div>}
    </header>;
};
export default Header;