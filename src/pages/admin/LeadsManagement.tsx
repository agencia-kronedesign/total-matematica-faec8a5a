import React, { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, RefreshCw, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const LeadsManagement: React.FC = () => {
  const { 
    leads, 
    loading, 
    error, 
    totalCount, 
    currentPage, 
    totalPages,
    refreshLeads,
    goToPage,
    exportToCSV,
    setFilters 
  } = useLeads();

  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handleFilter = () => {
    setFilters({ dataInicio: dataInicio || undefined, dataFim: dataFim || undefined });
  };

  const handleClearFilters = () => {
    setDataInicio('');
    setDataFim('');
    setFilters({});
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Leads</h1>
            <p className="text-sm text-muted-foreground">
              Visualize e gerencie os leads capturados pela landing page
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshLeads} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={exportToCSV} disabled={leads.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Data Início
              </label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Data Fim
              </label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFilter}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="ghost" onClick={handleClearFilters}>
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Erro ao carregar leads: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Leads Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Leads {totalCount > 0 && <span className="text-muted-foreground font-normal">({totalCount} registros)</span>}
          </CardTitle>
          <CardDescription>
            Lista de leads capturados ordenados por data (mais recentes primeiro)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lead encontrado</p>
              {(dataInicio || dataFim) && (
                <p className="text-sm mt-2">Tente ajustar os filtros de data</p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="hidden md:table-cell">Escola/Rede</TableHead>
                      <TableHead className="hidden sm:table-cell">Origem</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.nome}</TableCell>
                        <TableCell>
                          <a 
                            href={`mailto:${lead.email}`} 
                            className="text-primary hover:underline"
                          >
                            {lead.email}
                          </a>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {lead.escola_ou_rede || '-'}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs">
                            {lead.origem}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(lead.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages || loading}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadsManagement;
