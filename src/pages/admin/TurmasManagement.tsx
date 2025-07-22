import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Users, School, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  _count?: {
    matriculas: number;
  };
}

interface Escola {
  id: string;
  razao_social: string;
}

const TurmasManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showCustomLevel, setShowCustomLevel] = useState(false);
  const [customLevel, setCustomLevel] = useState('');
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
      
      // Contar matrículas por turma
      const counts: Record<string, number> = {};
      data.forEach(m => {
        counts[m.turma_id] = (counts[m.turma_id] || 0) + 1;
      });
      
      return counts;
    }
  });

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
      setFormData({
        nome: '',
        escola_id: '',
        ano_letivo: new Date().getFullYear(),
        turno: '',
        nivel_ensino: ''
      });
      setShowCustomLevel(false);
      setCustomLevel('');
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
    
    createTurmaMutation.mutate(formData);
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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Criar Nova Turma</DialogTitle>
                <DialogDescription>
                  Preencha os dados da nova turma
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome" className="text-right">
                    Nome *
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="col-span-3"
                    placeholder="Ex: 7º Ano A"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="escola" className="text-right">
                    Escola *
                  </Label>
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
                  <Label htmlFor="ano_letivo" className="text-right">
                    Ano Letivo
                  </Label>
                  <Input
                    id="ano_letivo"
                    type="number"
                    value={formData.ano_letivo}
                    onChange={(e) => setFormData(prev => ({ ...prev, ano_letivo: parseInt(e.target.value) }))}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="turno" className="text-right">
                    Turno
                  </Label>
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
                  <Label htmlFor="nivel_ensino" className="text-right">
                    Nível
                  </Label>
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
                <Button type="submit" disabled={createTurmaMutation.isPending}>
                  {createTurmaMutation.isPending ? 'Criando...' : 'Criar Turma'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {turmas?.map((turma) => (
          <Card key={turma.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{turma.nome}</CardTitle>
                <Badge variant={turma.status ? "default" : "secondary"}>
                  {turma.status ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  {turma.escola?.razao_social}
                </div>
              </CardDescription>
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

      {turmas?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <School className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando sua primeira turma para organizar os alunos.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Turma
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TurmasManagement;
