
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Turma {
  id: string;
  nome: string;
  escola?: {
    razao_social: string;
  };
}

interface DeleteTurmaDialogProps {
  turma: Turma | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  matriculasCount: number;
}

const DeleteTurmaDialog = ({ 
  turma, 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting,
  matriculasCount 
}: DeleteTurmaDialogProps) => {
  if (!turma) return null;

  const hasActiveEnrollments = matriculasCount > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza de que deseja deletar a turma <strong>{turma.nome}</strong>?
            </p>
            {turma.escola && (
              <p className="text-sm text-muted-foreground">
                Escola: {turma.escola.razao_social}
              </p>
            )}
            {hasActiveEnrollments && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Atenção: Esta turma possui {matriculasCount} matrícula(s) ativa(s).
                </p>
                <p className="text-sm text-destructive mt-1">
                  A exclusão da turma pode afetar os alunos matriculados.
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deletando...' : 'Deletar Turma'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTurmaDialog;
