import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Lead {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  escola_ou_rede: string | null;
  origem: string;
  user_agent: string | null;
}

export interface UseLeadsFilters {
  dataInicio?: string;
  dataFim?: string;
}

const LEADS_PER_PAGE = 20;

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UseLeadsFilters>({});
  const { isAdmin } = useAuth();

  const fetchLeads = useCallback(async (page: number = 1) => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    console.log('[Admin/Leads] fetch-start', { page, filters });
    setLoading(true);
    setError(null);

    try {
      // Build query
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' });

      // Apply date filters
      if (filters.dataInicio) {
        query = query.gte('created_at', `${filters.dataInicio}T00:00:00.000Z`);
      }
      if (filters.dataFim) {
        query = query.lte('created_at', `${filters.dataFim}T23:59:59.999Z`);
      }

      // Order by created_at descending (most recent first)
      query = query.order('created_at', { ascending: false });

      // Apply pagination
      const from = (page - 1) * LEADS_PER_PAGE;
      const to = from + LEADS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setLeads(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
      console.log('[Admin/Leads] fetch-success', { count: count || 0, page });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar leads');
      console.error('[Admin/Leads] fetch-error', error);
      setError(error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters]);

  const refreshLeads = useCallback(() => {
    fetchLeads(currentPage);
  }, [fetchLeads, currentPage]);

  const applyFilters = useCallback((newFilters: UseLeadsFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    fetchLeads(page);
  }, [fetchLeads]);

  const exportToCSV = useCallback(() => {
    if (leads.length === 0) {
      console.log('[Admin/Leads] export-csv: no leads to export');
      return;
    }

    console.log('[Admin/Leads] export-csv-start', { count: leads.length });
    
    const headers = ['Nome', 'Email', 'Escola/Rede', 'Origem', 'Data de Criação'];
    const csvRows = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.nome.replace(/"/g, '""')}"`,
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${(lead.escola_ou_rede || '').replace(/"/g, '""')}"`,
        `"${lead.origem.replace(/"/g, '""')}"`,
        `"${new Date(lead.created_at).toLocaleDateString('pt-BR')}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('[Admin/Leads] export-csv-success');
  }, [leads]);

  useEffect(() => {
    fetchLeads(1);
  }, [isAdmin, filters]);

  const totalPages = Math.ceil(totalCount / LEADS_PER_PAGE);

  return {
    leads,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    filters,
    setFilters: applyFilters,
    refreshLeads,
    goToPage,
    exportToCSV,
  };
}
