import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useEscolas } from '@/hooks/useEscolas';
import { EscolaForm } from '@/components/admin/EscolaForm';
import { usePermissions } from '@/hooks/usePermissions';

export default function EscolasManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cidadeFilter, setCidadeFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEscola, setEditingEscola] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const { canManageSystem } = usePermissions();
  const { escolas, loading, deleteEscola, toggleStatus, refreshEscolas } = useEscolas();

  // Redirect if not admin
  if (!canManageSystem()) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  const filteredEscolas = escolas?.filter(escola => {
    const matchesSearch = !searchTerm || (
      escola.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escola.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escola.cnpj?.includes(searchTerm)
    );
    
    const matchesCidade = !cidadeFilter || 
      escola.cidade?.toLowerCase().includes(cidadeFilter.toLowerCase());
    
    const matchesEstado = !estadoFilter || 
      escola.estado?.toLowerCase().includes(estadoFilter.toLowerCase());
    
    return matchesSearch && matchesCidade && matchesEstado;
  }) || [];

  const handleEdit = (escola: any) => {
    setEditingEscola(escola);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEscola(id);
      toast({
        title: "Escola excluída",
        description: "A escola foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a escola.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingStatus(id);
      await toggleStatus(id, currentStatus);
      toast({
        title: "Status atualizado",
        description: `Escola ${!currentStatus ? 'ativada' : 'desativada'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da escola.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEscola(null);
    refreshEscolas();
  };

  if (showForm) {
    return (
      <EscolaForm 
        escola={editingEscola} 
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Escolas</h1>
          <p className="text-muted-foreground">
            Gerencie as escolas cadastradas no sistema
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Escola
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escolas Cadastradas</CardTitle>
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por cidade..."
                value={cidadeFilter}
                onChange={(e) => setCidadeFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex items-center space-x-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por estado..."
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Razão Social</TableHead>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead className="hidden md:table-cell">CNPJ</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEscolas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {searchTerm || cidadeFilter || estadoFilter ? 'Nenhuma escola encontrada' : 'Nenhuma escola cadastrada'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEscolas.map((escola) => (
                      <TableRow key={escola.id}>
                        <TableCell className="font-medium">
                          <div className="min-w-[150px]">
                            {escola.razao_social}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[120px]">
                            {escola.nome_fantasia || '-'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="min-w-[140px]">
                            {escola.cnpj || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[100px]">
                            {escola.cidade || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[80px]">
                            {escola.estado || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Switch
                              checked={escola.status}
                              onCheckedChange={() => handleToggleStatus(escola.id, escola.status)}
                              disabled={updatingStatus === escola.id}
                              className="transition-opacity duration-200"
                            />
                            <span className="text-sm font-medium">
                              {escola.status ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 min-w-[100px]">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(escola)}
                              title="Editar escola"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" title="Excluir escola">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a escola "{escola.razao_social}"? 
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(escola.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}