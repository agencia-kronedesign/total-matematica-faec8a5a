import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSecureAdminSetup } from '@/hooks/useSecureAdminSetup';
import Logo from '@/components/Logo';
import PasswordInput, { isPasswordValid } from '@/components/auth/PasswordInput';
import { AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [adminCreating, setAdminCreating] = useState(false);
  
  const { signUp, user, loading, authLoading } = useAuth();
  const { toast } = useToast();
  const { canShowSetup, loading: setupLoading, setupMessage } = useSecureAdminSetup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid(password)) {
      setError('A senha não atende aos requisitos de segurança.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await signUp(email, password, name);
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('Este email já está cadastrado.');
      } else {
        setError(err.message || 'Erro ao criar conta.');
      }
    }
  };

  const createFirstAdmin = async () => {
    try {
      setError('');
      setAdminCreating(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@sistema.com',
        password: 'Admin123!',
        options: {
          data: {
            nome: 'Administrador do Sistema',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setTimeout(async () => {
          try {
            const { error: updateError } = await supabase
              .from('usuarios')
              .update({ tipo_usuario: 'admin' })
              .eq('id', data.user.id);

            if (updateError) throw updateError;

            toast({
              title: "Admin criado com sucesso!",
              description: "Email: admin@sistema.com | Senha: Admin123!",
            });
            
            window.location.reload();
          } catch (updateError: any) {
            toast({
              title: "Erro ao promover usuário",
              description: updateError.message,
              variant: "destructive",
            });
            setAdminCreating(false);
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
      setAdminCreating(false);
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
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Crie uma senha segura"
                showStrengthIndicator
                showValidationList
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a senha</Label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirme sua senha"
                showStrengthIndicator={false}
                showValidationList={false}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-totalBlue" 
              disabled={authLoading || !isPasswordValid(password) || password !== confirmPassword}
            >
              {authLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                'Cadastrar'
              )}
            </Button>
          </form>
          
          {setupMessage && (
            <div className="mt-4">
              <Alert variant={setupMessage.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{setupMessage.message}</AlertDescription>
              </Alert>
            </div>
          )}
          
          {canShowSetup && !setupLoading && (
            <div className="mt-4 pt-4 border-t">
              <div className="mb-3">
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Configuração Inicial:</strong> Modo de setup inicial do sistema.
                  </AlertDescription>
                </Alert>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full text-sm"
                onClick={createFirstAdmin}
                disabled={loading || adminCreating}
              >
                {adminCreating ? 'Criando Administrador...' : 'Criar Primeiro Admin'}
              </Button>
            </div>
          )}
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
