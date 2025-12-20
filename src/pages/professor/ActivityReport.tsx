import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, XCircle, AlertCircle, FileText, Calendar, Eye, TrendingUp } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useActivityReport, StatusGeral, RespostaPorAluno } from '@/hooks/useActivityReport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

// Modal de detalhes do aluno
const AlunoDetailModal = ({ 
  aluno, 
  open, 
  onClose 
}: { 
  aluno: RespostaPorAluno | null; 
  open: boolean; 
  onClose: () => void;
}) => {
  if (!aluno) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Respostas de {aluno.nomeAluno}</span>
            {aluno.numeroChamada && (
              <Badge variant="outline">Nº {aluno.numeroChamada}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status Geral:</span>
            <StatusBadge status={aluno.statusGeral} />
          </div>

          {aluno.respostas.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Nenhuma resposta</AlertTitle>
              <AlertDescription>
                Este aluno ainda não respondeu nenhum exercício desta atividade.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Respostas ({aluno.respostas.length})</h4>
              {aluno.respostas.map((resp, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Fórmula: </span>
                        <code className="bg-muted px-1 rounded">{resp.formula || 'N/A'}</code>
                      </div>
                      <StatusBadge status={
                        resp.acertoNivel === 'correto' ? 'CORRETO' :
                        resp.acertoNivel === 'correto_com_margem' ? 'ACERTO_MARGEM' :
                        resp.acertoNivel === 'meio_certo' ? 'MEIO_CERTO' :
                        resp.acertoNivel === 'incorreto' ? 'ERRO' : 'NAO_RESPONDEU'
                      } />
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Resposta digitada: </span>
                      <span className="font-medium">{resp.respostaDigitada || 'N/A'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Enviado em: {format(new Date(resp.dataResposta), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ActivityReport = () => {
  const { atividadeId } = useParams<{ atividadeId: string }>();
  const navigate = useNavigate();
  const [selectedAluno, setSelectedAluno] = useState<RespostaPorAluno | null>(null);

  const { data, isLoading, error } = useActivityReport(atividadeId || '');

  console.log('[ActivityReport] Renderizando relatório para:', atividadeId);

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
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Alunos da Turma"
          value={resumo.totalAlunosNaTurma}
          icon={Users}
        />
        <StatCard
          title="Responderam"
          value={resumo.totalAlunosQueResponderam}
          icon={CheckCircle}
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Não Responderam"
          value={resumo.totalAlunosNaTurma - resumo.totalAlunosQueResponderam}
          icon={XCircle}
          className="border-l-4 border-l-yellow-500"
        />
        <StatCard
          title="Total de Respostas"
          value={resumo.totalRespostas}
          icon={FileText}
        />
      </div>

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
        <CardHeader>
          <CardTitle className="text-lg">Desempenho por Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Nº</TableHead>
                  <TableHead>Nome do Aluno</TableHead>
                  <TableHead>Status Geral</TableHead>
                  <TableHead className="w-24 text-center">Respostas</TableHead>
                  <TableHead className="w-24 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {respostasPorAluno.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum aluno matriculado nesta turma.
                    </TableCell>
                  </TableRow>
                ) : (
                  respostasPorAluno.map(aluno => (
                    <TableRow 
                      key={aluno.alunoId}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {aluno.numeroChamada || '-'}
                      </TableCell>
                      <TableCell>{aluno.nomeAluno}</TableCell>
                      <TableCell>
                        <StatusBadge status={aluno.statusGeral} />
                      </TableCell>
                      <TableCell className="text-center">
                        {aluno.respostas.length}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Botão existente de ver detalhes (mantém como está hoje) */}
                          {aluno.respostas.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedAluno(aluno)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* NOVO: Botão "Ver evolução" */}
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

      {/* Modal de Detalhes */}
      <AlunoDetailModal
        aluno={selectedAluno}
        open={!!selectedAluno}
        onClose={() => setSelectedAluno(null)}
      />
    </div>
  );
};

export default ActivityReport;
