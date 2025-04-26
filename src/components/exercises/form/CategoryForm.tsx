
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { categoryFormSchema, type CategoryFormValues } from './schemas/categoryFormSchema';
import BasicCategoryFields from './components/BasicCategoryFields';
import DifficultyLevelField from './components/DifficultyLevelField';

interface CategoryFormProps {
  editData?: {
    id: string;
    nome: string;
    descricao?: string;
    ordem?: number;
    nivel_dificuldade?: number;
    cor?: string;
    ativo?: boolean;
  };
  onSuccess?: () => void;
}

const CategoryForm = ({ editData, onSuccess }: CategoryFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      nome: editData?.nome || '',
      descricao: editData?.descricao || '',
      ordem: editData?.ordem || 1,
      nivel_dificuldade: editData?.nivel_dificuldade || 1,
      cor: editData?.cor || '#000000',
      ativo: editData?.ativo ?? true
    }
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { error } = editData 
        ? await supabase
            .from('categorias')
            .update({
              nome: data.nome,
              descricao: data.descricao,
              ordem: data.ordem,
              nivel_dificuldade: data.nivel_dificuldade,
              cor: data.cor,
              ativo: data.ativo
            })
            .eq('id', editData.id)
        : await supabase
            .from('categorias')
            .insert({
              nome: data.nome,
              descricao: data.descricao,
              ordem: data.ordem,
              nivel_dificuldade: data.nivel_dificuldade,
              cor: data.cor,
              ativo: data.ativo
            });

      if (error) {
        console.error('Error saving category:', error);
        toast.error(`Erro ao ${editData ? 'atualizar' : 'criar'} categoria: ${error.message}`);
        return;
      }

      toast.success(`Categoria ${editData ? 'atualizada' : 'criada'} com sucesso!`);
      if (!editData) {
        form.reset();
      }
      onSuccess?.();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro inesperado ao salvar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0">
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
              {isSubmitting ? 'Salvando...' : editData ? 'Atualizar Categoria' : 'Salvar Categoria'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CategoryForm;
