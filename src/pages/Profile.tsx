import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, User, Lock, CheckCircle, AlertCircle, Camera, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Gera as iniciais do nome (ex: "João Silva" → "JS")
const getInitials = (nome: string | undefined) => {
  if (!nome) return 'U';
  const parts = nome.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
const Profile = () => {
  const { user, userProfile, loading, refreshUserProfile } = useAuth();
  
  // Estados do perfil
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  
  // Estados da foto
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados da senha
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  console.log('[ProfilePage]', 'mount');

  // Função para formatar telefone com máscara (99) 99999-9999
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 11);
    
    if (limited.length <= 2) return limited;
    if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
  };

  // Inicializar campos quando userProfile carregar
  useEffect(() => {
    if (userProfile) {
      setNome(userProfile.nome ?? '');
      setTelefone(formatPhone(userProfile.telefone ?? ''));
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

  // Erro ao carregar perfil (RLS ou outro problema) - Tela robusta com ações
  if (user && !userProfile && !loading) {
    console.error('[ProfilePage]', 'userProfile-not-loaded');

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h1 className="mb-2 text-xl font-semibold text-foreground">
            Não foi possível carregar seu perfil
          </h1>
          <p className="mb-6 text-sm text-muted-foreground max-w-md">
            Tente recarregar a página ou sair e entrar novamente. 
            Se o problema persistir, entre em contato com o suporte da escola.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </Button>
            <Button
              onClick={() => {
                console.log('[ProfilePage]', 'force-refresh-userProfile');
                refreshUserProfile();
              }}
            >
              Tentar novamente
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Upload de foto de perfil
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('A imagem deve ter no máximo 2MB.');
      return;
    }

    setPhotoError(null);
    setIsUploadingPhoto(true);
    console.log('[ProfilePage]', 'photo-upload-start');

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload para o bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar foto_url no perfil
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ foto_url: `${urlData.publicUrl}?t=${Date.now()}` })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      console.log('[ProfilePage]', 'photo-upload-success');
      await refreshUserProfile();
    } catch (error) {
      console.error('[ProfilePage]', 'photo-upload-error', error);
      setPhotoError('Não foi possível enviar a foto. Tente novamente.');
    } finally {
      setIsUploadingPhoto(false);
      // Limpar input para permitir re-upload do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remover foto de perfil
  const handleRemovePhoto = async () => {
    if (!user?.id || !userProfile?.foto_url) return;

    setIsUploadingPhoto(true);
    setPhotoError(null);
    console.log('[ProfilePage]', 'photo-remove-start');

    try {
      // Remover foto_url do perfil
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ foto_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      console.log('[ProfilePage]', 'photo-remove-success');
      await refreshUserProfile();
    } catch (error) {
      console.error('[ProfilePage]', 'photo-remove-error', error);
      setPhotoError('Não foi possível remover a foto. Tente novamente.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Salvar perfil
  const handleSaveProfile = async () => {
    setProfileError(null);
    setProfileSuccess(null);

    // Validação do nome
    if (!nome.trim() || nome.trim().length < 2) {
      setProfileError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }

    // Validação do telefone (opcional, mas se preenchido deve ser válido)
    const rawDigits = telefone.replace(/\D/g, '');
    const telefoneToSave = rawDigits.length === 0 ? null : telefone;

    if (rawDigits.length > 0 && rawDigits.length < 10) {
      setProfileError('Informe um telefone válido com DDD (mínimo 10 dígitos).');
      return;
    }

    setIsSavingProfile(true);
    console.log('[ProfilePage]', 'profile-update-start');

    const { error } = await supabase
      .from('usuarios')
      .update({ 
        nome: nome.trim(), 
        telefone: telefoneToSave
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

          {/* Card 1: Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Foto de Perfil
              </CardTitle>
              <CardDescription>
                Sua foto será exibida no menu e em outras áreas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {/* Avatar grande */}
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage 
                    src={userProfile?.foto_url || undefined} 
                    alt={userProfile?.nome || 'Avatar do usuário'} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
                    {getInitials(userProfile?.nome)}
                  </AvatarFallback>
                </Avatar>
                {isUploadingPhoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {userProfile?.foto_url ? 'Trocar foto' : 'Enviar foto'}
                </Button>
                {userProfile?.foto_url && (
                  <Button
                    variant="outline"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>

              {/* Input oculto para upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Feedback de erro */}
              {photoError && (
                <Alert variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{photoError}</AlertDescription>
                </Alert>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Formatos aceitos: JPG, PNG ou WebP. Tamanho máximo: 2MB.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Informações do Perfil */}
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

              {/* Telefone (editável com máscara) */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone"
                  type="tel"
                  value={telefone} 
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  disabled={isSavingProfile}
                  placeholder="(11) 91234-5678"
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
