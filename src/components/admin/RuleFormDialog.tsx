import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AccessRule } from '@/hooks/useAccessRules';

const ROLES = ['admin', 'direcao', 'coordenador', 'professor', 'aluno', 'responsavel'];
const ACTIONS = ['view', 'create', 'update', 'delete', 'execute'];

interface RuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: AccessRule | null;
  onSave: (data: any) => void;
  isSaving: boolean;
}

const RuleFormDialog: React.FC<RuleFormDialogProps> = ({ open, onOpenChange, rule, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    role: 'aluno',
    resource_type: '',
    resource_id: '',
    action: 'view',
    conditions: '{}',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        role: rule.role,
        resource_type: rule.resource_type,
        resource_id: rule.resource_id || '',
        action: rule.action,
        conditions: JSON.stringify(rule.conditions || {}, null, 2),
        description: rule.description || '',
        is_active: rule.is_active,
      });
    } else {
      setFormData({ role: 'aluno', resource_type: '', resource_id: '', action: 'view', conditions: '{}', description: '', is_active: true });
    }
  }, [rule, open]);

  const handleSubmit = () => {
    let parsedConditions = {};
    try { parsedConditions = JSON.parse(formData.conditions); } catch { /* keep empty */ }

    onSave({
      ...(rule?.id ? { id: rule.id } : {}),
      role: formData.role,
      resource_type: formData.resource_type,
      resource_id: formData.resource_id || null,
      action: formData.action,
      conditions: parsedConditions,
      description: formData.description || null,
      is_active: formData.is_active,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{rule ? 'Editar Regra de Acesso' : 'Nova Regra de Acesso'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select value={formData.role} onValueChange={v => setFormData(p => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ação</Label>
              <Select value={formData.action} onValueChange={v => setFormData(p => ({ ...p, action: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Recurso</Label>
            <Input value={formData.resource_type} onChange={e => setFormData(p => ({ ...p, resource_type: e.target.value }))} placeholder="Ex: report, ai_query, dashboard" />
          </div>

          <div className="space-y-2">
            <Label>ID do Recurso (opcional)</Label>
            <Input value={formData.resource_id} onChange={e => setFormData(p => ({ ...p, resource_id: e.target.value }))} placeholder="Deixe vazio para todos" />
          </div>

          <div className="space-y-2">
            <Label>Condições (JSON)</Label>
            <Textarea value={formData.conditions} onChange={e => setFormData(p => ({ ...p, conditions: e.target.value }))} placeholder='{"state": "SP"}' className="font-mono text-xs min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Descreva esta regra" />
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={formData.is_active} onCheckedChange={v => setFormData(p => ({ ...p, is_active: v }))} />
            <Label>Regra ativa</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving || !formData.resource_type}>
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RuleFormDialog;
