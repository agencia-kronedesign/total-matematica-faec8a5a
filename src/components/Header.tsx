import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserMenu from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!user;
  const tipoUsuario = userProfile?.tipo_usuario;

  const handleScrollLink = (id: string) => {
    if (location.pathname === '/') {
      scrollToSection(id);
    } else {
      navigate('/');
      setTimeout(() => scrollToSection(id), 100);
    }
    setIsMenuOpen(false);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => {
    const closeMenu = () => mobile && setIsMenuOpen(false);
    const linkClass = "font-semibold text-totalBlue hover:text-opacity-80 transition-colors";

    if (!isLoggedIn) {
      return (
        <>
          <Link to="/" onClick={closeMenu} className={linkClass}>HOME</Link>
          <Link to="/quem-somos" onClick={closeMenu} className={linkClass}>QUEM SOMOS</Link>
          <button onClick={() => handleScrollLink('faq')} className={`${linkClass} ${mobile ? 'text-left' : ''}`}>FAQ</button>
          <button onClick={() => handleScrollLink('contato')} className={`${linkClass} ${mobile ? 'text-left' : ''}`}>CONTATO</button>
          <Link to="/faca-um-teste" onClick={closeMenu} className="bg-totalBlue text-white font-semibold py-2 px-4 rounded-md text-center hover:bg-opacity-90 transition-colors">
            FAÇA UM TESTE
          </Link>
        </>
      );
    }

    return (
      <>
        {/* ALUNO / RESPONSÁVEL */}
        {(tipoUsuario === 'aluno' || tipoUsuario === 'responsavel') && (
          <>
            <Link to="/atividades" onClick={closeMenu} className={linkClass}>MINHAS ATIVIDADES</Link>
            <Link to="/dashboard" onClick={closeMenu} className={linkClass}>DASHBOARD</Link>
          </>
        )}

        {/* PROFESSOR */}
        {tipoUsuario === 'professor' && (
          <>
            <Link to="/professor/atividades" onClick={closeMenu} className={linkClass}>ATIVIDADES</Link>
            <Link to="/professor/turmas" onClick={closeMenu} className={linkClass}>TURMAS</Link>
          </>
        )}

        {/* COORDENADOR — apenas monitoramento */}
        {tipoUsuario === 'coordenador' && (
          <>
            <Link to="/professor/turmas" onClick={closeMenu} className={linkClass}>TURMAS</Link>
            <Link to="/relatorios" onClick={closeMenu} className={linkClass}>RELATÓRIOS</Link>
          </>
        )}

        {/* DIREÇÃO — gestão + monitoramento */}
        {tipoUsuario === 'direcao' && (
          <>
            <Link to="/admin/usuarios" onClick={closeMenu} className={linkClass}>GESTÃO</Link>
            <Link to="/professor/turmas" onClick={closeMenu} className={linkClass}>TURMAS</Link>
            <Link to="/relatorios" onClick={closeMenu} className={linkClass}>RELATÓRIOS</Link>
          </>
        )}

        {/* ADMIN */}
        {tipoUsuario === 'admin' && (
          <>
            <Link to="/admin" onClick={closeMenu} className={linkClass}>PAINEL ADMIN</Link>
            <Link to="/admin/usuarios" onClick={closeMenu} className={linkClass}>USUÁRIOS</Link>
          </>
        )}
      </>
    );
  };

  return (
    <header className="sticky top-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 mr-4">
            <NavLinks />
          </nav>
          <UserMenu />
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
            <NavLinks mobile />
            <div className="pt-2">
              <UserMenu />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
