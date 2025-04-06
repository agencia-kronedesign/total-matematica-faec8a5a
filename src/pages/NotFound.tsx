
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-totalBlue mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
          <p className="text-gray-500 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Link 
            to="/" 
            className="bg-totalBlue text-white px-6 py-2 rounded-full hover:bg-blue-900 transition-colors"
          >
            Voltar para Home
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
