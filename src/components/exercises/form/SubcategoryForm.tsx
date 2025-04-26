
import React, { useState, useEffect } from 'react';
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

const subcategoryFormSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  categoria_id: z.string({ required_error: "Selecione uma categoria" }),
  descricao: z.string().optional(),
  ordem: z.coerce.number().int().min(1, { message: "Ordem deve ser um número inteiro positivo" }).optional(),
  nivel_dificuldade: z.coerce.number().int().min(1).max(5, { message: "Nível de dificuldade deve ser entre 1 e 5" }).optional(),
  cor: z.string().optional(),
  ativo: z.boolean().default(true)
});

const SubcategoryForm = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .eq('ativo', true);

      if (error) {
        toast.error('Erro ao carregar categorias');
      } else {
        setCategories(data || []);
      }
    };

    fetchCategories();
  }, []);

  const form = useForm<z.infer<typeof subcategoryFormSchema>>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: {
      ativo: true,
      ordem: 1,
      nivel_dificuldade: 1
    }
  });

  const onSubmit = async (data: z.infer<typeof subcategoryFormSchema>) => {
    try {
      const { data: newSubcategory, error } = await supabase
        .from('subcategorias')
        .insert(data)
        .select();

      if (error) throw error;

      toast.success('Subcategoria criada com sucesso!');
      form.reset();
    } catch (error) {
      toast.error('Erro ao criar subcategoria');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastrar Subcategoria</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Subcategoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Adição" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria Pai</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Input placeholder="Descrição da subcategoria" {...field} />
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

            <Button type="submit" className="w-full">Salvar Subcategoria</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SubcategoryForm;
