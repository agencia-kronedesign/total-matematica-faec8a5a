
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CategoryForm from '../../CategoryForm';
import { Category } from '../types';

interface EditCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  onSuccess: () => void;
}

export const EditCategoryDialog = ({
  isOpen,
  onOpenChange,
  category,
  onSuccess,
}: EditCategoryDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Editar Categoria</DialogTitle>
      </DialogHeader>
      <CategoryForm
        editData={category}
        onSuccess={() => {
          onOpenChange(false);
          onSuccess();
        }}
      />
    </DialogContent>
  </Dialog>
);
