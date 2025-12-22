import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useActivityReport, StatusGeral, RespostaPorAluno } from '@/hooks/useActivityReport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, X, Users, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const statusLabels: Record<StatusGeral, string> = {
  CORRETO: '100% Correto',
  ACERTO_MARGEM: 'Acerto com Margem',
  MEIO_CERTO: 'Meio Certo',
  ERRO: 'Incorreto',
  NAO_RESPONDEU: 'Não Respondeu'
};

const statusColors: Record<StatusGeral, string> = {
  CORRETO: 'bg-green-100 text-green-800 border-green-300',
  ACERTO_MARGEM: 'bg-blue-100 text-blue-800 border-blue-300',
  MEIO_CERTO: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ERRO: 'bg-red-100 text-red-800 border-red-300',
  NAO_RESPONDEU: 'bg-gray-100 text-gray-800 border-gray-300'
};

const ActivityReportPrintPage = () => {
  const { atividadeId } = useParams<{ atividadeId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useActivityReport(atividadeId || '');

  // Auto-print após carregamento
  useEffect(() => {
    if (data && !isLoading && !error) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [data, isLoading, error]);

  if (!atividadeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">ID da atividade não informado</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando relatório...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar relatório</p>
      </div>
    );
  }

  const { atividade, resumo, respostasPorAluno } = data;

  if (!atividade) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Atividade não encontrada</p>
      </div>
    );
  }

  // Calcular distribuição de desempenho
  const distribuicao = {
    correto: respostasPorAluno.filter(a => a.statusGeral === 'CORRETO').length,
    margem: respostasPorAluno.filter(a => a.statusGeral === 'ACERTO_MARGEM').length,
    meioCerto: respostasPorAluno.filter(a => a.statusGeral === 'MEIO_CERTO').length,
    incorreto: respostasPorAluno.filter(a => a.statusGeral === 'ERRO').length,
    naoRespondeu: respostasPorAluno.filter(a => a.statusGeral === 'NAO_RESPONDEU').length
  };

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      {/* Estilos de impressão */}
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
          size: A4 portrait;
          margin: 15mm;
        }
      `}</style>

      {/* Botão Fechar (não imprime) */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            window.close();
          }
        }}
        className="no-print fixed top-4 right-4 z-50"
      >
        <X className="h-4 w-4 mr-1" />
        Fechar
      </Button>

      {/* Container principal */}
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho institucional */}
        <header className="text-center border-b-2 border-primary pb-4 mb-6">
          <h1 className="text-2xl font-bold text-primary">TOTAL MATEMÁTICA</h1>
          <h2 className="text-lg font-semibold text-muted-foreground mt-1">
            Relatório de Atividade - Desempenho da Turma
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Gerado em: {format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </header>

        {/* Dados da atividade */}
        <section className="bg-muted/30 rounded-lg p-4 mb-6 border">
          <h3 className="font-semibold text-lg mb-3 text-foreground">{atividade.titulo}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Tipo:</span>
              <p className="font-medium">{atividade.tipo === 'casa' ? 'Para Casa' : 'Em Aula'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Turma:</span>
              <p className="font-medium">
                {atividade.turma?.nome || 'Sem turma'} ({atividade.turma?.ano_letivo || '-'})
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Criação:</span>
              <p className="font-medium">
                {format(new Date(atividade.data_envio), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Prazo:</span>
              <p className="font-medium">
                {atividade.data_limite 
                  ? format(new Date(atividade.data_limite), 'dd/MM/yyyy', { locale: ptBR })
                  : 'Sem prazo'}
              </p>
            </div>
          </div>
        </section>

        {/* Cards de resumo */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-700">{resumo.totalAlunosNaTurma}</p>
            <p className="text-sm text-blue-600">Alunos da Turma</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-700">{resumo.totalAlunosQueResponderam}</p>
            <p className="text-sm text-green-600">Responderam</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <XCircle className="h-6 w-6 mx-auto text-red-600 mb-2" />
            <p className="text-2xl font-bold text-red-700">
              {resumo.totalAlunosNaTurma - resumo.totalAlunosQueResponderam}
            </p>
            <p className="text-sm text-red-600">Não Responderam</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <FileText className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-700">{resumo.totalRespostas}</p>
            <p className="text-sm text-purple-600">Total Respostas</p>
          </div>
        </section>

        {/* Distribuição de desempenho */}
        <section className="mb-6">
          <h3 className="font-semibold text-lg mb-3 text-foreground">Distribuição de Desempenho</h3>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-700">{distribuicao.correto}</p>
              <p className="text-xs text-green-600">100% Correto</p>
            </div>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{distribuicao.margem}</p>
              <p className="text-xs text-blue-600">Com Margem</p>
            </div>
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-yellow-700">{distribuicao.meioCerto}</p>
              <p className="text-xs text-yellow-600">Meio Certo</p>
            </div>
            <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-700">{distribuicao.incorreto}</p>
              <p className="text-xs text-red-600">Incorreto</p>
            </div>
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-700">{distribuicao.naoRespondeu}</p>
              <p className="text-xs text-gray-600">Não Respondeu</p>
            </div>
          </div>
        </section>

        {/* Tabela de alunos */}
        <section>
          <h3 className="font-semibold text-lg mb-3 text-foreground">Desempenho Individual</h3>
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-2 text-left w-16">Nº</th>
                <th className="border border-border p-2 text-left">Nome do Aluno</th>
                <th className="border border-border p-2 text-center w-40">Status</th>
                <th className="border border-border p-2 text-center w-24">Respostas</th>
              </tr>
            </thead>
            <tbody>
              {respostasPorAluno
                .sort((a, b) => (a.numeroChamada || 999) - (b.numeroChamada || 999))
                .map((aluno, index) => (
                  <tr key={aluno.alunoId} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                    <td className="border border-border p-2 text-center">
                      {aluno.numeroChamada || '-'}
                    </td>
                    <td className="border border-border p-2">
                      {aluno.nomeAluno}
                    </td>
                    <td className="border border-border p-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${statusColors[aluno.statusGeral]}`}>
                        {statusLabels[aluno.statusGeral]}
                      </span>
                    </td>
                    <td className="border border-border p-2 text-center">
                      {aluno.respostas.length}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* Rodapé */}
        <footer className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
          <p>Relatório gerado automaticamente pelo sistema Total Matemática</p>
          <p>Este documento é confidencial e destinado exclusivamente ao uso pedagógico</p>
        </footer>
      </div>
    </div>
  );
};

export default ActivityReportPrintPage;
