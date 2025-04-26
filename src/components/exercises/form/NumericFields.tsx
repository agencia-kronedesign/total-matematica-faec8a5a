
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UseFormReturn } from 'react-hook-form';
import { ExerciseFormValues } from './types';

interface NumericFieldsProps {
  form: UseFormReturn<ExerciseFormValues>;
}

const NumericFields = ({ form }: NumericFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="ordem"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ordem</FormLabel>
            <FormControl>
              <Input type="number" min="1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="margem_erro"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Margem de Erro
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="ml-2">
                    <span className="text-xs bg-slate-200 rounded-full h-5 w-5 inline-flex items-center justify-center">?</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Valor entre 0 e 1 que representa a margem de erro aceita.
                      Ex: 0.1 aceita respostas dentro de 10% do valor correto.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </FormLabel>
            <FormControl>
              <Input type="number" min="0" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default NumericFields;
