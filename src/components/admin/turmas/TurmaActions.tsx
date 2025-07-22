
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/ui/status-badge';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface Turma {
  id: string;
  nome: string;
  escola_id: string;
  ano_letivo: number;
  turno: string | null;
  nivel_ensino: string | null;
  status: boolean;
  created_at: string;
  escola?: {
    razao_social: string;
  };
}

interface TurmaActionsProps {
  turma: Turma;
  onEdit: (turma: Turma) => void;
  onDelete: (turma: Turma) => void;
  onToggleStatus: (turma: Turma) => void;
  isUpdating: boolean;
}

const TurmaActions = ({ turma, onEdit, onDelete, onToggleStatus, isUpdating }: TurmaActionsProps) => {
  const { canManageUsers, isAdmin } = usePermissions();

  if (!canManageUsers()) {
    return (
      <StatusBadge 
        isActive={turma.status} 
        activeLabel="Ativa" 
        inactiveLabel="Inativa" 
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      <StatusBadge 
        isActive={turma.status} 
        activeLabel="Ativa" 
        inactiveLabel="Inativa" 
      />
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        <Switch
          checked={turma.status}
          onCheckedChange={() => onToggleStatus(turma)}
          disabled={isUpdating}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(turma)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem 
              onClick={() => onDelete(turma)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TurmaActions;
