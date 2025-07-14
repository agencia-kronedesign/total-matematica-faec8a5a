import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateAtividade, useUpdateAtividade, useTurmas, type AtividadeFormData } from '@/hooks/useAtividades';
import { useExercises } from '@/hooks/useExercises';
import { Calendar, Book, Users } from 'lucide-react';
import { format } from 'date-fns';

const atividadeSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['casa', 'aula'], { required_error: 'Tipo é obrigatório' }),
  turma_id: z.string().min(1, 'Turma é obrigatória'),
  data_limite: z.string().optional(),
  exercicios_ids: z.array(z.string()).min(1, 'Selecione pelo menos um exercício')
});

type FormData = z.infer<typeof atividadeSchema>;

interface AtividadeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividade?: any;
}

const AtividadeFormDialog: React.FC<AtividadeFormDialogProps> = ({ 
  open, 
  onOpenChange, 
  atividade 
}) => {
  const isEditing = !!atividade;
  const createAtividade = useCreateAtividade();
  const updateAtividade = useUpdateAtividade();
  const { data: turmas } = useTurmas();
  const { data: exercicios } = useExercises();

  const form = useForm<FormData>({
    resolver: zodResolver(atividadeSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      tipo: 'casa',
      turma_id: '',
      data_limite: '',
      exercicios_ids: []
    }
  });

  // Resetar o formulário quando o dialog abrir/fechar ou quando atividade mudar
  useEffect(() => {
    if (open) {
      if (atividade) {
        form.reset({
          titulo: atividade.titulo,
          descricao: atividade.descricao || '',
          tipo: atividade.tipo,
          turma_id: atividade.turma_id,
          data_limite: atividade.data_limite ? format(new Date(atividade.data_limite), 'yyyy-MM-dd') : '',
          exercicios_ids: atividade.exercicios?.map((e: any) => e.exercicio.id) || []
        });
      } else {
        form.reset({
          titulo: '',
          descricao: '',
          tipo: 'casa',
          turma_id: '',
          data_limite: '',
          exercicios_ids: []
        });
      }
    }
  }, [open, atividade, form]);

  const onSubmit = async (data: FormData) => {
    try {
      const formData: AtividadeFormData = {
        titulo: data.titulo,
        descricao: data.descricao,
        tipo: data.tipo,
        turma_id: data.turma_id,
        data_limite: data.data_limite || undefined,
        exercicios_ids: data.exercicios_ids
      };

      if (isEditing) {
        await updateAtividade.mutateAsync({ id: atividade.id, data: formData });
      } else {
        await createAtividade.mutateAsync(formData);
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    }
  };

  const exerciciosSelecionados = form.watch('exercicios_ids');

  const handleExercicioToggle = (exercicioId: string) => {
    const current = form.getValues('exercicios_ids');
    const updated = current.includes(exercicioId)
      ? current.filter(id => id !== exercicioId)
      : [...current, exercicioId];
    
    form.setValue('exercicios_ids', updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Atividade</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Exercícios de Matemática Básica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva os objetivos e instruções da atividade..."
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="casa">Para Casa</SelectItem>
                              <SelectItem value="aula">Em Aula</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="turma_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Turma</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a turma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {turmas?.map(turma => (
                                <SelectItem key={turma.id} value={turma.id}>
                                  {turma.nome} - {turma.ano_letivo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="data_limite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Data Limite (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Seleção de Exercícios */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Exercícios ({exerciciosSelecionados.length} selecionados)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="exercicios_ids"
                    render={() => (
                      <FormItem>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {exercicios?.map(exercicio => (
                            <div 
                              key={exercicio.id} 
                              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50"
                            >
                              <Checkbox
                                checked={exerciciosSelecionados.includes(exercicio.id)}
                                onCheckedChange={() => handleExercicioToggle(exercicio.id)}
                                className="mt-1"
                              />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">#{exercicio.ordem}</span>
                                  {exercicio.subcategoria && (
                                    <Badge variant="outline" className="text-xs">
                                      {exercicio.subcategoria.categoria?.nome} - {exercicio.subcategoria.nome}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground font-mono">
                                  {exercicio.formula}
                                </div>
                                {exercicio.imagem_url && (
                                  <div className="text-xs text-muted-foreground">
                                    📷 Contém imagem
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createAtividade.isPending || updateAtividade.isPending}
              >
                {createAtividade.isPending || updateAtividade.isPending 
                  ? 'Salvando...' 
                  : isEditing ? 'Atualizar' : 'Criar Atividade'
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AtividadeFormDialog;