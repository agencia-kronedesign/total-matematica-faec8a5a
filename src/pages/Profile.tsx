import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Profile = () => {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  
  // Estados do perfil
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  
  // Estados da senha
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  console.log('[ProfilePage]', 'mount');

  // Inicializar campos quando userProfile carregar
  useEffect(() => {
    if (userProfile) {
      setNome(userProfile.nome ?? '');
      setTelefone(userProfile.telefone ?? '');
    }
  }, [userProfile]);

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Erro ao carregar perfil (RLS ou outro problema)
  if (user && !userProfile && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive text-center">
          Não foi possível carregar seu perfil. Tente sair e entrar novamente.
        </p>
      </div>
    );
  }

  // Salvar perfil
  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    // Validação
    if (!nome.trim() || nome.trim().length < 2) {
      setProfileError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    setIsSavingProfile(true);
    console.log('[ProfilePage]', 'profile-update-start');

    const { error } = await supabase
      .from('usuarios')
      .update({ 
        nome: nome.trim(), 
        telefone: telefone.trim() || null 
      })
      .eq('id', user?.id);

    if (error) {
      console.error('[ProfilePage]', 'profile-update-error', error);
      setProfileError('Não foi possível atualizar o perfil. Tente novamente.');
    } else {
      console.log('[ProfilePage]', 'profile-update-success');
      await refreshUserProfile();
      setProfileSuccess('Perfil atualizado com sucesso!');
    }

    setIsSavingProfile(false);
  };

  // Alterar senha
  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validações
    if (novaSenha.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres.');
      console.log('[ProfilePage]', 'password-validation-failed');
      return;
    }

    if (novaSenha !== confirmacaoSenha) {
      setPasswordError('As senhas não coincidem.');
      console.log('[ProfilePage]', 'password-validation-failed');
      return;
    }

    setIsChangingPassword(true);
    console.log('[ProfilePage]', 'password-change-start');

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      console.error('[ProfilePage]', 'password-change-error', error);
      setPasswordError('Não foi possível alterar a senha. Tente novamente.');
    } else {
      console.log('[ProfilePage]', 'password-change-success');
      setPasswordSuccess('Senha alterada com sucesso!');
      setNovaSenha('');
      setConfirmacaoSenha('');
    }

    setIsChangingPassword(false);
  };

  // Badge de tipo de usuário
  const getTipoUsuarioLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      professor: 'Professor',
      aluno: 'Aluno',
      responsavel: 'Responsável',
      coordenador: 'Coordenador',
      direcao: 'Direção',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header da página */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus dados pessoais e configurações de segurança
            </p>
          </div>

          {/* Card 1: Informações do Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações do Perfil
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email (readonly) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user?.email ?? ''} 
                  readOnly 
                  className="bg-muted cursor-not-allowed" 
                />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>

              {/* Nome (editável) */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input 
                  id="nome" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)}
                  disabled={isSavingProfile}
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Telefone (editável) */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  value={telefone} 
                  onChange={(e) => setTelefone(e.target.value)}
                  disabled={isSavingProfile}
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* Tipo de usuário (badge readonly) */}
              <div className="space-y-2">
                <Label>Tipo de Usuário</Label>
                <div>
                  <Badge className="bg-primary text-primary-foreground uppercase">
                    {getTipoUsuarioLabel(userProfile?.tipo_usuario || '')}
                  </Badge>
                </div>
              </div>

              {/* Feedback de erro */}
              {profileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              {/* Feedback de sucesso */}
              {profileSuccess && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleSaveProfile} 
                disabled={isSavingProfile}
                className="w-full sm:w-auto"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Segurança da Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Segurança da Conta
              </CardTitle>
              <CardDescription>
                Defina uma nova senha para acessar o portal Total Matemática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nova senha */}
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input 
                  id="novaSenha" 
                  type="password" 
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  disabled={isChangingPassword}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              {/* Confirmar senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmacaoSenha">Confirmar Nova Senha</Label>
                <Input 
                  id="confirmacaoSenha" 
                  type="password" 
                  value={confirmacaoSenha}
                  onChange={(e) => setConfirmacaoSenha(e.target.value)}
                  disabled={isChangingPassword}
                  placeholder="Repita a nova senha"
                />
              </div>

              {/* Feedback de erro */}
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {/* Feedback de sucesso */}
              {passwordSuccess && (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleChangePassword} 
                disabled={isChangingPassword || !novaSenha || !confirmacaoSenha}
                className="w-full sm:w-auto"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  'Alterar Senha'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
