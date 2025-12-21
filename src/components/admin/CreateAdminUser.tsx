import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PasswordInput, { isPasswordValid } from '@/components/auth/PasswordInput';
import { AlertCircle, Loader2 } from 'lucide-react';

const CreateAdminUser = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const createAdminUser = async () => {
    setError('');

    // Validar campos
    if (!nome.trim()) {
      setError('Nome é obrigatório.');
      return;
    }

    if (!email.trim()) {
      setError('Email é obrigatório.');
      return;
    }

    if (!isPasswordValid(password)) {
      setError('A senha não atende aos requisitos de segurança.');
      return;
    }

    setLoading(true);
    try {
      // Usar Edge Function para criar usuário sem afetar sessão atual
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email,
          password,
          nome,
          tipo_usuario: 'admin'
        }
      });

      if (error) throw error;

      if (data?.error) throw new Error(data.error);

      toast({
        title: "Usuário admin criado com sucesso",
        description: `${email} foi criado como administrador`,
      });

      // Limpar formulário após sucesso
      setEmail('');
      setPassword('');
      setNome('');

      // Redirecionar para página de gerenciamento de usuários após sucesso
      setTimeout(() => {
        navigate('/admin/usuarios');
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao criar usuário admin:', error);
      setError(error.message || 'Erro desconhecido ao criar administrador.');
      toast({
        title: "Erro ao criar usuário admin",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar Usuário Admin</CardTitle>
        <CardDescription>
          Criar um novo usuário administrador do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do administrador"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email do administrador"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="Digite uma senha segura"
            showStrengthIndicator
            showValidationList
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={createAdminUser} 
          disabled={loading || !isPasswordValid(password) || !nome.trim() || !email.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Admin'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateAdminUser;
