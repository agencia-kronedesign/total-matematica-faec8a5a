import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showStrengthIndicator?: boolean;
  showValidationList?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

export const validatePassword = (password: string): PasswordValidation => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
});

export const isPasswordValid = (password: string): boolean => {
  const validation = validatePassword(password);
  return validation.minLength && validation.hasUppercase && validation.hasLowercase && validation.hasNumber;
};

export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  const validation = validatePassword(password);
  const criteriaCount = [
    validation.minLength,
    validation.hasUppercase,
    validation.hasLowercase,
    validation.hasNumber,
  ].filter(Boolean).length;

  if (criteriaCount <= 1) return 'weak';
  if (criteriaCount <= 3) return 'medium';
  return 'strong';
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = 'Digite sua senha',
  showStrengthIndicator = true,
  showValidationList = true,
  disabled = false,
  id,
  name,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const validation = useMemo(() => validatePassword(value), [value]);
  const strength = useMemo(() => getPasswordStrength(value), [value]);

  const strengthColors = {
    weak: 'bg-destructive',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthLabels = {
    weak: 'Fraca',
    medium: 'Média',
    strong: 'Forte',
  };

  const strengthWidths = {
    weak: 'w-1/3',
    medium: 'w-2/3',
    strong: 'w-full',
  };

  const validationItems = [
    { key: 'minLength', label: 'Mínimo 8 caracteres', valid: validation.minLength },
    { key: 'hasUppercase', label: 'Uma letra maiúscula', valid: validation.hasUppercase },
    { key: 'hasLowercase', label: 'Uma letra minúscula', valid: validation.hasLowercase },
    { key: 'hasNumber', label: 'Um número', valid: validation.hasNumber },
  ];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn('pr-10', className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {showStrengthIndicator && value.length > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                strengthWidths[strength],
                strengthColors[strength]
              )}
            />
          </div>
          <p className={cn(
            'text-xs font-medium',
            strength === 'weak' && 'text-destructive',
            strength === 'medium' && 'text-yellow-600 dark:text-yellow-500',
            strength === 'strong' && 'text-green-600 dark:text-green-500'
          )}>
            Força da senha: {strengthLabels[strength]}
          </p>
        </div>
      )}

      {showValidationList && value.length > 0 && (
        <ul className="space-y-1 text-xs">
          {validationItems.map((item) => (
            <li
              key={item.key}
              className={cn(
                'flex items-center gap-1.5',
                item.valid ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
              )}
            >
              {item.valid ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordInput;
