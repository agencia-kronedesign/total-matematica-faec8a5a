import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { EscolaFormData } from '@/schemas/escolaSchema';

export function useEscolas() {
  const [escolas, setEscolas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const fetchEscolas = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .order('razao_social');

      if (error) throw error;
      setEscolas(data || []);
    } catch (error) {
      console.error('Error fetching escolas:', error);
      setEscolas([]);
    } finally {
      setLoading(false);
    }
  };

  const createEscola = async (escolaData: EscolaFormData) => {
    if (!isAdmin) throw new Error('Unauthorized');

    // Map form data to database fields
    const dbData = {
      razao_social: escolaData.razao_social,
      nome_fantasia: escolaData.nome_fantasia,
      cnpj: escolaData.cnpj,
      inscricao_municipal: escolaData.inscricao_municipal,
      inscricao_estadual: escolaData.inscricao_estadual,
      isento_municipal: escolaData.isento_municipal,
      isento_estadual: escolaData.isento_estadual,
      cep: escolaData.cep,
      telefone: escolaData.telefone,
      email: escolaData.email,
      endereco: escolaData.endereco,
      cidade: escolaData.cidade,
      estado: escolaData.estado,
      observacoes: escolaData.observacoes,
      status: escolaData.status,
    };

    const { error } = await supabase
      .from('escolas')
      .insert([dbData as any]);

    if (error) throw error;
    await fetchEscolas();
  };

  const updateEscola = async (id: string, escolaData: EscolaFormData) => {
    if (!isAdmin) throw new Error('Unauthorized');

    // Map form data to database fields
    const dbData = {
      razao_social: escolaData.razao_social,
      nome_fantasia: escolaData.nome_fantasia,
      cnpj: escolaData.cnpj,
      inscricao_municipal: escolaData.inscricao_municipal,
      inscricao_estadual: escolaData.inscricao_estadual,
      isento_municipal: escolaData.isento_municipal,
      isento_estadual: escolaData.isento_estadual,
      cep: escolaData.cep,
      telefone: escolaData.telefone,
      email: escolaData.email,
      endereco: escolaData.endereco,
      cidade: escolaData.cidade,
      estado: escolaData.estado,
      observacoes: escolaData.observacoes,
      status: escolaData.status,
    };

    const { error } = await supabase
      .from('escolas')
      .update(dbData as any)
      .eq('id', id);

    if (error) throw error;
    await fetchEscolas();
  };

  const deleteEscola = async (id: string) => {
    if (!isAdmin) throw new Error('Unauthorized');

    const { error } = await supabase
      .from('escolas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchEscolas();
  };

  const refreshEscolas = () => {
    fetchEscolas();
  };

  useEffect(() => {
    fetchEscolas();
  }, [isAdmin]);

  return {
    escolas,
    loading,
    createEscola,
    updateEscola,
    deleteEscola,
    refreshEscolas,
  };
}