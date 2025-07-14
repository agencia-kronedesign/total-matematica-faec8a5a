import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus, UserPlus, Trash2, Users, School } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Matricula {
  id: string;
  usuario_id: string;
  turma_id: string;
  numero_chamada: number | null;
  status: string;
  created_at: string;
  usuarios: {
    nome: string;
    email: string;
    tipo_usuario: string;
  };
  turmas: {
    nome: string;
    ano_letivo: number;
    escola_id: string;
    escolas: {
      razao_social: string;
    };
  };
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo_usuario: string;
}

interface Turma {
  id: string;
  nome: string;
  ano_letivo: number;
  escola_id: string;
  escolas: {
    razao_social: string;
  };
}

const MatriculasManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [numeroChamada, setNumeroChamada] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar matrículas
  const { data: matriculas, isLoading: isLoadingMatriculas } = useQuery({
    queryKey: ['matriculas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matriculas')
        .select(`
          *,
          usuarios:usuario_id(nome, email, tipo_usuario),
          turmas:turma_id(
            nome, 
            ano_letivo, 
            escola_id,
            escolas:escola_id(razao_social)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Matricula[];
    }
  });

  // Buscar alunos não matriculados
  const { data: alunosDisponiveis } = useQuery({
    queryKey: ['alunos-disponiveis'],
    queryFn: async () => {
      // Buscar todos os alunos
      const { data: usuarios, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nome, email, tipo_usuario')
        .eq('tipo_usuario', 'aluno')
        .eq('ativo', true);

      if (usuariosError) throw usuariosError;

      // Buscar IDs dos usuários já matriculados
      const { data: matriculasAtivas, error: matriculasError } = await supabase
        .from('matriculas')
        .select('usuario_id')
        .eq('status', 'ativo');

      if (matriculasError) throw matriculasError;

      const idsMatriculados = matriculasAtivas.map(m => m.usuario_id);
      
      // Filtrar alunos não matriculados
      return usuarios.filter(usuario => !idsMatriculados.includes(usuario.id)) as Usuario[];
    }
  });

  // Buscar turmas
  const { data: turmas } = useQuery({
    queryKey: ['turmas-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          id, 
          nome, 
          ano_letivo, 
          escola_id,
          escolas:escola_id(razao_social)
        `)
        .eq('status', true)
        .order('nome');

      if (error) throw error;
      return data as Turma[];
    }
  });

  // Criar matrícula
  const createMatriculaMutation = useMutation({
    mutationFn: async (data: { usuario_id: string; turma_id: string; numero_chamada?: number }) => {
      const { error } = await supabase
        .from('matriculas')
        .insert([{
          ...data,
          status: 'ativo'
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['alunos-disponiveis'] });
      setIsCreateDialogOpen(false);
      setSelectedTurma('');
      setSelectedUsuario('');
      setNumeroChamada('');
      toast({
        title: "Matrícula realizada",
        description: "O aluno foi matriculado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao matricular",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Remover matrícula
  const removeMatriculaMutation = useMutation({
    mutationFn: async (matriculaId: string) => {
      const { error } = await supabase
        .from('matriculas')
        .update({ status: 'inativo' })
        .eq('id', matriculaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matriculas'] });
      queryClient.invalidateQueries({ queryKey: ['alunos-disponiveis'] });
      toast({
        title: "Matrícula removida",
        description: "A matrícula foi removida com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover matrícula",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario || !selectedTurma) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione o aluno e a turma.",
        variant: "destructive"
      });
      return;
    }

    createMatriculaMutation.mutate({
      usuario_id: selectedUsuario,
      turma_id: selectedTurma,
      numero_chamada: numeroChamada ? parseInt(numeroChamada) : undefined
    });
  };

  const matriculasAtivas = matriculas?.filter(m => m.status === 'ativo') || [];

  if (isLoadingMatriculas) {
    return <div className="p-6">Carregando matrículas...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Matrículas</h1>
          <p className="text-muted-foreground">
            Gerencie as matrículas dos alunos nas turmas
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!alunosDisponiveis?.length || !turmas?.length}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Matrícula
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Matricular Aluno</DialogTitle>
                <DialogDescription>
                  Selecione o aluno e a turma para realizar a matrícula
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="aluno" className="text-right">
                    Aluno *
                  </Label>
                  <Select value={selectedUsuario} onValueChange={setSelectedUsuario}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunosDisponiveis?.map((aluno) => (
                        <SelectItem key={aluno.id} value={aluno.id}>
                          {aluno.nome} ({aluno.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="turma" className="text-right">
                    Turma *
                  </Label>
                  <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas?.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome} - {turma.escolas.razao_social} ({turma.ano_letivo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="numero_chamada" className="text-right">
                    Nº Chamada
                  </Label>
                  <Input
                    id="numero_chamada"
                    type="number"
                    value={numeroChamada}
                    onChange={(e) => setNumeroChamada(e.target.value)}
                    className="col-span-3"
                    placeholder="Opcional"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={createMatriculaMutation.isPending}>
                  {createMatriculaMutation.isPending ? 'Matriculando...' : 'Matricular'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {turmas?.map((turma) => {
          const matriculasDaTurma = matriculasAtivas.filter(m => m.turma_id === turma.id);
          
          return (
            <Card key={turma.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{turma.nome}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        {turma.escolas.razao_social} - {turma.ano_letivo}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Users className="h-4 w-4 mr-1" />
                    {matriculasDaTurma.length} alunos
                  </Badge>
                </div>
              </CardHeader>
              
              {matriculasDaTurma.length > 0 && (
                <CardContent>
                  <div className="space-y-2">
                    {matriculasDaTurma.map((matricula) => (
                      <div key={matricula.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                            <span className="text-sm font-medium">
                              {matricula.numero_chamada || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{matricula.usuarios.nome}</p>
                            <p className="text-sm text-muted-foreground">{matricula.usuarios.email}</p>
                          </div>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover matrícula</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover a matrícula de {matricula.usuarios.nome}? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => removeMatriculaMutation.mutate(matricula.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
              
              {matriculasDaTurma.length === 0 && (
                <CardContent>
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum aluno matriculado nesta turma
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {!turmas?.length && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <School className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground text-center">
              Você precisa criar turmas antes de matricular alunos.
            </p>
          </CardContent>
        </Card>
      )}

      {!alunosDisponiveis?.length && turmas?.length && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Todos os alunos já estão matriculados</h3>
            <p className="text-muted-foreground text-center">
              Não há alunos disponíveis para matrícula no momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatriculasManagement;