
import { Badge } from '@/components/ui/badge';

interface DifficultyBadgeProps {
  level: number | undefined;
}

export const DifficultyBadge = ({ level }: DifficultyBadgeProps) => {
  const getDifficultyLabel = (nivel: number | undefined) => {
    if (!nivel) return 'Não definida';
    if (nivel <= 2) return 'Fácil';
    if (nivel <= 4) return 'Médio';
    return 'Difícil';
  };
  
  const getDifficultyBadgeClass = (nivel: number | undefined) => {
    if (!nivel) return 'bg-gray-100 text-gray-800';
    if (nivel <= 2) return 'bg-green-100 text-green-800';
    if (nivel <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Badge className={getDifficultyBadgeClass(level)}>
      {getDifficultyLabel(level)}
    </Badge>
  );
};
