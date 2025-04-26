
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const categoryFormSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  descricao: z.string().optional(),
  ordem: z.coerce.number().int().min(1, { message: "Ordem deve ser um número inteiro positivo" }).optional(),
  nivel_dificuldade: z.coerce.number().int().min(1).max(5, { message: "Nível de dificuldade deve ser entre 1 e 5" }).optional(),
  cor: z.string().optional(),
  ativo: z.boolean().default(true)
});

const CategoryForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState(false);

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      ativo: true,
      ordem: 1,
      nivel_dificuldade: 1
    }
  });

  const onSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    try {
      setIsSubmitting(true);
      setAuthError(false);
      
      // First, check the current auth session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setAuthError(true);
        toast.error('Erro de autenticação. Faça login novamente.');
        return;
      }
      
      if (!sessionData.session) {
        setAuthError(true);
        toast.error('Você precisa estar autenticado para criar categorias');
        return;
      }
      
      // Ensure 'nome' is treated as required by TypeScript
      if (!data.nome) {
        toast.error('Nome é obrigatório');
        return;
      }
      
      const { data: newCategory, error } = await supabase
        .from('categorias')
        .insert({
          nome: data.nome,
          descricao: data.descricao,
          ordem: data.ordem,
          nivel_dificuldade: data.nivel_dificuldade,
          cor: data.cor,
          ativo: data.ativo
        })
        .select();

      if (error) {
        console.error('Error inserting category:', error);
        if (error.code === '42501') {
          setAuthError(true);
          toast.error('Permissão negada. Você precisa estar autenticado.');
        } else {
          toast.error(`Erro ao criar categoria: ${error.message}`);
        }
        return;
      }

      toast.success('Categoria criada com sucesso!');
      form.reset();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro inesperado ao criar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {authError && (
          <Alert variant="destructive" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Erro de autenticação</AlertTitle>
            <AlertDescription>
              Você precisa estar autenticado para criar categorias. 
              Verifique se você está logado ou se tem as permissões necessárias.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Matemática Básica" {...field} />
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
                    <Input placeholder="Descrição da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ordem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nivel_dificuldade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nível de Dificuldade</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={(val) => form.setValue('nivel_dificuldade', Number(val))}
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nível" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(nivel => (
                            <SelectItem key={nivel} value={nivel.toString()}>
                              Nível {nivel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Categoria'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CategoryForm;
