
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface SubcategoryFieldProps {
  form: UseFormReturn<any>;
  subcategories: Array<{ id: string; nome: string }>;
  disabled: boolean;
}

const SubcategoryField = ({ form, subcategories, disabled }: SubcategoryFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="subcategoria_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Subcategoria</FormLabel>
          <Select
            disabled={disabled}
            value={field.value}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma subcategoria" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SubcategoryField;
