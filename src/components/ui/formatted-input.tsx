
import React, { forwardRef } from 'react';
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
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatters[formatter](rawValue);
      const unformattedValue = formatter === 'date' ? rawValue.replace(/\D/g, '') : rawValue.replace(/\D/g, '');
      
      // Atualizar o valor do input
      e.target.value = formattedValue;
      
      // Chamar callbacks
      if (onValueChange) {
        onValueChange(unformattedValue, formattedValue);
      }
      
      if (onChange) {
        onChange(e);
      }
    };

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
