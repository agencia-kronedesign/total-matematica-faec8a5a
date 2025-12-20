import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, Award, Calendar, Users, TrendingUp } from 'lucide-react';
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
import { useAlunoEvolucao, StatusGeral, EvolucaoAtividade } from '@/hooks/useAlunoEvolucao';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para badge de status (consistente com ActivityReport)
const StatusBadge = ({ status }: { status: StatusGeral }) => {
  const config: Record<StatusGeral, { label: string; className: string }> = {
    CORRETO: { label: 'Correto', className: 'bg-green-100 text-green-800 border-green-200' },
    ACERTO_MARGEM: { label: 'Margem', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    MEIO_CERTO: { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    ERRO: { label: 'Incorreto', className: 'bg-red-100 text-red-800 border-red-200' },
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

// Card de atividade individual
const AtividadeCard = ({ atividade }: { atividade: EvolucaoAtividade }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm line-clamp-2">{atividade.titulo}</h4>
            <StatusBadge status={atividade.melhorStatus} />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {atividade.turmaNome} - {atividade.anoLetivo}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(atividade.dataCriacao), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
            {atividade.dataPrazo && (
              <span className="text-destructive">
                Prazo: {format(new Date(atividade.dataPrazo), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            )}
          </div>

          <div className="text-xs font-medium">
            <span className={atividade.totalRespondidos > 0 ? 'text-primary' : 'text-muted-foreground'}>
              {atividade.totalRespondidos}/{atividade.totalExercicios} exercícios respondidos
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AlunoEvolucao = () => {
  const { alunoId } = useParams<{ alunoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const turmaId = searchParams.get('turma') || undefined;

  const { aluno, atividades, resumo, isLoading, error } = useAlunoEvolucao(alunoId || '', turmaId);

  console.log('[AlunoEvolucao] Renderizando evolução para:', alunoId, 'turma:', turmaId);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar evolução</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados de evolução do aluno. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!aluno) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertTitle>Aluno não encontrado</AlertTitle>
          <AlertDescription>
            O aluno solicitado não foi encontrado no sistema.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">Evolução do Aluno</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-medium">{aluno.nome}</span>
              {aluno.turmaAtual && (
                <Badge variant="outline">
                  {aluno.turmaAtual.nome} - {aluno.turmaAtual.ano_letivo}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe o desempenho do aluno ao longo das atividades
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Atividades"
          value={resumo.totalAtividades}
          icon={FileText}
        />
        <StatCard
          title="Concluídas"
          value={resumo.concluidas}
          icon={CheckCircle}
          className="border-l-4 border-l-green-500"
        />
        <StatCard
          title="Não Respondidas"
          value={resumo.naoRespondidas}
          icon={XCircle}
          className="border-l-4 border-l-yellow-500"
        />
        <StatCard
          title="100% Corretas"
          value={resumo.corretas}
          icon={Award}
          className="border-l-4 border-l-emerald-500"
        />
      </div>

      {/* Distribuição de Desempenho */}
      {resumo.totalAtividades > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Desempenho (Melhor Tentativa)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{resumo.corretas}</div>
                <div className="text-sm text-green-600">Correto</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-700">{resumo.acertoMargem}</div>
                <div className="text-sm text-emerald-600">Com Margem</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{resumo.meioCertas}</div>
                <div className="text-sm text-yellow-600">Parcial</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">{resumo.erros}</div>
                <div className="text-sm text-red-600">Incorreto</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Atividades (Cards) */}
      {atividades.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>Nenhuma atividade encontrada</AlertTitle>
          <AlertDescription>
            Este aluno ainda não possui atividades com respostas registradas.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-4">Atividades ({atividades.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {atividades.map(atividade => (
                <AtividadeCard key={atividade.atividadeId} atividade={atividade} />
              ))}
            </div>
          </div>

          {/* Tabela Detalhada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tabela Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Atividade</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Exercícios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atividades.map(atividade => (
                      <TableRow 
                        key={atividade.atividadeId}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium max-w-[200px]">
                          <span className="line-clamp-1">{atividade.titulo}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {atividade.turmaNome}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(atividade.dataCriacao), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={atividade.melhorStatus} />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={atividade.totalRespondidos > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                            {atividade.totalRespondidos}/{atividade.totalExercicios}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AlunoEvolucao;
