import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Category } from './types';

export const useCategoryManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [subcategoriesCount, setSubcategoriesCount] = useState<number>(0);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('ordem', { ascending: true });
      
      if (error) throw error;
      return data as Category[];
    },
  });

  const checkSubcategories = async (categoryId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('subcategorias')
      .select('*', { count: 'exact', head: true })
      .eq('categoria_id', categoryId)
      .eq('ativo', true);
    
    if (error) throw error;
    return count || 0;
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const count = await checkSubcategories(id);
      
      if (count > 0) {
        throw new Error(`Não é possível desativar esta categoria pois ela possui ${count} subcategoria${count > 1 ? 's' : ''} ativa${count > 1 ? 's' : ''}. Remova todas as subcategorias primeiro.`);
      }

      const { error } = await supabase
        .from('categorias')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria desativada com sucesso');
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      console.error('Error deleting category:', error);
      toast.error(error.message);
      setIsDeleteDialogOpen(false);
    },
  });

  const handleDeleteClick = async (category: Category) => {
    try {
      const count = await checkSubcategories(category.id);
      setSubcategoriesCount(count);
      setSelectedCategory(category);
      setIsDeleteDialogOpen(true);
    } catch (error) {
      console.error('Error checking subcategories:', error);
      toast.error('Erro ao verificar subcategorias');
    }
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  return {
    categories,
    isLoading,
    selectedCategory,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleDeleteClick,
    handleEditClick,
    deleteMutation,
    queryClient,
    subcategoriesCount,
  };
};
