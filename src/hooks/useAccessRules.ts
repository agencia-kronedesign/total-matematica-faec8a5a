import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AccessRule {
  id: string;
  role: string;
  resource_type: string;
  resource_id: string | null;
  action: string;
  conditions: Record<string, any>;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleHierarchy {
  parent_role: string;
  child_role: string;
}

export const useAccessRules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['access-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_rules')
        .select('*')
        .order('role', { ascending: true });
      if (error) throw error;
      return data as AccessRule[];
    },
  });

  const hierarchyQuery = useQuery({
    queryKey: ['role-hierarchy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_hierarchy')
        .select('*')
        .order('parent_role', { ascending: true });
      if (error) throw error;
      return data as RoleHierarchy[];
    },
  });

  const createRule = useMutation({
    mutationFn: async (rule: Omit<AccessRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('access_rules').insert(rule).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-rules'] });
      toast({ title: 'Regra criada com sucesso' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar regra', description: error.message, variant: 'destructive' });
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AccessRule> & { id: string }) => {
      const { data, error } = await supabase.from('access_rules').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-rules'] });
      toast({ title: 'Regra atualizada com sucesso' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar regra', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('access_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-rules'] });
      toast({ title: 'Regra excluída com sucesso' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir regra', description: error.message, variant: 'destructive' });
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('access_rules').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-rules'] });
    },
  });

  return {
    rules: rulesQuery.data || [],
    hierarchy: hierarchyQuery.data || [],
    isLoading: rulesQuery.isLoading || hierarchyQuery.isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
  };
};
