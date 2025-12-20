import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfessorTurmas, useAlunosTurma, ProfessorTurmaInfo } from '@/hooks/useProfessorTurmas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GraduationCap, Users, Calendar, Clock, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

const ProfessorTurmas = () => {
  const navigate = useNavigate();
  const { turmas, isLoading, error, refetch } = useProfessorTurmas();
  const [selectedTurma, setSelectedTurma] = useState<ProfessorTurmaInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerAlunos = (turma: ProfessorTurmaInfo) => {
    setSelectedTurma(turma);
    setIsModalOpen(true);
  };

  const handleVerAtividades = (turmaId: string) => {
    navigate(`/professor/atividades?turma=${turmaId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar turmas</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao buscar suas turmas. Por favor, tente novamente.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Minhas Turmas</h1>
        <p className="text-muted-foreground">
          Veja as turmas em que você leciona e os alunos matriculados.
        </p>
      </div>

      {/* Lista de Turmas */}
      {turmas.length === 0 ? (
        <Alert>
          <GraduationCap className="h-4 w-4" />
          <AlertTitle>Nenhuma turma encontrada</AlertTitle>
          <AlertDescription>
            Você ainda não tem turmas vinculadas. Crie uma atividade para uma turma e ela aparecerá aqui.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {turmas.map((turma) => (
            <TurmaCard
              key={turma.id}
              turma={turma}
              onVerAlunos={() => handleVerAlunos(turma)}
              onVerAtividades={() => handleVerAtividades(turma.id)}
            />
          ))}
        </div>
      )}

      {/* Modal de Alunos */}
      <AlunosModal
        turma={selectedTurma}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTurma(null);
        }}
      />
    </div>
  );
};

// Componente do Card de Turma
interface TurmaCardProps {
  turma: ProfessorTurmaInfo;
  onVerAlunos: () => void;
  onVerAtividades: () => void;
}

const TurmaCard = ({ turma, onVerAlunos, onVerAtividades }: TurmaCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{turma.nome}</CardTitle>
          </div>
          <Badge variant={turma.status ? 'default' : 'secondary'}>
            {turma.status ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações da Turma */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Ano Letivo: {turma.ano_letivo}</span>
          </div>
          {turma.turno && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Turno: {turma.turno}</span>
            </div>
          )}
          {turma.nivel_ensino && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Nível: {turma.nivel_ensino}</span>
            </div>
          )}
        </div>

        {/* Contagem de Alunos */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-medium">Alunos: {turma.totalAlunos}</span>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onVerAlunos}
          >
            <Users className="h-4 w-4 mr-2" />
            Ver Alunos
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={onVerAtividades}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Ver Atividades
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente do Modal de Alunos
interface AlunosModalProps {
  turma: ProfessorTurmaInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const AlunosModal = ({ turma, isOpen, onClose }: AlunosModalProps) => {
  const { alunos, isLoading, error } = useAlunosTurma(turma?.id || null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Alunos da Turma: {turma?.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro ao carregar alunos</AlertTitle>
              <AlertDescription>
                Não foi possível carregar a lista de alunos.
              </AlertDescription>
            </Alert>
          ) : alunos.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertTitle>Nenhum aluno matriculado</AlertTitle>
              <AlertDescription>
                Esta turma ainda não possui alunos matriculados com status ativo.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Nº</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alunos.map((aluno) => (
                    <TableRow key={aluno.alunoId}>
                      <TableCell className="font-medium">
                        {aluno.numeroChamada ?? '-'}
                      </TableCell>
                      <TableCell>{aluno.nome}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {aluno.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Total de alunos: {alunos.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfessorTurmas;
