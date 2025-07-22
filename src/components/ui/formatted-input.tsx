
import React, { forwardRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { formatPhone, formatCPF, formatCEP, formatRG, formatCNPJ, formatDate } from '@/utils/formatters';

export type FormatterType = 'phone' | 'cpf' | 'cep' | 'rg' | 'cnpj' | 'date';

interface FormattedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  formatter: FormatterType;
  onValueChange?: (unformattedValue: string, formattedValue: string) => void;
}

const formatters = {
  phone: formatPhone,
  cpf: formatCPF,
  cep: formatCEP,
  rg: formatRG,
  cnpj: formatCNPJ,
  date: formatDate,
};

export const FormattedInput = forwardRef<HTMLInputElement, FormattedInputProps>(
  ({ formatter, onValueChange, onChange, value, ...props }, ref) => {
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatters[formatter](rawValue);
      const unformattedValue = rawValue.replace(/\D/g, '');
      
      // Chamar callbacks se existirem
      if (onValueChange) {
        onValueChange(unformattedValue, formattedValue);
      }
      
      if (onChange) {
        // Criar um novo evento com o valor formatado
        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: formattedValue
          }
        };
        onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
      }
    }, [formatter, onValueChange, onChange]);

    const displayValue = value ? formatters[formatter](String(value)) : '';

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        maxLength={formatter === 'date' ? 10 : props.maxLength}
      />
    );
  }
);

FormattedInput.displayName = 'FormattedInput';
