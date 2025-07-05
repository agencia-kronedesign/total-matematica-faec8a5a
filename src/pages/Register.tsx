
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp, user, loading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    await signUp(email, password, name);
  };

  const createFirstAdmin = async () => {
    try {
      setError('');
      
      // Primeiro, criar o usuário
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@sistema.com',
        password: 'admin123',
        options: {
          data: {
            nome: 'Administrador do Sistema',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Aguardar um pouco para garantir que o trigger do handle_new_user funcione
        setTimeout(async () => {
          try {
            // Promover o usuário a admin
            const { error: updateError } = await supabase
              .from('usuarios')
              .update({ tipo_usuario: 'admin' })
              .eq('id', data.user.id);

            if (updateError) throw updateError;

            toast({
              title: "Admin criado com sucesso!",
              description: "Email: admin@sistema.com | Senha: admin123",
            });
          } catch (updateError: any) {
            toast({
              title: "Erro ao promover usuário",
              description: updateError.message,
              variant: "destructive",
            });
          }
        }, 2000);
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Erro ao criar admin",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!loading && user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo />
          <CardTitle className="text-2xl mt-4">Crie sua conta</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para se cadastrar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Crie uma senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <Button type="submit" className="w-full bg-totalBlue" disabled={loading}>
              {loading ? 'Processando...' : 'Cadastrar'}
            </Button>
          </form>
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full text-sm"
              onClick={createFirstAdmin}
              disabled={loading}
            >
              Criar Primeiro Admin (admin@sistema.com)
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            Já tem uma conta?{' '}
            <Link to="/entrar" className="text-totalBlue hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
