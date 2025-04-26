
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  isActive: boolean;
}

export const StatusBadge = ({ isActive }: StatusBadgeProps) => (
  <Badge variant={isActive ? 'default' : 'secondary'}>
    {isActive ? 'Ativa' : 'Inativa'}
  </Badge>
);
