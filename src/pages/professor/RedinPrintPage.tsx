import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRedinReport, StatusAluno, StatusGeralAtividade, ComparativoTurma } from '@/hooks/useRedinReport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Converter status para valor percentual para o gráfico
const statusToPercentage = (status: StatusAluno): number => {
  switch (status) {
    case 'CORRETO':
    case 'CORRETO_MARGEM':
      return 100;
    case 'MEIO_CERTO':
      return 50;
    case 'INCORRETO':
    case 'NAO_RESPONDEU':
    default:
      return 0;
  }
};

// Labels de status
const statusLabels: Record<StatusAluno, string> = {
  CORRETO: 'Correto',
  CORRETO_MARGEM: 'Correto (margem)',
  MEIO_CERTO: 'Meio certo',
  INCORRETO: 'Incorreto',
  NAO_RESPONDEU: 'Não respondeu',
};

const statusGeralLabels: Record<StatusGeralAtividade, string> = {
  CONCLUIDA: 'Concluída',
  EM_ANDAMENTO: 'Em andamento',
  NAO_RESPONDEU: 'Não respondeu',
};

const comparativoLabels: Record<ComparativoTurma, string> = {
  ACIMA: 'Acima da média',
  NA_MEDIA: 'Na média',
  ABAIXO: 'Abaixo da média',
};

const RedinPrintPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const atividadeId = searchParams.get('atividadeId') || '';
  const alunoId = searchParams.get('alunoId') || '';

  const { data, isLoading, error } = useRedinReport({
    atividadeId,
    alunoId,
  });

  // Preparar dados do gráfico
  const chartData = React.useMemo(() => {
    if (!data?.questoes) return [];
    return data.questoes.map(q => ({
      questao: `Q${q.ordem}`,
      aluno: statusToPercentage(q.statusAluno),
      turma: Math.round(q.percentualAcertoTurma),
    }));
  }, [data?.questoes]);

  // Auto-print após carregar
  useEffect(() => {
    if (data && !isLoading && !error) {
      console.log('[REDIN-PDF] Dados carregados, preparando impressão');
      // Pequeno delay para garantir renderização
      const timer = setTimeout(() => {
        console.log('[REDIN-PDF] Executando window.print()');
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data, isLoading, error]);

  // Validar parâmetros
  if (!atividadeId || !alunoId) {
    console.error('[REDIN-PDF] Parâmetros inválidos', { atividadeId, alunoId });
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-destructive mb-2">Parâmetros inválidos</h1>
          <p className="text-muted-foreground mb-4">
            Os parâmetros atividadeId e alunoId são obrigatórios.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="text-primary underline hover:no-underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-destructive mb-2">Erro ao carregar</h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="text-primary underline hover:no-underline"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      {/* CSS de impressão */}
      <style>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
        @page {
          size: A4;
          margin: 15mm;
        }
      `}</style>

      <div className="min-h-screen bg-white p-8 max-w-[210mm] mx-auto">
        {/* Cabeçalho do relatório */}
        <header className="border-b-2 border-primary pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-primary">TOTAL MATEMÁTICA</h1>
              <p className="text-sm text-muted-foreground">Relatório REDIN - Desempenho Individual</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
          </div>
        </header>

        {/* Dados do aluno e atividade */}
        <section className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Aluno:</strong> {data.cabecalho.alunoNome}</p>
              {data.cabecalho.numeroChamada && (
                <p><strong>Nº Chamada:</strong> {data.cabecalho.numeroChamada}</p>
              )}
              <p><strong>Turma:</strong> {data.cabecalho.turmaNome} - {data.cabecalho.anoLetivo}</p>
            </div>
            <div>
              <p><strong>Atividade:</strong> {data.cabecalho.atividadeTitulo}</p>
              <p><strong>Tipo:</strong> {data.cabecalho.tipoAtividade === 'casa' ? 'Para Casa' : 'Em Aula'}</p>
              <p><strong>Data:</strong> {format(new Date(data.cabecalho.dataEnvio), 'dd/MM/yyyy', { locale: ptBR })}</p>
              {data.cabecalho.dataLimite && (
                <p><strong>Prazo:</strong> {format(new Date(data.cabecalho.dataLimite), 'dd/MM/yyyy', { locale: ptBR })}</p>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm">
            <span><strong>Status:</strong> {statusGeralLabels[data.cabecalho.statusGeralAluno]}</span>
          </div>
        </section>

        {/* Resumo */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Resumo</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center p-3 bg-gray-100 rounded border">
              <div className="text-2xl font-bold">{data.resumo.totalQuestoes}</div>
              <div className="text-xs text-muted-foreground">Questões</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded border border-green-200">
              <div className="text-2xl font-bold text-green-700">{data.resumo.corretas}</div>
              <div className="text-xs text-green-600">Corretas</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{data.resumo.meioCertas}</div>
              <div className="text-xs text-yellow-600">Meio certas</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded border border-red-200">
              <div className="text-2xl font-bold text-red-700">{data.resumo.incorretas + data.resumo.naoRespondeu}</div>
              <div className="text-xs text-red-600">Incorretas / Não resp.</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm p-3 bg-gray-50 rounded border">
            <span><strong>Acerto do aluno:</strong> {data.resumo.percentualAcertoAluno.toFixed(1)}%</span>
            <span>|</span>
            <span><strong>Média da turma:</strong> {data.resumo.percentualAcertoTurma.toFixed(1)}%</span>
            <span>|</span>
            <span className="font-medium">{comparativoLabels[data.resumo.comparativoTurma]}</span>
          </div>
        </section>

        {/* Gráfico */}
        {chartData.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Gráfico de Desempenho por Questão</h2>
            <div className="w-full h-48 border rounded p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="questao" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="aluno" name="Aluno" fill="#0A2463" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="turma" name="Turma" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Tabela detalhada */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Detalhamento por Questão</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left w-12">#</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-center w-20">Tentativas</th>
                <th className="border p-2 text-right w-24">% Turma</th>
                <th className="border p-2 text-right w-24">% Não Resp.</th>
              </tr>
            </thead>
            <tbody>
              {data.questoes.map((q) => (
                <tr key={q.exercicioId} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{q.ordem}</td>
                  <td className="border p-2">
                    {statusLabels[q.statusAluno]}
                    {q.respostaDigitada && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (Resp: {q.respostaDigitada})
                      </span>
                    )}
                  </td>
                  <td className="border p-2 text-center">{q.tentativasAluno}</td>
                  <td className="border p-2 text-right">{q.percentualAcertoTurma.toFixed(1)}%</td>
                  <td className="border p-2 text-right">{q.percentualNaoRespondeuTurma.toFixed(1)}%</td>
                </tr>
              ))}
              {data.questoes.length === 0 && (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-muted-foreground">
                    Nenhuma questão encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Rodapé */}
        <footer className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>Relatório REDIN gerado automaticamente pelo sistema Total Matemática</p>
        </footer>

        {/* Botão de voltar (não aparece na impressão) */}
        <div className="no-print fixed bottom-4 right-4">
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded shadow hover:opacity-90"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
};

export default RedinPrintPage;