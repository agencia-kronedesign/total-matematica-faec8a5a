
import React from 'react';
import Logo from '@/components/Logo';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react';

const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  // Extrair nome do usuário do objeto user (assumindo que está em user.user_metadata.nome)
  const userName = user?.user_metadata?.nome || 'Aluno';
  
  // Determinar se o item está ativo com base na rota atual
  const isActive = (path: string) => location.pathname === path;
  
  const menuItems = [
    { title: "Informações", icon: Info, path: "/informacoes", badge: 6 },
    { title: "Relatórios", icon: FileText, path: "/relatorios" },
    { title: "Mensagens", icon: MessageSquare, path: "/mensagens", badge: 14 },
    { title: "Exercícios", icon: Book, path: "/exercicios" },
    { title: "Atividades em Classe", icon: BookOpen, path: "/atividades" },
    { title: "Tarefas", icon: List, path: "/tarefas", badge: "NOVA" },
    { title: "Exercício do dia", icon: BarChart2, path: "/exercicio-do-dia" },
    { title: "Exercícios Feitos", icon: FileText, path: "/exercicios-feitos" },
  ];

  const supportItems = [
    { title: "Ajuda e melhorias", icon: HelpCircle, path: "/ajuda" },
    { title: "Achei um erro!", icon: AlertTriangle, path: "/reportar-erro" },
    { title: "Tenho uma sugestão!", icon: Settings, path: "/sugestao" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-totalBlue">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0A2463&color=FFFFFF`}
              alt={userName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{userName}</span>
            <span className="text-xs text-muted-foreground">Aluno</span>
          </div>
        </div>
        <div className="mt-4 rounded-md bg-gray-100 p-2">
          <div className="text-xs font-medium text-blue-900">Escola Santa Cecília - 5º ano C</div>
        </div>
        <div className="mt-3">
          <Link to="/perfil" className="text-xs text-muted-foreground hover:underline">
            Meu perfil
          </Link>
        </div>
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
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
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
          <span>Sair</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
