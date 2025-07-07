import React, { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, Shield, Download, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import CreateAdminUser from '@/components/admin/CreateAdminUser';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
  ativo: boolean;
  created_at: string;
}

const UserManagement = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { canDeleteStudents, canImportData, canControlSubordinateSecretaries } = usePermissions();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    const filtered = usuarios.filter(user => 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.tipo_usuario.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsuarios(filtered);
  }, [usuarios, searchTerm]);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });

      fetchUsuarios();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateUserType = async (userId: string, newType: Database['public']['Enums']['user_type']) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ tipo_usuario: newType })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Tipo de usuário atualizado",
        description: `Usuário agora é ${getUserTypeLabel(newType)}`,
      });

      fetchUsuarios();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar tipo de usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const userTypes: Database['public']['Enums']['user_type'][] = [
    'admin',
    'direcao',
    'coordenador', 
    'professor',
    'aluno',
    'responsavel'
  ];

  const getUserTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'direcao':
        return 'bg-orange-100 text-orange-800';
      case 'coordenador':
        return 'bg-purple-100 text-purple-800';
      case 'professor':
        return 'bg-blue-100 text-blue-800';
      case 'aluno':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os usuários do sistema
          </p>
        </div>
        <div className="flex gap-2">
          {canImportData() && (
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar Dados
            </Button>
          )}
          <Link to="/admin/usuarios/cadastrar">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </Link>
        </div>
      </div>

      {/* Create Admin User */}
      <div className="flex justify-center">
        <CreateAdminUser />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Pesquise e filtre usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar por nome, email ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsuarios.length})</CardTitle>
          <CardDescription>
            Lista de todos os usuários cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Select
                      value={usuario.tipo_usuario}
                      onValueChange={(value) => updateUserType(usuario.id, value as Database['public']['Enums']['user_type'])}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue>
                          <Badge className={getUserTypeColor(usuario.tipo_usuario)}>
                            {getUserTypeLabel(usuario.tipo_usuario)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {userTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              {type === 'admin' && <Shield className="w-4 h-4" />}
                              {getUserTypeLabel(type)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.ativo ? "default" : "secondary"}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center space-x-2">
                       <Link to={`/admin/usuarios/editar/${usuario.id}`}>
                         <Button size="sm" variant="outline">
                           <Edit className="w-4 h-4" />
                         </Button>
                       </Link>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={() => toggleUserStatus(usuario.id, usuario.ativo)}
                       >
                         {usuario.ativo ? (
                           <UserX className="w-4 h-4" />
                         ) : (
                           <UserCheck className="w-4 h-4" />
                         )}
                       </Button>
                       {/* Botão de descadastro apenas para alunos se o usuário tem permissão */}
                       {canDeleteStudents() && usuario.tipo_usuario === 'aluno' && (
                         <Button
                           size="sm"
                           variant="outline"
                           className="text-destructive hover:text-destructive"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       )}
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;