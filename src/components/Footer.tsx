import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import ContactForm from './forms/ContactForm';

const Footer = () => {
  return (
    <footer className="bg-totalBlue text-white pt-10 pb-4">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="bg-white p-3 inline-block rounded-md mb-4">
              <Logo />
            </div>
            <p className="text-sm">Total de sucessos matemáticos</p>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:underline">HOME</Link></li>
              <li><Link to="/faca-um-teste" className="hover:underline">FAÇA UM TESTE</Link></li>
              <li><a href="/#contato" className="hover:underline">CONTATO</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Fale Conosco / Sugestões</h3>
            <ContactForm origin="footer" />
          </div>
        </div>
        
        <div className="pt-4 border-t border-white/20 text-center text-sm">
          <p>© {new Date().getFullYear()} Total Matemática. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
