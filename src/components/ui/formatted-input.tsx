
import React, { forwardRef, useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatPhone, formatCPF, formatCEP, formatRG, formatCNPJ, formatDate, dateFromISO } from '@/utils/formatters';

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
    // Estado interno para controlar o valor quando não há prop value
    const [internalValue, setInternalValue] = useState('');
    
    // Usar valor controlado se fornecido, senão usar estado interno
    const currentValue = value !== undefined ? value : internalValue;
    
    // Inicializar valor interno baseado no prop value inicial (para casos de edição)
    useEffect(() => {
      if (value !== undefined && formatter === 'date') {
        // Para datas, converter de ISO se necessário
        const displayValue = value.includes('-') ? dateFromISO(String(value)) : String(value);
        setInternalValue(displayValue);
      } else if (value !== undefined) {
        setInternalValue(String(value));
      }
    }, [value, formatter]);
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatters[formatter](rawValue);
      const unformattedValue = rawValue.replace(/\D/g, '');
      
      // Atualizar estado interno se não há controle externo
      if (value === undefined) {
        setInternalValue(formattedValue);
      }
      
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
    }, [formatter, onValueChange, onChange, value]);

    const displayValue = formatters[formatter](String(currentValue));

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
