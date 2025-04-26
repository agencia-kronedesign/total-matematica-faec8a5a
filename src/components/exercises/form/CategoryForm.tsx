
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryFormSchema, type CategoryFormValues } from './schemas/categoryFormSchema';
import BasicCategoryFields from './components/BasicCategoryFields';
import DifficultyLevelField from './components/DifficultyLevelField';

const CategoryForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      ativo: true,
      ordem: 1,
      nivel_dificuldade: 1
    }
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      
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
        toast.error(`Erro ao criar categoria: ${error.message}`);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicCategoryFields form={form} />
            
            <div className="grid grid-cols-2 gap-4">
              <DifficultyLevelField form={form} />
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
