
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { CategoryFormValues } from '../schemas/categoryFormSchema';

interface DifficultyLevelFieldProps {
  form: UseFormReturn<CategoryFormValues>;
}

const DifficultyLevelField = ({ form }: DifficultyLevelFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="nivel_dificuldade"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nível de Dificuldade</FormLabel>
          <FormControl>
            <Select 
              onValueChange={(val) => form.setValue('nivel_dificuldade', Number(val))}
              value={field.value?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(nivel => (
                  <SelectItem key={nivel} value={nivel.toString()}>
                    Nível {nivel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DifficultyLevelField;
