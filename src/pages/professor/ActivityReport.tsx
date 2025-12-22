import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, XCircle, AlertCircle, Clock, Calendar, Eye, TrendingUp, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useActivityReport, StatusGeral, StatusProgresso, RespostaPorAluno, AtividadeInfo } from '@/hooks/useActivityReport';
import { RedinAlunoDialog } from '@/components/relatorios/RedinAlunoDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para exportar relatório como CSV
const exportarRelatorioCsv = (
  atividade: AtividadeInfo,
  respostasPorAluno: RespostaPorAluno[]
) => {
  if (!atividade || !respostasPorAluno || respostasPorAluno.length === 0) return;

  const headers = [
    'numero_chamada',
    'nome_aluno',
    'status_progresso',
    'exercicios_respondidos',
    'total_exercicios_ativos',
    'melhor_resultado',
    'total_respostas',
  ];

  const statusProgressoTexto: Record<StatusProgresso, string> = {
    CONCLUIDO: 'Concluído',
    PARCIAL: 'Parcial',
    NAO_INICIOU: 'Não Iniciou',
  };

  const statusGeralTexto: Record<StatusGeral, string> = {
    CORRETO: '100% Correto',
    ACERTO_MARGEM: 'Acerto com Margem',
    MEIO_CERTO: 'Meio Certo',
    ERRO: 'Erro',
    NAO_RESPONDEU: 'Não Respondeu',
  };

  const linhas = respostasPorAluno.map(aluno => [
    aluno.numeroChamada ?? '',
    `"${(aluno.nomeAluno ?? '').replace(/"/g, '""')}"`,
    statusProgressoTexto[aluno.statusProgresso] ?? '',
    aluno.exerciciosRespondidos ?? 0,
    aluno.totalExerciciosAtivos ?? 0,
    statusGeralTexto[aluno.statusGeral] ?? '',
    aluno.respostas?.length ?? 0,
  ]);

  const csvConteudo = [
    headers.join(';'),
    ...linhas.map(l => l.join(';')),
  ].join('\n');

  const bom = '\uFEFF';
  const blob = new Blob([bom + csvConteudo], { type: 'text/csv;charset=utf-8;' });

  const slugTitulo = atividade.titulo
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase() || 'atividade';

  const hoje = new Date().toISOString().slice(0, 10);
  const fileName = `relatorio-atividade-${slugTitulo}-${hoje}.csv`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Componente para badge de status
const StatusBadge = ({ status }: { status: StatusGeral }) => {
  const config: Record<StatusGeral, { label: string; className: string }> = {
    CORRETO: { label: '100% Correto', className: 'bg-green-100 text-green-800 border-green-200' },
    ACERTO_MARGEM: { label: 'Acerto com Margem', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    MEIO_CERTO: { label: 'Meio Certo', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    ERRO: { label: 'Erro', className: 'bg-red-100 text-red-800 border-red-200' },
    NAO_RESPONDEU: { label: 'Não Respondeu', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  };

  const { label, className } = config[status];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

// Componente de badge de progresso
const ProgressoBadge = ({ 
  status, 
  respondidos, 
  total 
}: { 
  status: StatusProgresso; 
  respondidos: number; 
  total: number;
}) => {
  const config: Record<StatusProgresso, { label: string; className: string }> = {
    CONCLUIDO: { label: 'Concluído', className: 'bg-green-100 text-green-800 border-green-200' },
    PARCIAL: { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    NAO_INICIOU: { label: 'Não Iniciou', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  };

  const { label, className } = config[status];

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
      <span className="text-xs text-muted-foreground">{respondidos}/{total}</span>
    </div>
  );
};

// Componente de card de estatística
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  className = '' 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  className?: string;
}) => (
  <Card className={className}>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
    </CardContent>
  </Card>
);

const ActivityReport = () => {
  const { atividadeId } = useParams<{ atividadeId: string }>();
  const navigate = useNavigate();
  const [selectedAluno, setSelectedAluno] = useState<RespostaPorAluno | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<StatusProgresso | 'TODOS'>('TODOS');
  const { data, isLoading, error } = useActivityReport(atividadeId || '');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/professor/atividades')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar relatório</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados do relatório. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data?.atividade) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/professor/atividades')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atividade não encontrada</AlertTitle>
          <AlertDescription>
            A atividade solicitada não foi encontrada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { atividade, resumo, respostasPorAluno } = data;

  // Filtrar alunos por status de progresso
  const alunosFiltrados = respostasPorAluno.filter(a => {
    if (filtroStatus === 'TODOS') return true;
    return a.statusProgresso === filtroStatus;
  });

  // Cálculo de percentuais para gráfico de progresso
  const total = resumo.totalAlunosNaTurma || 1;
  const pctConcluiram = (resumo.alunosConcluiram / total) * 100;
  const pctEmAndamento = (resumo.alunosEmAndamento / total) * 100;
  const pctNaoIniciaram = (resumo.alunosNaoIniciaram / total) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/professor/atividades')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{atividade.titulo}</h1>
              <Badge variant={atividade.tipo === 'casa' ? 'default' : 'secondary'}>
                {atividade.tipo === 'casa' ? 'Para Casa' : 'Em Aula'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {atividade.turma && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {atividade.turma.nome} - {atividade.turma.ano_letivo}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Criada: {format(new Date(atividade.data_envio), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
              {atividade.data_limite && (
                <span className="flex items-center gap-1 text-destructive">
                  <Calendar className="h-4 w-4" />
                  Prazo: {format(new Date(atividade.data_limite), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportarRelatorioCsv(atividade, respostasPorAluno)}
            disabled={!respostasPorAluno || respostasPorAluno.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/professor/atividades/${atividadeId}/relatorio/print`, '_blank')}
          >
            <Printer className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Imprimir PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Alunos da Turma"
          value={resumo.totalAlunosNaTurma}
          icon={Users}
        />
        <StatCard
          title="Concluíram"
          value={resumo.alunosConcluiram}
          icon={CheckCircle}
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Em Andamento"
          value={resumo.alunosEmAndamento}
          icon={Clock}
          className="border-l-4 border-l-yellow-500"
        />
        <StatCard
          title="Não Iniciaram"
          value={resumo.alunosNaoIniciaram}
          icon={XCircle}
          className="border-l-4 border-l-gray-400"
        />
      </div>

      {/* Gráfico de Distribuição de Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
            {pctConcluiram > 0 && (
              <div 
                style={{ width: `${pctConcluiram}%` }} 
                className="bg-green-500 transition-all" 
                title={`Concluíram: ${resumo.alunosConcluiram}`} 
              />
            )}
            {pctEmAndamento > 0 && (
              <div 
                style={{ width: `${pctEmAndamento}%` }} 
                className="bg-yellow-500 transition-all" 
                title={`Em Andamento: ${resumo.alunosEmAndamento}`} 
              />
            )}
            {pctNaoIniciaram > 0 && (
              <div 
                style={{ width: `${pctNaoIniciaram}%` }} 
                className="bg-gray-400 transition-all" 
                title={`Não Iniciaram: ${resumo.alunosNaoIniciaram}`} 
              />
            )}
          </div>
          <div className="flex flex-wrap justify-between mt-3 text-xs gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-500 rounded-full" /> 
              Concluíram ({resumo.alunosConcluiram})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-yellow-500 rounded-full" /> 
              Em Andamento ({resumo.alunosEmAndamento})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-gray-400 rounded-full" /> 
              Não Iniciaram ({resumo.alunosNaoIniciaram})
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {resumo.totalExerciciosAtivos} exercício(s) ativo(s) nesta atividade
          </p>
        </CardContent>
      </Card>

      {/* Distribuição de Desempenho */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Desempenho (Melhor Tentativa)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{resumo.porCategoriaResultado.correto100}</div>
              <div className="text-sm text-green-600">100% Correto</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-700">{resumo.porCategoriaResultado.acertoMargem}</div>
              <div className="text-sm text-emerald-600">Acerto com Margem</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{resumo.porCategoriaResultado.meioCerto}</div>
              <div className="text-sm text-yellow-600">Meio Certo</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{resumo.porCategoriaResultado.erros}</div>
              <div className="text-sm text-red-600">Erros</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Alunos */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg">Desempenho por Aluno</CardTitle>
          
          {/* Filtros por Status */}
          <div className="flex flex-wrap gap-2">
            {(['TODOS', 'CONCLUIDO', 'PARCIAL', 'NAO_INICIOU'] as const).map(status => (
              <Button
                key={status}
                variant={filtroStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroStatus(status)}
                className="text-xs"
              >
                {status === 'TODOS' ? 'Todos' :
                 status === 'CONCLUIDO' ? 'Concluídos' :
                 status === 'PARCIAL' ? 'Em Andamento' : 'Não Iniciados'}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Nº</TableHead>
                  <TableHead>Nome do Aluno</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead className="hidden sm:table-cell">Melhor Resultado</TableHead>
                  <TableHead className="w-24 text-center hidden sm:table-cell">Respostas</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {respostasPorAluno.length === 0 
                        ? 'Nenhum aluno matriculado nesta turma.'
                        : 'Nenhum aluno encontrado com o filtro selecionado.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  alunosFiltrados.map(aluno => (
                    <TableRow 
                      key={aluno.alunoId}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {aluno.numeroChamada || '-'}
                      </TableCell>
                      <TableCell>{aluno.nomeAluno}</TableCell>
                      <TableCell>
                        <ProgressoBadge 
                          status={aluno.statusProgresso} 
                          respondidos={aluno.exerciciosRespondidos}
                          total={aluno.totalExerciciosAtivos}
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={aluno.statusGeral} />
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        {aluno.respostas.length}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Botão REDIN - sempre visível */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAluno(aluno)}
                            title="Ver detalhes (REDIN)"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Botão "Ver evolução" */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/professor/alunos/${aluno.alunoId}/evolucao?turma=${atividade.turma?.id || ''}`)
                            }
                            title="Ver evolução do aluno"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal REDIN */}
      {selectedAluno && atividadeId && (
        <RedinAlunoDialog
          open={!!selectedAluno}
          onOpenChange={(open) => !open && setSelectedAluno(null)}
          atividadeId={atividadeId}
          alunoId={selectedAluno.alunoId}
        />
      )}
    </div>
  );
};

export default ActivityReport;
