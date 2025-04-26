
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCategoriesAndSubcategories } from '@/hooks/useCategoriesAndSubcategories';
import { Skeleton } from '@/components/ui/skeleton';

interface ExerciseFiltersProps {
  onCategoryChange: (category: string | null) => void;
  onDifficultyChange: (difficulty: string | null) => void;
}

const ExerciseFilters = ({ onCategoryChange, onDifficultyChange }: ExerciseFiltersProps) => {
  const { categories, isLoading } = useCategoriesAndSubcategories();
  
  const renderCategorySelect = () => {
    if (isLoading) {
      return <Skeleton className="h-10 w-[180px]" />;
    }

    return (
      <Select onValueChange={(value) => onCategoryChange(value === 'todas' ? null : value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Pesquisar exercícios..." 
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        {renderCategorySelect()}
        
        <Select onValueChange={(value) => onDifficultyChange(value === 'todos' ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os níveis</SelectItem>
            <SelectItem value="facil">Fácil</SelectItem>
            <SelectItem value="medio">Médio</SelectItem>
            <SelectItem value="dificil">Difícil</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExerciseFilters;
