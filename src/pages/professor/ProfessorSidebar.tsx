import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
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
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  Calendar,
  BookOpen,
  ArrowLeft,
  Plus,
  BarChart2,
  Users,
} from 'lucide-react';
import { USER_TYPE_LABELS } from '@/types/user';

const ProfessorSidebar = () => {
  const { user, userProfile } = useAuth();
  const { canCreateExercises, canAccessProfessorArea, userType } = usePermissions();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  const userName = userProfile?.nome || user?.user_metadata?.nome || 'Usuário';
  const roleLabel = userType ? USER_TYPE_LABELS[userType as keyof typeof USER_TYPE_LABELS] || userType : 'Usuário';
  
  const isActive = (path: string) => location.pathname === path;

  const canCreate = canCreateExercises();

  const menuItems = [
    { title: "Dashboard", icon: Home, path: "/professor", show: true },
    { title: "Minhas Atividades", icon: Calendar, path: "/professor/atividades", show: canCreate },
    { title: "Minhas Turmas", icon: Users, path: "/professor/turmas", show: true },
    { title: "Criar Atividade", icon: Plus, path: "/professor/atividades?criar=true", show: canCreate },
  ].filter(item => item.show);

  const quickLinks = [
    { title: "Exercícios", icon: BookOpen, path: "/exercicios", show: true },
    { title: "Novo Exercício", icon: Plus, path: "/exercicios/cadastrar", show: canCreate },
    { title: "Relatórios", icon: BarChart2, path: "/professor/atividades", show: true },
  ].filter(item => item.show);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-primary">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0A2463&color=FFFFFF`}
              alt={userName}
              className="h-full w-full object-cover"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">{userName}</span>
              <span className="text-xs text-muted-foreground">Professor</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={isActive(item.path.split('?')[0])} asChild>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Acesso Rápido</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {quickLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    {!isCollapsed && <span>Voltar ao Dashboard</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
};

export default ProfessorSidebar;
