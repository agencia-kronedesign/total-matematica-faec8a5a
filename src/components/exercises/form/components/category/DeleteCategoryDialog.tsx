
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  onConfirm: () => void;
  subcategoriesCount: number;
}

export const DeleteCategoryDialog = ({
  isOpen,
  onOpenChange,
  categoryName,
  onConfirm,
  subcategoriesCount,
}: DeleteCategoryDialogProps) => (
  <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Deletar Categoria</AlertDialogTitle>
        <AlertDialogDescription className="space-y-4">
          {subcategoriesCount > 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta categoria possui {subcategoriesCount} subcategoria{subcategoriesCount > 1 ? 's' : ''} ativa{subcategoriesCount > 1 ? 's' : ''}.
                Você precisa remover todas as subcategorias antes de deletar esta categoria.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              Tem certeza que deseja deletar a categoria "{categoryName}"?
              Esta ação não poderá ser desfeita e todos os dados relacionados serão permanentemente removidos.
            </>
          )}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={subcategoriesCount > 0}
        >
          Confirmar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
