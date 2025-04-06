import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center bg-[fcff00]">
        <Logo />
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 mr-4">
            <Link to="/" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">HOME</Link>
            <Link to="/quem-somos" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">QUEM SOMOS</Link>
            <Link to="/faq" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">FAQ</Link>
            <Link to="/contato" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">CONTATO</Link>
            <Link to="/teste" className="bg-totalBlue text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors">FAÇA UM TESTE</Link>
          </nav>
          <Link to="/entrar" className="bg-totalYellow text-totalBlue font-semibold py-2 px-6 rounded-md hover:bg-opacity-90 transition-colors">entrar</Link>
        </div>
        
        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 shadow-md">
          <nav className="flex flex-col space-y-3">
            <Link to="/" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">HOME</Link>
            <Link to="/quem-somos" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">QUEM SOMOS</Link>
            <Link to="/faq" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">FAQ</Link>
            <Link to="/contato" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">CONTATO</Link>
            <Link to="/teste" className="bg-totalBlue text-white font-semibold py-2 px-4 rounded-md text-center hover:bg-opacity-90 transition-colors">FAÇA UM TESTE</Link>
            <Link to="/entrar" className="bg-totalYellow text-totalBlue font-semibold py-2 px-6 rounded-md text-center hover:bg-opacity-90 transition-colors">entrar</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;