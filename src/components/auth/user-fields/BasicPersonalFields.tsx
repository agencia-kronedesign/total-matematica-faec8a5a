import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormattedInput } from '@/components/ui/formatted-input';
import { UseFormReturn } from 'react-hook-form';
import { UserFormData } from '@/types/user';
import { dateFromISO, dateToISO } from '@/utils/formatters';

interface BasicPersonalFieldsProps {
  form: UseFormReturn<UserFormData>;
}

const BasicPersonalFields = ({ form }: BasicPersonalFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Completo *</FormLabel>
            <FormControl>
              <Input placeholder="Digite o nome completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Digite o email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="telefone_mobile"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone Celular</FormLabel>
            <FormControl>
              <FormattedInput 
                formatter="phone" 
                placeholder="(11) 99999-9999" 
                {...field}
                onValueChange={(unformatted, formatted) => {
                  field.onChange(formatted);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="telefone_fixo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone Fixo</FormLabel>
            <FormControl>
              <FormattedInput 
                formatter="phone" 
                placeholder="(11) 3333-3333" 
                {...field}
                onValueChange={(unformatted, formatted) => {
                  field.onChange(formatted);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cpf"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CPF</FormLabel>
            <FormControl>
              <FormattedInput 
                formatter="cpf" 
                placeholder="000.000.000-00" 
                {...field}
                onValueChange={(unformatted, formatted) => {
                  field.onChange(formatted);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="rg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RG</FormLabel>
            <FormControl>
              <FormattedInput 
                formatter="rg" 
                placeholder="00.000.000-0" 
                {...field}
                onValueChange={(unformatted, formatted) => {
                  field.onChange(formatted);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="data_nascimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data de Nascimento</FormLabel>
            <FormControl>
              <FormattedInput 
                formatter="date" 
                placeholder="DD/MM/AAAA" 
                value={field.value ? dateFromISO(field.value) : ''}
                onValueChange={(unformatted, formatted) => {
                  // Só converter para ISO se a data estiver completa (8 dígitos)
                  if (unformatted.length === 8) {
                    const isoDate = dateToISO(formatted);
                    field.onChange(isoDate);
                  } else {
                    // Para datas incompletas, armazenar o valor formatado temporariamente
                    field.onChange(formatted);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicPersonalFields;
