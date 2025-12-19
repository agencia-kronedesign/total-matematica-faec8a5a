import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Calendar, Users, Book, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeleteAtividade, useTurmas } from '@/hooks/useAtividades';
import { useAtividadesProfessor } from '@/hooks/useAtividadesProfessor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AtividadeFormDialog from '@/components/atividades/AtividadeFormDialog';
import AtividadeDetailDialog from '@/components/atividades/AtividadeDetailDialog';
import { Skeleton } from '@/components/ui/skeleton';

const ProfessorAtividades = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState('all');
  const [selectedTipo, setSelectedTipo] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState<any>(null);
  const [viewingAtividade, setViewingAtividade] = useState<any>(null);

  const { data: atividades, isLoading } = useAtividadesProfessor();
  const { data: turmas } = useTurmas();
  const deleteAtividade = useDeleteAtividade();

  // Abrir dialog de criar se tiver ?criar=true na URL
  useEffect(() => {
    if (searchParams.get('criar') === 'true') {
      setIsCreateDialogOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  console.log('[ProfessorAtividade] Renderizando lista de atividades');

  const filteredAtividades = atividades?.filter(atividade => {
    const matchesSearch = atividade.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         atividade.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurma = selectedTurma === 'all' || atividade.turma_id === selectedTurma;
    const matchesTipo = selectedTipo === 'all' || atividade.tipo === selectedTipo;
    
    return matchesSearch && matchesTurma && matchesTipo;
  });

  const handleEdit = (atividade: any) => {
    console.log('[ProfessorAtividade] Editando:', atividade.id);
    setEditingAtividade(atividade);
  };

  const handleView = (atividade: any) => {
    console.log('[ProfessorAtividade] Visualizando:', atividade.id);
    setViewingAtividade(atividade);
  };

  const handleDelete = async (id: string) => {
    console.log('[ProfessorAtividade] Deletando:', id);
    await deleteAtividade.mutateAsync(id);
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ativa': return 'success';
      case 'finalizada': return 'secondary';
      case 'cancelada': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Minhas Atividades</h1>
          <p className="text-muted-foreground">Gerencie as atividades que você criou</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nova Atividade
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar atividades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedTurma} onValueChange={setSelectedTurma}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as turmas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {turmas?.map(turma => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome} - {turma.ano_letivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="casa">Para Casa</SelectItem>
                <SelectItem value="aula">Em Aula</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => {
                setSearchTerm('');
                setSelectedTurma('all');
                setSelectedTipo('all');
              }}
            >
              <Filter className="h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Atividades - Cards responsivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAtividades?.map(atividade => (
          <Card key={atividade.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg line-clamp-2">{atividade.titulo}</CardTitle>
                <Badge variant={getStatusColor(atividade.status) as any} className="shrink-0">
                  {atividade.status || 'ativa'}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{atividade.turma?.nome}</span>
                </div>
                <Badge variant="outline" className={atividade.tipo === 'casa' ? 'text-blue-600 border-blue-200' : 'text-purple-600 border-purple-200'}>
                  {atividade.tipo === 'casa' ? 'Para Casa' : 'Em Aula'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {atividade.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {atividade.descricao}
                </p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Criada: {format(new Date(atividade.data_envio), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                
                {atividade.data_limite && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-destructive" />
                    <span>Prazo: {format(new Date(atividade.data_limite), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-muted-foreground" />
                  <span>{atividade.exercicios?.length || 0} exercício(s)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(atividade)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(atividade)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a atividade "{atividade.titulo}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(atividade.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAtividades?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || (selectedTurma !== 'all') || (selectedTipo !== 'all')
                ? 'Tente ajustar os filtros para encontrar atividades.'
                : 'Comece criando sua primeira atividade.'}
            </p>
            {!searchTerm && selectedTurma === 'all' && selectedTipo === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Atividade
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AtividadeFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      <AtividadeFormDialog
        open={!!editingAtividade}
        onOpenChange={(open) => !open && setEditingAtividade(null)}
        atividade={editingAtividade}
      />

      <AtividadeDetailDialog
        open={!!viewingAtividade}
        onOpenChange={(open) => !open && setViewingAtividade(null)}
        atividade={viewingAtividade}
      />
    </div>
  );
};

export default ProfessorAtividades;
