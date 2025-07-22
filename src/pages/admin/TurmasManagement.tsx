import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Users, School, Calendar, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TurmaActions from '@/components/admin/turmas/TurmaActions';
import DeleteTurmaDialog from '@/components/admin/turmas/DeleteTurmaDialog';

interface Turma {
  id: string;
  nome: string;
  escola_id: string;
  ano_letivo: number;
  turno: string | null;
  nivel_ensino: string | null;
  status: boolean;
  created_at: string;
  escola?: {
    razao_social: string;
  };
}

interface Escola {
  id: string;
  razao_social: string;
}

const TurmasManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [deletingTurma, setDeletingTurma] = useState<Turma | null>(null);
  const [showCustomLevel, setShowCustomLevel] = useState(false);
  const [customLevel, setCustomLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTurmas, setFilteredTurmas] = useState<Turma[]>([]);
  const [selectedEscola, setSelectedEscola] = useState<string>('all');
  const [selectedAno, setSelectedAno] = useState<string>('all');
  const [formData, setFormData] = useState({
    nome: '',
    escola_id: '',
    ano_letivo: new Date().getFullYear(),
    turno: '',
    nivel_ensino: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar turmas
  const { data: turmas, isLoading: isLoadingTurmas } = useQuery({
    queryKey: ['turmas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          escolas:escola_id(razao_social)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Turma[];
    }
  });

  // Buscar escolas para o formulário
  const { data: escolas } = useQuery({
    queryKey: ['escolas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escolas')
        .select('id, razao_social')
        .eq('status', true)
        .order('razao_social');

      if (error) throw error;
      return data as Escola[];
    }
  });

  // Buscar contagem de matrículas por turma
  const { data: matriculasCount } = useQuery({
    queryKey: ['matriculas-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matriculas')
        .select('turma_id')
        .eq('status', 'ativo');

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(m => {
        counts[m.turma_id] = (counts[m.turma_id] || 0) + 1;
      });
      
      return counts;
    }
  });

  // Filtrar turmas baseado na busca e filtros
  useEffect(() => {
    if (!turmas) {
      setFilteredTurmas([]);
      return;
    }

    let filtered = turmas.filter(turma => {
      const matchesSearch = !searchTerm || 
        turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turma.escola?.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        turma.ano_letivo.toString().includes(searchTerm) ||
        (turma.nivel_ensino && turma.nivel_ensino.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (turma.turno && turma.turno.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesEscola = !selectedEscola || selectedEscola === 'all' || turma.escola_id === selectedEscola;
      const matchesAno = !selectedAno || selectedAno === 'all' || turma.ano_letivo.toString() === selectedAno;

      return matchesSearch && matchesEscola && matchesAno;
    });

    setFilteredTurmas(filtered);
  }, [turmas, searchTerm, selectedEscola, selectedAno]);

  // Obter anos letivos únicos para o filtro
  const anosLetivos = React.useMemo(() => {
    if (!turmas) return [];
    const anos = [...new Set(turmas.map(t => t.ano_letivo))];
    return anos.sort((a, b) => b - a);
  }, [turmas]);

  // Criar turma
  const createTurmaMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('turmas')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Turma criada",
        description: "A turma foi criada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar turma",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Atualizar turma
  const updateTurmaMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: string }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from('turmas')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      setIsEditDialogOpen(false);
      setEditingTurma(null);
      resetForm();
      toast({
        title: "Turma atualizada",
        description: "A turma foi atualizada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar turma",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Alternar status da turma
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase
        .from('turmas')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast({
        title: "Status atualizado",
        description: "O status da turma foi atualizado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Deletar turma
  const deleteTurmaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      queryClient.invalidateQueries({ queryKey: ['matriculas-count'] });
      setDeletingTurma(null);
      toast({
        title: "Turma deletada",
        description: "A turma foi deletada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar turma",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      escola_id: '',
      ano_letivo: new Date().getFullYear(),
      turno: '',
      nivel_ensino: ''
    });
    setShowCustomLevel(false);
    setCustomLevel('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEscola('all');
    setSelectedAno('all');
  };

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      escola_id: turma.escola_id,
      ano_letivo: turma.ano_letivo,
      turno: turma.turno || '',
      nivel_ensino: turma.nivel_ensino || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (turma: Turma) => {
    setDeletingTurma(turma);
  };

  const handleToggleStatus = (turma: Turma) => {
    toggleStatusMutation.mutate({ id: turma.id, status: !turma.status });
  };

  const handleNivelChange = (value: string) => {
    if (value === 'outros') {
      setShowCustomLevel(true);
      setFormData(prev => ({ ...prev, nivel_ensino: '' }));
    } else {
      setShowCustomLevel(false);
      setCustomLevel('');
      setFormData(prev => ({ ...prev, nivel_ensino: value }));
    }
  };

  const handleCustomLevelChange = (value: string) => {
    setCustomLevel(value);
    setFormData(prev => ({ ...prev, nivel_ensino: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.escola_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e escola são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (showCustomLevel && !customLevel.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, especifique o nível de ensino.",
        variant: "destructive"
      });
      return;
    }
    
    if (editingTurma) {
      updateTurmaMutation.mutate({ ...formData, id: editingTurma.id });
    } else {
      createTurmaMutation.mutate(formData);
    }
  };

  const formatNivelEnsino = (nivel: string | null) => {
    if (!nivel) return '';
    
    const formatMap: Record<string, string> = {
      'fundamental_1': 'Fundamental I',
      'fundamental_2': 'Fundamental II',
      'medio': 'Ensino Médio',
      'superior': 'Superior'
    };
    
    return formatMap[nivel] || nivel;
  };

  if (isLoadingTurmas) {
    return <div className="p-6">Carregando turmas...</div>;
  }

  const TurmaDialog = ({ isOpen, onOpenChange, title, description }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="col-span-3"
                placeholder="Ex: 7º Ano A"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="escola" className="text-right">Escola *</Label>
              <Select value={formData.escola_id} onValueChange={(value) => setFormData(prev => ({ ...prev, escola_id: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  {escolas?.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ano_letivo" className="text-right">Ano Letivo</Label>
              <Input
                id="ano_letivo"
                type="number"
                value={formData.ano_letivo}
                onChange={(e) => setFormData(prev => ({ ...prev, ano_letivo: parseInt(e.target.value) }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="turno" className="text-right">Turno</Label>
              <Select value={formData.turno} onValueChange={(value) => setFormData(prev => ({ ...prev, turno: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manhã">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nivel_ensino" className="text-right">Nível</Label>
              <div className="col-span-3 space-y-2">
                <Select value={showCustomLevel ? 'outros' : formData.nivel_ensino} onValueChange={handleNivelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundamental_1">Fundamental I</SelectItem>
                    <SelectItem value="fundamental_2">Fundamental II</SelectItem>
                    <SelectItem value="medio">Ensino Médio</SelectItem>
                    <SelectItem value="superior">Superior</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                
                {showCustomLevel && (
                  <Input
                    placeholder="Digite o nível de ensino"
                    value={customLevel}
                    onChange={(e) => handleCustomLevelChange(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={createTurmaMutation.isPending || updateTurmaMutation.isPending}
            >
              {(createTurmaMutation.isPending || updateTurmaMutation.isPending) 
                ? (editingTurma ? 'Atualizando...' : 'Criando...') 
                : (editingTurma ? 'Atualizar Turma' : 'Criar Turma')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie as turmas do sistema
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <TurmaDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            title="Criar Nova Turma"
            description="Preencha os dados da nova turma"
          />
        </Dialog>
      </div>

      {/* Card de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Pesquise e filtre turmas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar por nome, escola, ano letivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                disabled={!searchTerm && (!selectedEscola || selectedEscola === 'all') && (!selectedAno || selectedAno === 'all')}
              >
                Limpar Filtros
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedEscola} onValueChange={setSelectedEscola}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por escola" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {escolas?.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedAno} onValueChange={setSelectedAno}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filtrar por ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {anosLetivos.map((ano) => (
                    <SelectItem key={ano} value={ano.toString()}>
                      {ano}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <TurmaDialog
        isOpen={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingTurma(null);
            resetForm();
          }
        }}
        title="Editar Turma"
        description="Atualize os dados da turma"
      />

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteTurmaDialog
        turma={deletingTurma}
        isOpen={!!deletingTurma}
        onClose={() => setDeletingTurma(null)}
        onConfirm={() => deletingTurma && deleteTurmaMutation.mutate(deletingTurma.id)}
        isDeleting={deleteTurmaMutation.isPending}
        matriculasCount={deletingTurma ? (matriculasCount?.[deletingTurma.id] || 0) : 0}
      />

      {/* Lista de Turmas */}
      <Card>
        <CardHeader>
          <CardTitle>Turmas ({filteredTurmas.length})</CardTitle>
          <CardDescription>
            Lista de turmas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTurmas?.map((turma) => (
              <Card key={turma.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{turma.nome}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4" />
                          {turma.escola?.razao_social}
                        </div>
                      </CardDescription>
                    </div>
                    <TurmaActions
                      turma={turma}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      isUpdating={toggleStatusMutation.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Ano Letivo:
                      </span>
                      <span className="font-medium">{turma.ano_letivo}</span>
                    </div>
                    
                    {turma.turno && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Turno:</span>
                        <span className="font-medium capitalize">{turma.turno}</span>
                      </div>
                    )}
                    
                    {turma.nivel_ensino && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Nível:</span>
                        <span className="font-medium">{formatNivelEnsino(turma.nivel_ensino)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Alunos:
                      </span>
                      <span className="font-medium">
                        {matriculasCount?.[turma.id] || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTurmas?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <School className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || selectedEscola || selectedAno 
                  ? 'Nenhuma turma encontrada' 
                  : 'Nenhuma turma cadastrada'
                }
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedEscola || selectedAno
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece criando sua primeira turma para organizar os alunos.'
                }
              </p>
              {!searchTerm && !selectedEscola && !selectedAno && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Turma
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TurmasManagement;
