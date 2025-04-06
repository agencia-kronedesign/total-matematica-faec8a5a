
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  BarChart2,
  MessageSquare,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const nome = user?.user_metadata?.nome || 'Usuário';
  const tipo = 'Aluno';
  const escola = 'Escola Santa Cecília - 5º ano C';

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Perfil do usuário */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarImage src="" />
            <AvatarFallback className="bg-totalBlue text-white text-xl">
              {nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-medium text-gray-900">{nome}</h3>
          <p className="text-sm text-gray-500">{tipo}</p>
        </div>
      </div>

      {/* Informações da escola */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center text-totalBlue font-medium">
          {escola}
        </div>
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-2">
          <Link to="/dashboard/perfil" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <User size={20} className="mr-3 text-gray-500" />
            <span>Meu perfil</span>
          </Link>

          <div className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <div className="flex items-center">
              <BarChart2 size={20} className="mr-3 text-gray-500" />
              <span>Informações</span>
            </div>
            <Badge className="bg-totalBlue text-white">24</Badge>
          </div>

          <Link to="/dashboard/relatorios" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <BarChart2 size={20} className="mr-3 text-gray-500" />
            <span>Relatórios</span>
          </Link>

          <div className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <div className="flex items-center">
              <MessageSquare size={20} className="mr-3 text-gray-500" />
              <span>Mensagens</span>
            </div>
            <Badge className="bg-yellow-500 text-white">14</Badge>
          </div>

          <Link to="/dashboard/exercicios" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <BookOpen size={20} className="mr-3 text-gray-500" />
            <span>Exercícios</span>
          </Link>

          <Link to="/dashboard/atividades" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <CheckSquare size={20} className="mr-3 text-gray-500" />
            <span>Atividades em Classe</span>
          </Link>

          <div className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <div className="flex items-center">
              <CheckSquare size={20} className="mr-3 text-gray-500" />
              <span>Tarefas</span>
            </div>
            <Badge className="bg-red-500 text-white">NOVA</Badge>
          </div>

          <Link to="/dashboard/exercicio-dia" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <BookOpen size={20} className="mr-3 text-gray-500" />
            <span>Exercício do dia</span>
          </Link>

          <Link to="/dashboard/exercicios-feitos" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <CheckSquare size={20} className="mr-3 text-gray-500" />
            <span>Exercícios Feitos</span>
          </Link>
        </div>

        <div className="p-2 border-t border-gray-200 mt-2">
          <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Ajude a melhorar!
          </h3>

          <Link to="/dashboard/reportar-erro" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <AlertTriangle size={20} className="mr-3 text-gray-500" />
            <span>Achei um erro!</span>
          </Link>

          <Link to="/dashboard/sugestao" className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md">
            <MessageCircle size={20} className="mr-3 text-gray-500" />
            <span>Tenho uma sugestão!</span>
          </Link>
        </div>
      </nav>

      {/* Botão de sair */}
      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="ghost" 
          className="w-full flex items-center text-gray-700 hover:bg-gray-100"
          onClick={() => signOut()}
        >
          <LogOut size={20} className="mr-3" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
