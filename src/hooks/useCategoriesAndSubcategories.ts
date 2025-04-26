
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  nome: string;
  descricao: string | null;
}

interface Subcategory {
  id: string;
  nome: string;
  categoria_id: string;
  descricao: string | null;
}

export const useCategoriesAndSubcategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome, descricao')
        .order('nome');
      
      if (error) throw new Error(error.message);
      return data as Category[];
    },
  });

  const { data: subcategoriesData, isLoading: isSubcategoriesLoading } = useQuery({
    queryKey: ['subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategorias')
        .select('id, nome, categoria_id, descricao')
        .order('nome');
      
      if (error) throw new Error(error.message);
      return data as Subcategory[];
    },
  });

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (subcategoriesData) {
      setSubcategories(subcategoriesData);
    }
  }, [subcategoriesData]);

  const isLoading = isCategoriesLoading || isSubcategoriesLoading;

  return {
    categories,
    subcategories,
    isLoading,
  };
};
