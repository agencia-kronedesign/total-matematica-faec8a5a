import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, BookOpen, LayoutDashboard, Shield, Users } from 'lucide-react';

const UserMenu = () => {
  const { user, userProfile, signOut } = useAuth();
  const { isAdmin } = usePermissions();
  const navigate = useNavigate();

  const primeiroNome = userProfile?.nome?.split(' ')[0] || 'Usuário';
  const tipoUsuario = userProfile?.tipo_usuario;
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link to="/entrar">
          <Button className="bg-totalYellow text-totalBlue font-semibold hover:bg-opacity-90 transition-colors">
            Entrar
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative gap-2 px-3">
          <span className="hidden sm:inline text-sm font-medium text-totalBlue">{primeiroNome}</span>
          <div className="h-8 w-8 rounded-full bg-totalBlue text-white flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>Olá, {primeiroNome}!</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Links dinâmicos por perfil */}
        {(tipoUsuario === 'aluno' || tipoUsuario === 'responsavel') && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/atividades" className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="h-4 w-4" />
                <span>Minhas Atividades</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {tipoUsuario === 'professor' && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/professor/atividades" className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="h-4 w-4" />
                <span>Minhas Atividades</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/professor/turmas" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-4 w-4" />
                <span>Minhas Turmas</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {(tipoUsuario === 'coordenador' || tipoUsuario === 'direcao') && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/professor/atividades" className="flex items-center gap-2 cursor-pointer">
                <BookOpen className="h-4 w-4" />
                <span>Atividades</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/professor/turmas" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-4 w-4" />
                <span>Turmas</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4" />
              <span>Painel Admin</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/perfil" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>Meu Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
