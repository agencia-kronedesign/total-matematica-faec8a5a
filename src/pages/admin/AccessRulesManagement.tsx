import React, { useState } from 'react';
import { useAccessRules, AccessRule } from '@/hooks/useAccessRules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, Plus, Pencil, Trash2, Search, GitBranch } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import RuleFormDialog from '@/components/admin/RuleFormDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const AccessRulesManagement = () => {
  const { rules, hierarchy, isLoading, createRule, updateRule, deleteRule, toggleRule } = useAccessRules();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);

  const filteredRules = rules.filter(r =>
    r.role.includes(search.toLowerCase()) ||
    r.resource_type.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: any) => {
    if (data.id) {
      updateRule.mutate(data, { onSuccess: () => setDialogOpen(false) });
    } else {
      createRule.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const actionColors: Record<string, string> = {
    view: 'bg-blue-100 text-blue-800',
    create: 'bg-green-100 text-green-800',
    update: 'bg-yellow-100 text-yellow-800',
    delete: 'bg-red-100 text-red-800',
    execute: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Regras de Acesso
          </h1>
          <p className="text-muted-foreground text-sm">Gerencie permissões configuráveis por perfil</p>
        </div>
        <Button onClick={() => { setEditingRule(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nova Regra
        </Button>
      </div>

      {/* Hierarquia */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> Hierarquia de Perfis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {hierarchy.map((h, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {h.parent_role} → {h.child_role}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtro + Tabela */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar regras..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filteredRules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma regra encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ativa</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <Badge variant="secondary">{rule.role}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{rule.resource_type}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColors[rule.action] || ''}`}>
                          {rule.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {rule.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Switch checked={rule.is_active} onCheckedChange={v => toggleRule.mutate({ id: rule.id, is_active: v })} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setEditingRule(rule); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir regra?</AlertDialogTitle>
                                <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteRule.mutate(rule.id)}>Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <RuleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
        onSave={handleSave}
        isSaving={createRule.isPending || updateRule.isPending}
      />
    </div>
  );
};

export default AccessRulesManagement;
