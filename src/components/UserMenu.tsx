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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, BookOpen, LayoutDashboard, Shield, Users, School, FileText } from 'lucide-react';

const getInitials = (nome: string | undefined) => {
  if (!nome) return 'U';
  const parts = nome.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserMenu = () => {
  const { user, userProfile, signOut } = useAuth();
  const { isAdmin, isDirecao, isCoordenador } = usePermissions();
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
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={userProfile?.foto_url || undefined} 
              alt={userProfile?.nome || 'Avatar do usuário'} 
            />
            <AvatarFallback className="bg-totalBlue text-white text-sm font-semibold">
              {getInitials(userProfile?.nome)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>Olá, {primeiroNome}!</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* ALUNO / RESPONSÁVEL */}
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

        {/* PROFESSOR */}
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

        {/* COORDENADOR — apenas monitoramento */}
        {isCoordenador() && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/professor/turmas" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-4 w-4" />
                <span>Turmas</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/relatorios" className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                <span>Relatórios</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {/* DIREÇÃO — gestão + monitoramento */}
        {isDirecao() && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin/usuarios" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-4 w-4" />
                <span>Gestão de Usuários</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/escolas" className="flex items-center gap-2 cursor-pointer">
                <School className="h-4 w-4" />
                <span>Escolas</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/professor/turmas" className="flex items-center gap-2 cursor-pointer">
                <Users className="h-4 w-4" />
                <span>Turmas</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/relatorios" className="flex items-center gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                <span>Relatórios</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {/* ADMIN */}
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
