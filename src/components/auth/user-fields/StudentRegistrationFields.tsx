import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { UserFormData } from '@/types/user';

interface StudentRegistrationFieldsProps {
  form: UseFormReturn<UserFormData>;
}

const StudentRegistrationFields = ({ form }: StudentRegistrationFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 col-span-full">Dados do Aluno</h3>
        
        <FormField
          control={form.control}
          name="numero_matricula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Matrícula *</FormLabel>
              <FormControl>
                <Input placeholder="202512345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero_chamada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Chamada *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="7" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="turma"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turma/Série *</FormLabel>
              <FormControl>
                <Input placeholder="7A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <h4 className="text-md font-medium text-blue-800 col-span-full">Responsável Principal</h4>
        
        <FormField
          control={form.control}
          name="nome_responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Responsável *</FormLabel>
              <FormControl>
                <Input placeholder="Maria Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email_responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email do Responsável *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="maria@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h4 className="text-md font-medium text-blue-800 col-span-full mt-4">Segundo Responsável (Opcional)</h4>
        
        <FormField
          control={form.control}
          name="nome_responsavel2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Segundo Responsável</FormLabel>
              <FormControl>
                <Input placeholder="João Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email_responsavel2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email do Segundo Responsável</FormLabel>
              <FormControl>
                <Input type="email" placeholder="joao@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default StudentRegistrationFields;