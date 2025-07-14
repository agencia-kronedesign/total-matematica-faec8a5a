import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { UserFormData, UserType } from '@/types/user';

interface StaffRegistrationFieldsProps {
  form: UseFormReturn<UserFormData>;
  userType: UserType;
}

const StaffRegistrationFields = ({ form, userType }: StaffRegistrationFieldsProps) => {
  const getPlaceholderByCargo = (tipo: UserType) => {
    switch (tipo) {
      case 'professor':
        return 'Ex: Professor de Matemática';
      case 'coordenador':
        return 'Ex: Coordenador Pedagógico';
      case 'direcao':
        return 'Ex: Diretor Pedagógico';
      case 'admin':
        return 'Ex: Administrador do Sistema';
      default:
        return 'Ex: Cargo/Função';
    }
  };

  const getAreaOptions = (tipo: UserType) => {
    switch (tipo) {
      case 'professor':
        return [
          'Matemática',
          'Português',
          'História',
          'Geografia',
          'Ciências',
          'Física',
          'Química',
          'Biologia',
          'Inglês',
          'Educação Física',
          'Arte',
          'Ensino Religioso'
        ];
      case 'coordenador':
        return [
          'Coordenação Pedagógica',
          'Coordenação Disciplinar',
          'Coordenação de Área',
          'Orientação Educacional'
        ];
      case 'direcao':
        return [
          'Direção Geral',
          'Direção Pedagógica',
          'Direção Administrativa',
          'Vice-Direção'
        ];
      default:
        return [];
    }
  };

  const areaOptions = getAreaOptions(userType);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
      <h3 className="text-lg font-semibold text-green-900 col-span-full">
        Dados Profissionais
      </h3>
      
      <FormField
        control={form.control}
        name="cargo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cargo/Função *</FormLabel>
            <FormControl>
              <Input 
                placeholder={getPlaceholderByCargo(userType)} 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="col-span-full">
        <p className="text-sm text-green-700 mt-2">
          {userType === 'professor' && 'Informe sua área de ensino principal e outros dados profissionais relevantes.'}
          {userType === 'coordenador' && 'Informe sua área de coordenação e responsabilidades pedagógicas.'}
          {userType === 'direcao' && 'Informe sua função na direção da instituição.'}
          {userType === 'admin' && 'Administrador do sistema com acesso total às funcionalidades.'}
        </p>
      </div>
    </div>
  );
};

export default StaffRegistrationFields;