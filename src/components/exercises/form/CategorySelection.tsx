
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategorySelectionProps {
  categories: Array<{ id: string; nome: string }>;
  selectedCategory: string | null;
  onCategoryChange: (value: string) => void;
}

const CategorySelection = ({ categories, selectedCategory, onCategoryChange }: CategorySelectionProps) => {
  return (
    <div>
      <FormLabel>Categoria</FormLabel>
      <Select
        value={selectedCategory || ""}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione uma categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelection;
