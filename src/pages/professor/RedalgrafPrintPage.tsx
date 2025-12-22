import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, FileText, Users, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRedalgraf } from '@/hooks/useRedalgraf';
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

// Mapeamento de período para label
const periodoLabels: Record<string, string> = {
  '30dias': 'Últimos 30 dias',
  'bimestre': 'Último bimestre',
  'ano': 'Ano todo',
};

const RedalgrafPrintPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hasPrinted, setHasPrinted] = useState(false);

  const alunoId = searchParams.get('alunoId');
  const turmaId = searchParams.get('turma') || undefined;
  const periodo = (searchParams.get('periodo') as '30dias' | 'bimestre' | 'ano') || 'ano';

  console.log('[REDALGRAF-PDF] Parâmetros recebidos', { alunoId, turmaId, periodo });

  const { aluno, atividades, resumo, isLoading, error } = useRedalgraf({
    alunoId: alunoId || '',
    turmaId,
    periodo,
  });

  // Disparar impressão após dados carregados
  useEffect(() => {
    if (!isLoading && !error && aluno && !hasPrinted) {
      console.log('[REDALGRAF-PDF] Dados carregados, chamando window.print()');
      const timer = setTimeout(() => {
        window.print();
        setHasPrinted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, aluno, hasPrinted]);

  // Preparar dados do gráfico
  const chartData = React.useMemo(() => {
    return atividades.map(a => ({
      nome: a.titulo.length > 12 ? `${a.titulo.substring(0, 12)}...` : a.titulo,
      data: format(new Date(a.dataEnvio), 'dd/MM', { locale: ptBR }),
      aluno: a.percentualAcertoAluno,
      turma: a.percentualAcertoTurma,
    }));
  }, [atividades]);

  // Validação de parâmetros
  if (!alunoId) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Parâmetros inválidos</AlertTitle>
          <AlertDescription>
            O ID do aluno é obrigatório para gerar o relatório.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4 no-print" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatório REDALGRAF para impressão...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('[REDALGRAF-PDF] Erro ao carregar dados', error);
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar relatório</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os dados do aluno. Tente novamente.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4 no-print" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const diferenca = resumo.mediaGeralAluno - resumo.mediaGeralTurma;

  return (
    <>
      {/* Estilos de impressão */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-6 bg-background min-h-screen">
        {/* Botão fechar (não imprime) */}
        <div className="no-print mb-4 flex justify-end">
          <Button variant="outline" onClick={() => window.close()}>
            Fechar
          </Button>
        </div>

        {/* Cabeçalho */}
        <div className="border-b-2 border-primary pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-primary">TOTAL MATEMÁTICA</h1>
              <h2 className="text-lg font-semibold mt-1">Relatório REDALGRAF - Evolução do Aluno</h2>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          </div>
        </div>

        {/* Dados do Aluno */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide">Dados do Aluno</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Aluno:</span>
              <p className="font-medium">{aluno?.nome || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Turma:</span>
              <p className="font-medium">
                {aluno?.turmaAtual 
                  ? `${aluno.turmaAtual.nome} - ${aluno.turmaAtual.ano_letivo}` 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Período:</span>
              <p className="font-medium">{periodoLabels[periodo] || 'Ano todo'}</p>
            </div>
          </div>
        </div>

        {/* Resumo (4 cards) */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="border rounded-lg p-3 text-center">
            <FileText className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{resumo.totalAtividades}</p>
            <p className="text-xs text-muted-foreground">Atividades</p>
          </div>
          <div className="border rounded-lg p-3 text-center border-l-4 border-l-primary">
            <Award className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">{resumo.mediaGeralAluno.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Média Aluno</p>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{resumo.mediaGeralTurma.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Média Turma</p>
          </div>
          <div className={`border rounded-lg p-3 text-center border-l-4 ${diferenca >= 0 ? 'border-l-green-500' : 'border-l-orange-500'}`}>
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className={`text-2xl font-bold ${diferenca >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              {diferenca >= 0 ? '+' : ''}{diferenca.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Diferença</p>
          </div>
        </div>

        {/* Gráfico de Evolução */}
        {atividades.length > 0 ? (
          <div className="border rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3">Gráfico de Evolução</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="data" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`]}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="aluno" 
                    name="Aluno" 
                    stroke="#0c2d57" 
                    strokeWidth={2}
                    dot={{ fill: '#0c2d57', r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="turma" 
                    name="Média da Turma" 
                    stroke="#6b7280" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={{ fill: '#6b7280', r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-6 mb-6 text-center">
            <p className="text-muted-foreground">
              Nenhuma atividade encontrada no período selecionado para este aluno.
            </p>
          </div>
        )}

        {/* Tabela de Atividades */}
        {atividades.length > 0 && (
          <div className="border rounded-lg overflow-hidden mb-6">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <h3 className="font-semibold text-sm">Atividades Detalhadas ({atividades.length})</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Data</th>
                  <th className="text-left px-3 py-2 font-medium">Atividade</th>
                  <th className="text-left px-3 py-2 font-medium">Turma</th>
                  <th className="text-center px-3 py-2 font-medium">Questões</th>
                  <th className="text-right px-3 py-2 font-medium">% Aluno</th>
                  <th className="text-right px-3 py-2 font-medium">% Turma</th>
                </tr>
              </thead>
              <tbody>
                {atividades.map((ativ, index) => (
                  <tr key={ativ.atividadeId} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="px-3 py-2 text-muted-foreground">
                      {format(new Date(ativ.dataEnvio), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-3 py-2 max-w-[200px]">
                      <span className="line-clamp-1">{ativ.titulo}</span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{ativ.turmaNome}</td>
                    <td className="px-3 py-2 text-center">
                      {ativ.questoesCorretas}/{ativ.totalQuestoes}
                    </td>
                    <td className={`px-3 py-2 text-right font-medium ${
                      ativ.percentualAcertoAluno >= ativ.percentualAcertoTurma 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {ativ.percentualAcertoAluno.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right text-muted-foreground">
                      {ativ.percentualAcertoTurma.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé */}
        <div className="border-t pt-4 text-center text-xs text-muted-foreground">
          <p>Relatório REDALGRAF gerado automaticamente pelo sistema Total Matemática</p>
          <p className="mt-1">Este documento é para uso interno e acompanhamento pedagógico.</p>
        </div>
      </div>
    </>
  );
};

export default RedalgrafPrintPage;
