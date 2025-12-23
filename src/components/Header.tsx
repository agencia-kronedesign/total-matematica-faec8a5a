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
  console.log('[Header]', 'scroll-to', id);
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

  return (
    <header className="sticky top-0 bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 mr-4">
            {/* VISITANTE (não logado) */}
            {!isLoggedIn && (
              <>
                <Link to="/" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">HOME</Link>
                <Link to="/quem-somos" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">QUEM SOMOS</Link>
                <button 
                  onClick={() => handleScrollLink('faq')}
                  className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors"
                >
                  FAQ
                </button>
                <button 
                  onClick={() => handleScrollLink('contato')}
                  className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors"
                >
                  CONTATO
                </button>
                <Link to="/cadastrar" className="bg-totalBlue text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors">
                  FAÇA UM TESTE
                </Link>
              </>
            )}

            {/* USUÁRIO LOGADO */}
            {isLoggedIn && (
              <>
                {/* Links para ALUNO / RESPONSÁVEL */}
                {(tipoUsuario === 'aluno' || tipoUsuario === 'responsavel') && (
                  <>
                    <Link to="/atividades" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      MINHAS ATIVIDADES
                    </Link>
                    <Link to="/dashboard" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      DASHBOARD
                    </Link>
                  </>
                )}

                {/* Links para PROFESSOR */}
                {tipoUsuario === 'professor' && (
                  <>
                    <Link to="/professor/atividades" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      ATIVIDADES
                    </Link>
                    <Link to="/professor/turmas" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      TURMAS
                    </Link>
                  </>
                )}

                {/* Links para COORDENADOR / DIREÇÃO */}
                {(tipoUsuario === 'coordenador' || tipoUsuario === 'direcao') && (
                  <>
                    <Link to="/professor/atividades" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      ATIVIDADES
                    </Link>
                    <Link to="/professor/turmas" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      TURMAS
                    </Link>
                  </>
                )}

                {/* Links para ADMIN */}
                {tipoUsuario === 'admin' && (
                  <>
                    <Link to="/admin" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      PAINEL ADMIN
                    </Link>
                    <Link to="/admin/usuarios" className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      USUÁRIOS
                    </Link>
                  </>
                )}
              </>
            )}
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
            {/* VISITANTE (não logado) */}
            {!isLoggedIn && (
              <>
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                  HOME
                </Link>
                <Link to="/quem-somos" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                  QUEM SOMOS
                </Link>
                <button 
                  onClick={() => handleScrollLink('faq')}
                  className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors text-left"
                >
                  FAQ
                </button>
                <button 
                  onClick={() => handleScrollLink('contato')}
                  className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors text-left"
                >
                  CONTATO
                </button>
                <Link to="/cadastrar" onClick={() => setIsMenuOpen(false)} className="bg-totalBlue text-white font-semibold py-2 px-4 rounded-md text-center hover:bg-opacity-90 transition-colors">
                  FAÇA UM TESTE
                </Link>
              </>
            )}

            {/* USUÁRIO LOGADO */}
            {isLoggedIn && (
              <>
                {/* Links para ALUNO / RESPONSÁVEL */}
                {(tipoUsuario === 'aluno' || tipoUsuario === 'responsavel') && (
                  <>
                    <Link to="/atividades" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      MINHAS ATIVIDADES
                    </Link>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      DASHBOARD
                    </Link>
                  </>
                )}

                {/* Links para PROFESSOR */}
                {tipoUsuario === 'professor' && (
                  <>
                    <Link to="/professor/atividades" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      ATIVIDADES
                    </Link>
                    <Link to="/professor/turmas" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      TURMAS
                    </Link>
                  </>
                )}

                {/* Links para COORDENADOR / DIREÇÃO */}
                {(tipoUsuario === 'coordenador' || tipoUsuario === 'direcao') && (
                  <>
                    <Link to="/professor/atividades" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      ATIVIDADES
                    </Link>
                    <Link to="/professor/turmas" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      TURMAS
                    </Link>
                  </>
                )}

                {/* Links para ADMIN */}
                {tipoUsuario === 'admin' && (
                  <>
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      PAINEL ADMIN
                    </Link>
                    <Link to="/admin/usuarios" onClick={() => setIsMenuOpen(false)} className="font-semibold text-totalBlue hover:text-opacity-80 transition-colors">
                      USUÁRIOS
                    </Link>
                  </>
                )}
              </>
            )}

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
