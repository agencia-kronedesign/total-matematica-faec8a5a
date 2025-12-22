import React from 'react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  BarChart2,
  Book,
  BookOpen,
  FileText,
  HelpCircle,
  Home,
  Info,
  List,
  LogOut,
  MessageSquare,
  Settings,
  AlertTriangle,
  Plus,
  ListFilter,
  Users,
  Shield,
  School,
  Database,
  Calendar,
  GraduationCap
} from 'lucide-react';

const DashboardSidebar = () => {
  const { user, signOut, userProfile, userType } = useAuth();
  const { isAdmin, canManageUsers, canManageSystem, canCreateExercises, canManageCategories, isStudent } = usePermissions();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  const getUserTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return 'Administrador';
      case 'direcao':
        return 'Direção';
      case 'coordenador':
        return 'Coordenador';
      case 'professor':
        return 'Professor';
      case 'aluno':
        return 'Aluno';
      case 'responsavel':
        return 'Responsável';
      default:
        return tipo;
    }
  };
  
  const userName = userProfile?.nome || user?.user_metadata?.nome || 'Usuário';
  const userTypeLabel = userType ? getUserTypeLabel(userType) : 'Carregando...';
  
  const isActive = (path: string) => location.pathname === path;
  
  // Menu items baseado nas permissões do usuário
  const getMenuItems = () => {
    const baseItems = [];
    
    if (isStudent()) {
      // Menu para alunos - apenas visualização e resolução
      return [
        { title: "Minhas Atividades", icon: BookOpen, path: "/atividades" },
        { title: "Mais Exercícios", icon: Book, path: "/exercicios" },
        { title: "Exercícios Feitos", icon: FileText, path: "/exercicios-feitos" },
        { title: "Exercício do dia", icon: BarChart2, path: "/exercicio-do-dia" },
      ];
    }
    
    // Menu para professores, coordenadores e admins
    const exerciseSubItems = [
      { title: "Todos os Exercícios", path: "/exercicios" },
    ];
    
    if (canCreateExercises()) {
      exerciseSubItems.push({ title: "Novo Exercício", path: "/exercicios/cadastrar" });
    }
    
    if (canManageCategories()) {
      exerciseSubItems.push({ title: "Gerenciar Categorias", path: "/exercicios/cadastrar?tab=lista-categorias" });
    }
    
    return [
      { title: "Informações", icon: Info, path: "/informacoes", badge: 6 },
      { title: "Relatórios", icon: FileText, path: "/relatorios" },
      { title: "Mensagens", icon: MessageSquare, path: "/mensagens", badge: 14 },
      {
        title: "Exercícios",
        icon: Book,
        path: "/exercicios",
        subItems: exerciseSubItems
      },
      { title: "Atividades em Classe", icon: BookOpen, path: "/atividades" },
      { title: "Tarefas", icon: List, path: "/tarefas", badge: "NOVA" },
      { title: "Exercício do dia", icon: BarChart2, path: "/exercicio-do-dia" },
      { title: "Exercícios Feitos", icon: FileText, path: "/exercicios-feitos" },
    ];
  };
  
  const menuItems = getMenuItems();

  const professorItems = [
    { title: "Área do Professor", icon: GraduationCap, path: "/professor" },
    { title: "Minhas Atividades", icon: Calendar, path: "/professor/atividades" },
    { title: "Minhas Turmas", icon: Users, path: "/professor/turmas" },
  ];

  const adminItems = [
    { title: "Painel Admin", icon: Shield, path: "/admin" },
    { title: "Usuários", icon: Users, path: "/admin/usuarios" },
    { title: "Cadastrar Usuário", icon: Plus, path: "/admin/usuarios/cadastrar" },
    { title: "Escolas", icon: School, path: "/admin/escolas" },
    { title: "Turmas", icon: BookOpen, path: "/admin/turmas" },
    { title: "Matrículas", icon: Users, path: "/admin/matriculas" },
    { title: "Atividades", icon: Calendar, path: "/admin/atividades" },
    { title: "Leads", icon: FileText, path: "/admin/leads" },
    { title: "Relatórios Admin", icon: Database, path: "/admin/relatorios" },
    { title: "Configurações", icon: Settings, path: "/admin/configuracoes" },
  ];

  const supportItems = [
    { title: "Ajuda e melhorias", icon: HelpCircle, path: "/ajuda" },
    { title: "Achei um erro!", icon: AlertTriangle, path: "/reportar-erro" },
    { title: "Tenho uma sugestão!", icon: Settings, path: "/sugestao" },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
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
        {!isCollapsed && (
          <>
            <div className="mt-4 rounded-md bg-gray-100 p-2">
              <div className="text-xs font-medium text-blue-900">Escola Santa Cecília - 5º ano C</div>
            </div>
            <div className="mt-3">
              <Link to="/perfil" className="text-xs text-muted-foreground hover:underline">
                Meu perfil
              </Link>
            </div>
          </>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/dashboard")} asChild>
                  <Link to="/dashboard">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <SidebarMenuSub>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {item.subItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            isActive={isActive(subItem.path)}
                            asChild
                          >
                            <Link to={subItem.path}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : (
                    <SidebarMenuButton isActive={isActive(item.path)} asChild>
                      <Link to={item.path}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <div className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium ${
                            item.badge === "NOVA" 
                              ? "bg-yellow-300 text-totalBlue" 
                              : "bg-totalBlue text-white"
                          }`}>
                            {item.badge}
                          </div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Professor Section */}
        {canCreateExercises() && !isStudent() && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary font-semibold">
                Professor
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {professorItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={isActive(item.path)} asChild>
                        <Link to={item.path}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        
        {/* Admin Section */}
        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-red-600 font-semibold">
                Administração
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton isActive={isActive(item.path)} asChild>
                        <Link to={item.path}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <SidebarMenuButton 
          onClick={signOut}
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut />
          {!isCollapsed && <span>Sair</span>}
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default DashboardSidebar;
