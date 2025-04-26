
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UseFormReturn } from 'react-hook-form';
import { ExerciseFormValues } from './types';

interface FormulaFieldProps {
  form: UseFormReturn<ExerciseFormValues>;
}

const FormulaField = ({ form }: FormulaFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="formula"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            Fórmula
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="ml-2">
                  <span className="text-xs bg-slate-200 rounded-full h-5 w-5 inline-flex items-center justify-center">?</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Expressão matemática que será calculada. Use 'n' como variável.
                    Exemplo: "2*n + 5" ou "Math.pow(n, 2)"
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormulaField;
