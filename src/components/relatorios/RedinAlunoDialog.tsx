import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, User, BookOpen, Calendar, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useRedinReport, StatusAluno, StatusGeralAtividade, ComparativoTurma } from '@/hooks/useRedinReport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RedinAlunoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividadeId: string;
  alunoId: string;
}

// Badge de status do aluno por questão
const StatusAlunoBadge = ({ status }: { status: StatusAluno }) => {
  const config: Record<StatusAluno, { label: string; className: string }> = {
    CORRETO: { label: 'Correto', className: 'bg-green-100 text-green-800 border-green-200' },
    CORRETO_MARGEM: { label: 'Correto (margem)', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    MEIO_CERTO: { label: 'Meio certo', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    INCORRETO: { label: 'Incorreto', className: 'bg-red-100 text-red-800 border-red-200' },
    NAO_RESPONDEU: { label: 'Não respondeu', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  };

  const { label, className } = config[status];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

// Badge de status geral da atividade
const StatusGeralBadge = ({ status }: { status: StatusGeralAtividade }) => {
  const config: Record<StatusGeralAtividade, { label: string; className: string }> = {
    CONCLUIDA: { label: 'Concluída', className: 'bg-green-500 text-white' },
    EM_ANDAMENTO: { label: 'Em andamento', className: 'bg-yellow-500 text-white' },
    NAO_RESPONDEU: { label: 'Não respondeu', className: 'bg-gray-400 text-white' },
  };

  const { label, className } = config[status];

  return (
    <Badge className={className}>
      {label}
    </Badge>
  );
};

// Badge de comparativo com a turma
const ComparativoBadge = ({ comparativo }: { comparativo: ComparativoTurma }) => {
  const config: Record<ComparativoTurma, { label: string; className: string; icon: React.ElementType }> = {
    ACIMA: { label: 'Acima da média', className: 'bg-green-500 text-white', icon: TrendingUp },
    NA_MEDIA: { label: 'Na média', className: 'bg-blue-500 text-white', icon: Minus },
    ABAIXO: { label: 'Abaixo da média', className: 'bg-orange-500 text-white', icon: TrendingDown },
  };

  const { label, className, icon: Icon } = config[comparativo];

  return (
    <Badge className={`${className} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

// Card de estatística
const StatCard = ({
  title,
  value,
  className = '',
}: {
  title: string;
  value: number | string;
  className?: string;
}) => (
  <div className={`text-center p-3 rounded-lg border ${className}`}>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-muted-foreground">{title}</div>
  </div>
);

export function RedinAlunoDialog({
  open,
  onOpenChange,
  atividadeId,
  alunoId,
}: RedinAlunoDialogProps) {
  const { data, isLoading, error, refetch } = useRedinReport({
    atividadeId,
    alunoId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Desempenho do Aluno na Atividade (REDIN)
          </DialogTitle>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            <Skeleton className="h-8 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar REDIN</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <span>{error instanceof Error ? error.message : 'Erro desconhecido'}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="w-fit"
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Success State */}
        {!isLoading && !error && data && (
          <div className="space-y-4">
            {/* Cabeçalho */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{data.cabecalho.alunoNome}</span>
                      {data.cabecalho.numeroChamada != null && (
                        <Badge variant="outline">Nº {data.cabecalho.numeroChamada}</Badge>
                      )}
                      <StatusGeralBadge status={data.cabecalho.statusGeralAluno} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {data.cabecalho.turmaNome} - {data.cabecalho.anoLetivo}
                      </span>
                      <span>|</span>
                      <span>
                        {data.cabecalho.tipoAtividade === 'casa' ? 'Para Casa' : 'Em Aula'} – {data.cabecalho.atividadeTitulo}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Criada: {format(new Date(data.cabecalho.dataEnvio), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                      {data.cabecalho.dataLimite && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Prazo: {format(new Date(data.cabecalho.dataLimite), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resumo da Atividade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    title="Questões"
                    value={data.resumo.totalQuestoes}
                    className="bg-muted/50"
                  />
                  <StatCard
                    title="Corretas"
                    value={data.resumo.corretas}
                    className="bg-green-50 border-green-200 text-green-700"
                  />
                  <StatCard
                    title="Meio certas"
                    value={data.resumo.meioCertas}
                    className="bg-yellow-50 border-yellow-200 text-yellow-700"
                  />
                  <StatCard
                    title="Incorretas / Não resp."
                    value={data.resumo.incorretas + data.resumo.naoRespondeu}
                    className="bg-red-50 border-red-200 text-red-700"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Seu acerto: </span>
                    <span className="font-semibold">{data.resumo.percentualAcertoAluno.toFixed(1)}%</span>
                  </div>
                  <span className="text-muted-foreground">|</span>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Média da turma: </span>
                    <span className="font-semibold">{data.resumo.percentualAcertoTurma.toFixed(1)}%</span>
                  </div>
                  <ComparativoBadge comparativo={data.resumo.comparativoTurma} />
                </div>
              </CardContent>
            </Card>

            {/* Tabela por questão */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Desempenho por Questão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Seu Status</TableHead>
                        <TableHead className="text-center w-20">Tentativas</TableHead>
                        <TableHead className="text-right w-24">% Turma</TableHead>
                        <TableHead className="text-right w-24">% Não Resp.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.questoes.map((q) => (
                        <TableRow key={q.exercicioId} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{q.ordem}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <StatusAlunoBadge status={q.statusAluno} />
                              {q.respostaDigitada && (
                                <div className="text-xs text-muted-foreground">
                                  Resposta: <span className="font-mono">{q.respostaDigitada}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{q.tentativasAluno}</TableCell>
                          <TableCell className="text-right">{q.percentualAcertoTurma.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">{q.percentualNaoRespondeuTurma.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                      {data.questoes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhuma questão encontrada para esta atividade.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
