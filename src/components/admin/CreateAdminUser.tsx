import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CreateAdminUser = () => {
  const [email, setEmail] = useState('totalmatematica.com.br@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [nome, setNome] = useState('Total Matemática Admin');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createAdminUser = async () => {
    setLoading(true);
    try {
      // Primeiro, criar o usuário na auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: nome,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Depois, atualizar o tipo de usuário para admin
        const { error: updateError } = await supabase
          .from('usuarios')
          .update({ tipo_usuario: 'admin' })
          .eq('id', authData.user.id);

        if (updateError) throw updateError;

        toast({
          title: "Usuário admin criado com sucesso",
          description: `${email} foi criado como administrador`,
        });
      }
    } catch (error: any) {
      console.error('Erro ao criar usuário admin:', error);
      toast({
        title: "Erro ao criar usuário admin",
        description: error.message,
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
        <div>
          <label className="text-sm font-medium">Nome</label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do administrador"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email do administrador"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Senha</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
          />
        </div>
        <Button 
          onClick={createAdminUser} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Criando...' : 'Criar Admin'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateAdminUser;