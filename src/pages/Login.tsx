
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Login = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Login não implementado",
      description: "Esta funcionalidade será implementada em uma versão futura.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-totalBlue">Bem-vindo de volta!</h1>
            <p className="text-gray-600">Faça login para acessar sua conta</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <Input id="email" type="email" required />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
                <Link to="/recuperar-senha" className="text-xs text-totalBlue hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lembrar-me
              </label>
            </div>
            
            <Button type="submit" className="w-full bg-totalBlue hover:bg-blue-900 text-white">
              Entrar
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link to="/cadastrar" className="text-totalBlue hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
