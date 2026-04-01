import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Book,
  BookOpen,
  Bot,
  FileText,
  Home,
  MessageSquare,
  Plus,
  Users,
  Shield,
  ShieldCheck,
  School,
  Calendar,
  GraduationCap,
  Settings
} from 'lucide-react';

const DashboardSidebar = () => {
  const { user, userProfile, userType } = useAuth();
  const { isAdmin, canManageUsers, canManageSystem, canCreateExercises, canManageCategories, isStudent, isDirecao, isCoordenador, canAccessProfessorArea, canManageSchools } = usePermissions();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  const getUserTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'admin': return 'Administrador';
      case 'direcao': return 'Direção';
      case 'coordenador': return 'Coordenador';
      case 'professor': return 'Professor';
      case 'aluno': return 'Aluno';
      case 'responsavel': return 'Responsável';
      default: return tipo;
    }
  };
  
  const userName = userProfile?.nome || user?.user_metadata?.nome || 'Usuário';
  const userTypeLabel = userType ? getUserTypeLabel(userType) : 'Carregando...';
  const isActive = (path: string) => location.pathname === path;

  // ==================== MENU POR NÍVEL ====================

  // ALUNO: Home, Minhas Atividades, Mais Exercícios
  if (isStudent()) {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <UserHeader userName={userName} userTypeLabel={userTypeLabel} isCollapsed={isCollapsed} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <MenuItem icon={Home} title="Home" path="/dashboard" isActive={isActive} />
                <MenuItem icon={BookOpen} title="Minhas Atividades" path="/atividades" isActive={isActive} />
                <MenuItem icon={Book} title="Mais Exercícios" path="/exercicios" isActive={isActive} />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }

  // Itens de gestão (Direção)
  const gestaoItems = [
    { title: "Usuários", icon: Users, path: "/admin/usuarios" },
    { title: "Cadastrar Usuário", icon: Plus, path: "/admin/usuarios/cadastrar" },
    { title: "Escolas", icon: School, path: "/admin/escolas" },
    { title: "Turmas", icon: BookOpen, path: "/admin/turmas" },
    { title: "Matrículas", icon: Users, path: "/admin/matriculas" },
  ];

  // Itens admin exclusivos
  const adminItems = [
    { title: "Painel Admin", icon: Shield, path: "/admin" },
    { title: "Usuários", icon: Users, path: "/admin/usuarios" },
    { title: "Cadastrar Usuário", icon: Plus, path: "/admin/usuarios/cadastrar" },
    { title: "Escolas", icon: School, path: "/admin/escolas" },
    { title: "Turmas", icon: BookOpen, path: "/admin/turmas" },
    { title: "Matrículas", icon: Users, path: "/admin/matriculas" },
    { title: "Atividades", icon: Calendar, path: "/admin/atividades" },
    { title: "Leads", icon: FileText, path: "/admin/leads" },
    { title: "Contatos", icon: MessageSquare, path: "/admin/contatos" },
  ];

  // Itens professor
  const professorItems = [
    { title: "Área do Professor", icon: GraduationCap, path: "/professor" },
    { title: "Minhas Atividades", icon: Calendar, path: "/professor/atividades" },
    { title: "Minhas Turmas", icon: Users, path: "/professor/turmas" },
  ];

  // Exercícios submenu (só para quem pode criar)
  const exerciseSubItems = [
    { title: "Todos os Exercícios", path: "/exercicios" },
    ...(canCreateExercises() ? [{ title: "Novo Exercício", path: "/exercicios/cadastrar" }] : []),
    ...(canManageCategories() ? [{ title: "Gerenciar Categorias", path: "/exercicios/cadastrar?tab=lista-categorias" }] : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <UserHeader userName={userName} userTypeLabel={userTypeLabel} isCollapsed={isCollapsed} />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuItem icon={Home} title="Home" path="/dashboard" isActive={isActive} />
              
              {/* Relatórios — todos exceto aluno */}
              <MenuItem icon={FileText} title="Relatórios" path="/relatorios" isActive={isActive} />

              {/* Exercícios — professor e admin com submenu, outros sem */}
              {canCreateExercises() ? (
                <SidebarMenuItem>
                  <SidebarMenuSub>
                    <SidebarMenuButton>
                      <Book />
                      <span>Exercícios</span>
                    </SidebarMenuButton>
                    {exerciseSubItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton isActive={isActive(subItem.path)} asChild>
                          <Link to={subItem.path}><span>{subItem.title}</span></Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              ) : null}

              {/* Atividades em Classe — visível para professor, coordenador, direção, admin */}
              {canAccessProfessorArea() && (
                <MenuItem icon={BookOpen} title="Atividades em Classe" path="/atividades" isActive={isActive} />
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Seção Professor — apenas admin e professor */}
        {canCreateExercises() && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary font-semibold">Professor</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {professorItems.map((item) => (
                    <MenuItem key={item.title} icon={item.icon} title={item.title} path={item.path} isActive={isActive} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Seção Gestão — apenas direção (sem ser admin) */}
        {isDirecao() && !isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-blue-700 font-semibold">Gestão</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {gestaoItems.map((item) => (
                    <MenuItem key={item.title} icon={item.icon} title={item.title} path={item.path} isActive={isActive} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        
        {/* Seção Administração — apenas admin */}
        {canManageSystem() && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-red-600 font-semibold">Administração</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <MenuItem key={item.title} icon={item.icon} title={item.title} path={item.path} isActive={isActive} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
};

// Componentes auxiliares
const UserHeader = ({ userName, userTypeLabel, isCollapsed }: { userName: string; userTypeLabel: string; isCollapsed: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-totalBlue">
      <img
        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0A2463&color=FFFFFF`}
        alt={userName}
        className="h-full w-full object-cover"
      />
    </div>
    {!isCollapsed && (
      <div className="flex flex-col overflow-hidden">
        <span className="font-medium truncate">{userName}</span>
        <span className="text-xs text-muted-foreground">{userTypeLabel}</span>
      </div>
    )}
  </div>
);

const MenuItem = ({ icon: Icon, title, path, isActive }: { icon: React.ElementType; title: string; path: string; isActive: (p: string) => boolean }) => (
  <SidebarMenuItem>
    <SidebarMenuButton isActive={isActive(path)} asChild>
      <Link to={path}>
        <Icon />
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

export default DashboardSidebar;
