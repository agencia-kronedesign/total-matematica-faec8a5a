import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useEscolas } from '@/hooks/useEscolas';
import { EscolaForm } from '@/components/admin/EscolaForm';
import { usePermissions } from '@/hooks/usePermissions';

export default function EscolasManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEscola, setEditingEscola] = useState<any>(null);
  const { toast } = useToast();
  const { canManageSystem } = usePermissions();
  const { escolas, loading, deleteEscola, refreshEscolas } = useEscolas();

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

  const filteredEscolas = escolas?.filter(escola => 
    escola.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    escola.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    escola.cnpj?.includes(searchTerm)
  ) || [];

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
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
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
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Cidade/Estado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEscolas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'Nenhuma escola encontrada' : 'Nenhuma escola cadastrada'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEscolas.map((escola) => (
                      <TableRow key={escola.id}>
                        <TableCell className="font-medium">
                          {escola.razao_social}
                        </TableCell>
                        <TableCell>{escola.nome_fantasia}</TableCell>
                        <TableCell>{escola.cnpj}</TableCell>
                        <TableCell>
                          {escola.cidade && escola.estado ? 
                            `${escola.cidade}/${escola.estado}` : 
                            escola.cidade || escola.estado || '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant={escola.status ? 'default' : 'secondary'}>
                            {escola.status ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(escola)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
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