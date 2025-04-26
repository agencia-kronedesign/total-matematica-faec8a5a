
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CategorySelectionProps {
  categories: Array<{
    id: string;
    nome: string;
    nivel_dificuldade?: number;
    ordem?: number;
    ativo?: boolean;
  }>;
  selectedCategory: string | null;
  onCategoryChange: (value: string) => void;
}

const CategorySelection = ({ categories, selectedCategory, onCategoryChange }: CategorySelectionProps) => {
  const activeCategories = categories.filter(category => category.ativo !== false);
  const sortedCategories = activeCategories.sort((a, b) => 
    (a.ordem || 0) - (b.ordem || 0)
  );

  const getDifficultyColor = (nivel: number | undefined) => {
    if (!nivel) return 'bg-gray-200';
    if (nivel <= 2) return 'bg-green-200 text-green-800';
    if (nivel <= 4) return 'bg-yellow-200 text-yellow-800';
    return 'bg-red-200 text-red-800';
  };

  const getDifficultyLabel = (nivel: number | undefined) => {
    if (!nivel) return 'Não definida';
    if (nivel <= 2) return 'Básico';
    if (nivel <= 4) return 'Intermediário';
    return 'Avançado';
  };

  return (
    <div className="space-y-2">
      <FormLabel>Categoria</FormLabel>
      <Select
        value={selectedCategory || ""}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {sortedCategories.map((category) => (
            <SelectItem 
              key={category.id} 
              value={category.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{category.nome}</span>
                <Badge variant="secondary" className={getDifficultyColor(category.nivel_dificuldade)}>
                  {getDifficultyLabel(category.nivel_dificuldade)}
                </Badge>
                {category.ordem && (
                  <Badge variant="outline" className="ml-2">
                    Ordem: {category.ordem}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelection;
