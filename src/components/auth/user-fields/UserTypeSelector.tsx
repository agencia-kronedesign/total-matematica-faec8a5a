import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { UserFormData, USER_TYPE_LABELS } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserTypeSelectorProps {
  form: UseFormReturn<UserFormData>;
}

const UserTypeSelector = ({ form }: UserTypeSelectorProps) => {
  const watchedUserType = form.watch('tipo_usuario');

  const getTypeDescription = (type: string) => {
    const descriptions = {
      aluno: 'Estudante da instituição com acesso a exercícios e atividades',
      professor: 'Educador com permissões para criar e gerenciar atividades',
      coordenador: 'Responsável pela coordenação pedagógica e supervisão',
      direcao: 'Administrador com acesso total à gestão da instituição',
      admin: 'Administrador do sistema com permissões completas',
      responsavel: 'Responsável legal pelo aluno'
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="tipo_usuario"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Usuário *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(USER_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchedUserType && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-900">
              {USER_TYPE_LABELS[watchedUserType as keyof typeof USER_TYPE_LABELS]}
            </CardTitle>
            <CardDescription className="text-blue-700">
              {getTypeDescription(watchedUserType)}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default UserTypeSelector;