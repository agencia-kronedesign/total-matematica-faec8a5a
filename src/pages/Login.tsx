import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Logo from '@/components/Logo';
import { useLoginRateLimiter } from '@/hooks/useLoginRateLimiter';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getHomeByRole } from '@/utils/routes';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, user, userProfile, loading, authLoading } = useAuth();
  const { isBlocked, remainingSeconds, registerFailedAttempt, resetAttempts } = useLoginRateLimiter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isBlocked) return;

    try {
      await signIn(email, password);
      resetAttempts();
    } catch (err: any) {
      console.error('Erro no login:', err);
      registerFailedAttempt();
      
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login.');
      } else {
        setError(err.message || 'Ocorreu um erro ao fazer login.');
      }
    }
  };

  // Se usuário está logado E temos o perfil, redirecionar para home correta
  if (!loading && user && userProfile?.tipo_usuario) {
    const destino = getHomeByRole(userProfile.tipo_usuario);
    return <Navigate to={destino} replace />;
  }

  // Se está logado MAS ainda carregando perfil, mostrar loading
  if (!loading && user && !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-totalBlue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo />
          <CardTitle className="text-2xl mt-4">Bem-vindo de volta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isBlocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isBlocked}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isBlocked && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Muitas tentativas falhas. Tente novamente em {remainingSeconds} segundos.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Link to="/recuperar-senha" className="text-sm text-totalBlue hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-totalBlue" 
              disabled={authLoading || isBlocked}
            >
              {authLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : isBlocked ? (
                `Aguarde ${remainingSeconds}s`
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            Não tem uma conta?{' '}
            <Link to="/cadastrar" className="text-totalBlue hover:underline">
              Cadastrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
