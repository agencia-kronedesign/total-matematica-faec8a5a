
import React, { forwardRef, useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatPhone, formatCPF, formatCEP, formatRG, formatCNPJ, formatDate, dateFromISO } from '@/utils/formatters';

export type FormatterType = 'phone' | 'cpf' | 'cep' | 'rg' | 'cnpj' | 'date';

interface FormattedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue'> {
  formatter: FormatterType;
  onValueChange?: (unformattedValue: string, formattedValue: string) => void;
  defaultValue?: string;
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
  ({ formatter, onValueChange, onChange, value, defaultValue, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(() => {
      // Inicializar com defaultValue se fornecido
      if (defaultValue && formatter === 'date') {
        const dv = String(defaultValue);
        return dv.includes('-') ? dateFromISO(dv) : dv;
      }
      if (defaultValue) return String(defaultValue);
      return '';
    });
    
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    
    useEffect(() => {
      if (isControlled && formatter === 'date') {
        const stringValue = String(value);
        const displayValue = stringValue.includes('-') ? dateFromISO(stringValue) : stringValue;
        setInternalValue(displayValue);
      } else if (isControlled) {
        setInternalValue(String(value));
      }
    }, [value, formatter, isControlled]);
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formattedValue = formatters[formatter](rawValue);
      const unformattedValue = rawValue.replace(/\D/g, '');
      
      // Atualizar estado interno se não há controle externo
      if (!isControlled) {
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
