
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isActive: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

export const StatusBadge = ({ 
  isActive, 
  activeLabel = 'Ativo', 
  inactiveLabel = 'Inativo',
  className 
}: StatusBadgeProps) => {
  return (
    <Badge 
      className={cn(
        isActive 
          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
          : 'bg-red-100 text-red-800 hover:bg-red-100',
        className
      )}
    >
      {isActive ? activeLabel : inactiveLabel}
    </Badge>
  );
};
