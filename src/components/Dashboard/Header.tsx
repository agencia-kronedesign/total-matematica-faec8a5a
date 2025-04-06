
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { user } = useAuth();
  const nome = user?.user_metadata?.nome || 'Usuário';

  return (
    <header className="bg-totalBlue text-white h-16 px-6 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-8">
        <Link to="/" className="text-2xl font-bold">
          <img 
            src="/lovable-uploads/94e644b6-5de2-4e94-9c85-9edcd5f7a0ee.png" 
            alt="Total Matemática" 
            className="h-8" 
          />
        </Link>

        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-opacity-80 transition-colors">Home</Link>
          <Link to="/quem-somos" className="hover:text-opacity-80 transition-colors">Quem somos</Link>
          <Link to="/contato" className="hover:text-opacity-80 transition-colors">Contato</Link>
          <Link to="/ajuda" className="hover:text-opacity-80 transition-colors">Ajuda!</Link>
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="relative p-1 rounded-full hover:bg-blue-800">
          <Mail className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
            2
          </Badge>
        </Button>
        
        <Link to="/dashboard/perfil" className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 border-2 border-yellow-400">
            <AvatarImage src="" />
            <AvatarFallback className="bg-yellow-500 text-blue-900">
              {nome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{nome}</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
