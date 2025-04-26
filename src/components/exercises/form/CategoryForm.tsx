
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

const categoryFormSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  descricao: z.string().optional(),
  ordem: z.coerce.number().int().min(1, { message: "Ordem deve ser um número inteiro positivo" }).optional(),
  nivel_dificuldade: z.coerce.number().int().min(1).max(5, { message: "Nível de dificuldade deve ser entre 1 e 5" }).optional(),
  cor: z.string().optional(),
  ativo: z.boolean().default(true)
});

const SubcategoryForm = () => {
  const [categories, setCategories] = useState<any[]>([]);

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
      const { data: newCategory, error } = await supabase
        .from('categorias')
        .insert(data)
        .select();

      if (error) throw error;

      toast.success('Categoria criada com sucesso!');
      form.reset();
    } catch (error) {
      toast.error('Erro ao criar categoria');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Categoria</CardTitle>
      </CardHeader>
      <CardContent>
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

            <Button type="submit" className="w-full">Salvar Categoria</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubcategoryForm;
