import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  Home,
  Calendar,
  BookOpen,
  LogOut,
  ArrowLeft,
  Plus,
  BarChart2,
} from 'lucide-react';

const ProfessorSidebar = () => {
  const { user, signOut, userProfile } = useAuth();
  const location = useLocation();
  
  const userName = userProfile?.nome || user?.user_metadata?.nome || 'Professor';
  
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { title: "Dashboard", icon: Home, path: "/professor" },
    { title: "Minhas Atividades", icon: Calendar, path: "/professor/atividades" },
    { title: "Criar Atividade", icon: Plus, path: "/professor/atividades?criar=true" },
  ];

  const quickLinks = [
    { title: "Exercícios", icon: BookOpen, path: "/exercicios" },
    { title: "Novo Exercício", icon: Plus, path: "/exercicios/cadastrar" },
    { title: "Relatórios", icon: BarChart2, path: "/relatorios" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0A2463&color=FFFFFF`}
              alt={userName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{userName}</span>
            <span className="text-xs text-muted-foreground">Professor</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={isActive(item.path.split('?')[0])} asChild>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Acesso Rápido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
                    <span>Voltar ao Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <SidebarMenuButton 
          onClick={signOut}
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ProfessorSidebar;
