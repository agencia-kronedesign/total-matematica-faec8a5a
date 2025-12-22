import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, Award, Calendar, Users, TrendingUp, Eye, BarChart3, FileDown } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRedalgraf, RedalgrafAtividade } from '@/hooks/useRedalgraf';
import { RedinAlunoDialog } from '@/components/relatorios/RedinAlunoDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';

// Componente de card de estatística
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  className = '' 
}: { 
  title: string; 
  value: number | string; 
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

// Custom tooltip para o gráfico
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AlunoEvolucao = () => {
  const { alunoId } = useParams<{ alunoId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const turmaId = searchParams.get('turma') || undefined;

  // Estados
  const [periodo, setPeriodo] = useState<'30dias' | 'bimestre' | 'ano'>('ano');
  const [selectedAtividade, setSelectedAtividade] = useState<{ atividadeId: string } | null>(null);

  const { aluno, atividades, resumo, isLoading, error } = useRedalgraf({
    alunoId: alunoId || '',
    turmaId,
    periodo,
  });

  console.log('[REDALGRAF] Renderizando evolução para:', alunoId, 'turma:', turmaId, 'período:', periodo);

  // Preparar dados do gráfico
  const chartData = React.useMemo(() => {
    console.log('[REDALGRAF] Preparando dados do gráfico', { atividades: atividades.length });
    return atividades.map(a => ({
      nome: a.titulo.length > 15 ? `${a.titulo.substring(0, 15)}...` : a.titulo,
      data: format(new Date(a.dataEnvio), 'dd/MM', { locale: ptBR }),
      aluno: a.percentualAcertoAluno,
      turma: a.percentualAcertoTurma,
      atividadeId: a.atividadeId,
      tituloCompleto: a.titulo,
    }));
  }, [atividades]);

  // Handler para clique no gráfico
  const handleChartClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload?.atividadeId) {
      const atividadeId = data.activePayload[0].payload.atividadeId;
      console.log('[REDALGRAF] Clique no gráfico, abrindo REDIN:', atividadeId);
      setSelectedAtividade({ atividadeId });
    }
  };

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
        <Skeleton className="h-72 w-full" />
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
              <BarChart3 className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">Evolução do Aluno (REDALGRAF)</h1>
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
              Acompanhe a evolução do desempenho ao longo das atividades
            </p>
          </div>
        </div>

        {/* Filtro de Período e Exportar PDF */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Período:</span>
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as typeof periodo)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="bimestre">Último bimestre</SelectItem>
              <SelectItem value="ano">Ano todo</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              console.log('[REDALGRAF-PDF] Abrindo página de impressão');
              const url = `/professor/relatorios/redalgraf/print?alunoId=${alunoId}&turma=${turmaId || ''}&periodo=${periodo}`;
              window.open(url, '_blank');
            }}
            title="Exportar PDF"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
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
          title="Média Geral do Aluno"
          value={`${resumo.mediaGeralAluno.toFixed(1)}%`}
          icon={Award}
          className="border-l-4 border-l-primary"
        />
        <StatCard
          title="Média Geral da Turma"
          value={`${resumo.mediaGeralTurma.toFixed(1)}%`}
          icon={Users}
          className="border-l-4 border-l-muted"
        />
        <StatCard
          title="Diferença"
          value={`${(resumo.mediaGeralAluno - resumo.mediaGeralTurma) >= 0 ? '+' : ''}${(resumo.mediaGeralAluno - resumo.mediaGeralTurma).toFixed(1)}%`}
          icon={TrendingUp}
          className={`border-l-4 ${resumo.mediaGeralAluno >= resumo.mediaGeralTurma ? 'border-l-green-500' : 'border-l-orange-500'}`}
        />
      </div>

      {/* Gráfico de Evolução */}
      {atividades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução do Desempenho
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Clique em um ponto do gráfico para ver detalhes da atividade (REDIN)
            </p>
          </CardHeader>
          <CardContent>
            <div className="w-full h-72 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                  onClick={handleChartClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="data" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="aluno" 
                    name="Aluno" 
                    stroke="hsl(217, 91%, 22%)" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(217, 91%, 22%)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, stroke: 'hsl(217, 91%, 22%)', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="turma" 
                    name="Média da Turma" 
                    stroke="hsl(220, 9%, 46%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(220, 9%, 46%)', strokeWidth: 1, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Atividades */}
      {atividades.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>Nenhuma atividade encontrada</AlertTitle>
          <AlertDescription>
            Não há atividades no período selecionado para este aluno.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atividades ({atividades.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-center">Questões</TableHead>
                    <TableHead className="text-right">% Aluno</TableHead>
                    <TableHead className="text-right">% Turma</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atividades.map(atividade => (
                    <TableRow 
                      key={atividade.atividadeId}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedAtividade({ atividadeId: atividade.atividadeId })}
                    >
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {atividade.tipoAtividade === 'casa' ? 'Casa' : 'Aula'}
                          </Badge>
                          <span className="line-clamp-1">{atividade.titulo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {atividade.turmaNome}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(atividade.dataEnvio), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={atividade.questoesRespondidas > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                          {atividade.questoesCorretas}/{atividade.totalQuestoes}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          atividade.percentualAcertoAluno >= atividade.percentualAcertoTurma 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          {atividade.percentualAcertoAluno.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {atividade.percentualAcertoTurma.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAtividade({ atividadeId: atividade.atividadeId });
                          }}
                          title="Ver detalhes (REDIN)"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal REDIN */}
      {selectedAtividade && alunoId && (
        <RedinAlunoDialog
          open={!!selectedAtividade}
          onOpenChange={(open) => !open && setSelectedAtividade(null)}
          atividadeId={selectedAtividade.atividadeId}
          alunoId={alunoId}
        />
      )}
    </div>
  );
};

export default AlunoEvolucao;