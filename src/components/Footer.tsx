
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

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
            <ul className="space-y-2">
              <li><Link to="/" className="hover:underline">HOME</Link></li>
              <li><Link to="/exercicios" className="hover:underline">EXERCÍCIOS PRÁTICOS</Link></li>
              <li><Link to="/questionarios" className="hover:underline">QUESTIONÁRIOS</Link></li>
              <li><Link to="/exercicios-teoricos" className="hover:underline">EXERCÍCIOS TEÓRICOS</Link></li>
              <li><Link to="/tipos-de-relatorios" className="hover:underline">TIPOS DE RELATÓRIOS</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Fale Conosco / Sugestões</h3>
            <form className="space-y-3">
              <input 
                type="text" 
                placeholder="Nome" 
                className="w-full px-4 py-2 rounded text-gray-800"
              />
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full px-4 py-2 rounded text-gray-800"
              />
              <button className="bg-totalYellow text-totalBlue font-semibold py-2 px-6 rounded">
                Enviar
              </button>
            </form>
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
