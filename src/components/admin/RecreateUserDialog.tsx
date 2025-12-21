import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Key, Loader2, AlertCircle } from 'lucide-react';
import PasswordInput, { isPasswordValid, getPasswordStrength } from '@/components/auth/PasswordInput';

interface RecreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    nome: string;
    email: string;
    tipo_usuario: string;
  } | null;
  onConfirm: (password: string) => Promise<boolean>;
  isLoading: boolean;
}

export const RecreateUserDialog: React.FC<RecreateUserDialogProps> = ({
  open,
  onOpenChange,
  user,
  onConfirm,
  isLoading
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const generatePassword = () => {
    // Garantir que a senha gerada atende todos os requisitos
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%';
    
    // Garantir pelo menos um de cada tipo
    let result = '';
    result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    result += special.charAt(Math.floor(Math.random() * special.length));
    
    // Completar com caracteres aleatórios
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 0; i < 8; i++) {
      result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Embaralhar
    result = result.split('').sort(() => Math.random() - 0.5).join('');
    
    setPassword(result);
    setConfirmPassword(result);
    setError('');
  };

  const handleConfirm = async () => {
    setError('');

    if (!isPasswordValid(password)) {
      setError('A senha não atende aos requisitos de segurança (8+ caracteres, maiúscula, minúscula, número).');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    const success = await onConfirm(password);
    if (success) {
      setPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setError('');
    onOpenChange(false);
  };

  if (!user) return null;

  const passwordStrength = getPasswordStrength(password);
  const isValid = isPasswordValid(password) && password === confirmPassword;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Recriar Autenticação do Usuário
          </DialogTitle>
          <DialogDescription>
            Este usuário existe no sistema mas não possui registro de autenticação.
            Defina uma nova senha para recriar o acesso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">{user.nome}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Nova Senha</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={generatePassword}
                title="Gerar senha segura automática"
              >
                <Key className="h-4 w-4 mr-1" />
                Gerar Senha
              </Button>
            </div>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              placeholder="Digite a nova senha"
              showStrengthIndicator
              showValidationList
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirme a senha"
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

          {password && isValid && (
            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Atenção:</strong> Anote a senha antes de confirmar. 
                O usuário precisará dela para fazer login.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading || !isValid}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recriando...
              </>
            ) : (
              'Recriar Usuário'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
