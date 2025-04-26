
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { DifficultyBadge } from './category/DifficultyBadge';
import { StatusBadge } from './category/StatusBadge';
import { DeleteCategoryDialog } from './category/DeleteCategoryDialog';
import { EditCategoryDialog } from './category/EditCategoryDialog';
import { useCategoryManagement } from './category/useCategoryManagement';

const CategoryList = () => {
  const {
    categories,
    isLoading,
    selectedCategory,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleDeleteClick,
    handleEditClick,
    deleteMutation,
    queryClient,
  } = useCategoryManagement();

  if (isLoading) {
    return <div>Carregando categorias...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Dificuldade</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.nome}</TableCell>
                <TableCell>
                  <DifficultyBadge level={category.nivel_dificuldade} />
                </TableCell>
                <TableCell>{category.ordem || '-'}</TableCell>
                <TableCell>
                  <StatusBadge isActive={category.ativo ?? false} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCategory && (
        <>
          <DeleteCategoryDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            categoryName={selectedCategory.nome}
            onConfirm={() => deleteMutation.mutate(selectedCategory.id)}
          />
          <EditCategoryDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            category={selectedCategory}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['categories'] });
            }}
          />
        </>
      )}
    </div>
  );
};

export default CategoryList;
