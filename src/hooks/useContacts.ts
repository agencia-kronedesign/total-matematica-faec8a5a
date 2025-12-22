import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Contact {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  mensagem: string;
  origem: string;
  ip: string | null;
  user_agent: string | null;
}

export interface UseContactsFilters {
  dataInicio?: string;
  dataFim?: string;
}

const CONTACTS_PER_PAGE = 20;

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UseContactsFilters>({});
  const { isAdmin } = useAuth();

  const fetchContacts = useCallback(async (page: number = 1) => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    console.log('[Admin/Contacts] fetch-start', { page, filters });
    setLoading(true);
    setError(null);

    try {
      // Build query
      let query = supabase
        .from('contacts')
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
      const from = (page - 1) * CONTACTS_PER_PAGE;
      const to = from + CONTACTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setContacts(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
      console.log('[Admin/Contacts] fetch-success', { count: count || 0, page });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao carregar contatos');
      console.error('[Admin/Contacts] fetch-error', error);
      setError(error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filters]);

  const refreshContacts = useCallback(() => {
    fetchContacts(currentPage);
  }, [fetchContacts, currentPage]);

  const applyFilters = useCallback((newFilters: UseContactsFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    fetchContacts(page);
  }, [fetchContacts]);

  const exportToCSV = useCallback(() => {
    if (contacts.length === 0) {
      console.log('[Admin/Contacts] export-csv: no contacts to export');
      return;
    }

    console.log('[Admin/Contacts] export-csv-start', { count: contacts.length });
    
    const headers = ['Nome', 'Email', 'Mensagem', 'Origem', 'Data de Criação'];
    const csvRows = [
      headers.join(','),
      ...contacts.map(contact => [
        `"${contact.nome.replace(/"/g, '""')}"`,
        `"${contact.email.replace(/"/g, '""')}"`,
        `"${contact.mensagem.replace(/"/g, '""')}"`,
        `"${contact.origem.replace(/"/g, '""')}"`,
        `"${new Date(contact.created_at).toLocaleDateString('pt-BR')}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contatos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('[Admin/Contacts] export-csv-success');
  }, [contacts]);

  useEffect(() => {
    fetchContacts(1);
  }, [isAdmin, filters]);

  const totalPages = Math.ceil(totalCount / CONTACTS_PER_PAGE);

  return {
    contacts,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    filters,
    setFilters: applyFilters,
    refreshContacts,
    goToPage,
    exportToCSV,
  };
}
