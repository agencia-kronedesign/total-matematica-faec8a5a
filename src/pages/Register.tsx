
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Register = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cadastro não implementado",
      description: "Esta funcionalidade será implementada em uma versão futura.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-totalBlue">Crie sua conta</h1>
            <p className="text-gray-600">Junte-se ao Total Matemática</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Nome completo</label>
              <Input id="name" type="text" required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <Input id="email" type="email" required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="user-type" className="text-sm font-medium text-gray-700">Tipo de usuário</label>
              <Select>
                <SelectTrigger id="user-type">
                  <SelectValue placeholder="Selecione seu perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Aluno</SelectItem>
                  <SelectItem value="parent">Pai/Responsável</SelectItem>
                  <SelectItem value="teacher">Professor</SelectItem>
                  <SelectItem value="coordinator">Coordenador</SelectItem>
                  <SelectItem value="director">Diretor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
              <Input id="password" type="password" required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirmar senha</label>
              <Input id="confirm-password" type="password" required />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" required />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Concordo com os{" "}
                <Link to="/termos" className="text-totalBlue hover:underline">
                  termos de serviço
                </Link>
                {" "}e{" "}
                <Link to="/privacidade" className="text-totalBlue hover:underline">
                  política de privacidade
                </Link>
              </label>
            </div>
            
            <Button type="submit" className="w-full bg-totalBlue hover:bg-blue-900 text-white">
              Cadastrar
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link to="/entrar" className="text-totalBlue hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;
