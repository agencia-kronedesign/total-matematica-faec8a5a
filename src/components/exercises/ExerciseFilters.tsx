
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExerciseFiltersProps {
  onCategoryChange: (category: string | null) => void;
  onDifficultyChange: (difficulty: string | null) => void;
}

const ExerciseFilters = ({ onCategoryChange, onDifficultyChange }: ExerciseFiltersProps) => {
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
        <Select onValueChange={(value) => onCategoryChange(value === 'todas' ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            <SelectItem value="aritmetica">Aritmética</SelectItem>
            <SelectItem value="algebra">Álgebra</SelectItem>
            <SelectItem value="geometria">Geometria</SelectItem>
            <SelectItem value="probabilidade">Probabilidade</SelectItem>
          </SelectContent>
        </Select>
        
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
