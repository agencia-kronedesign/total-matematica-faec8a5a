// Utilitários de formatação de dados

// Formatação de telefone
export const formatPhone = (value: string): string => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    // Telefone fixo: (11) 3333-3333
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  } else {
    // Telefone celular: (11) 99999-9999
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
};

// Formatação de CPF
export const formatCPF = (value: string): string => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').replace(/-$/, '');
};

// Formatação de CEP
export const formatCEP = (value: string): string => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
};

// Formatação de RG
export const formatRG = (value: string): string => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{0,1})/, '$1.$2.$3-$4').replace(/-$/, '');
};

// Remove formatação e retorna apenas números
export const removeFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Validação de CPF melhorada
export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return true; // CPF opcional
  
  const numbers = removeFormatting(cpf);
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (parseInt(numbers[9]) !== digit) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (parseInt(numbers[10]) !== digit) return false;
  
  return true;
};

// Validação de CEP
export const validateCEP = (cep: string): boolean => {
  if (!cep) return true; // CEP opcional
  
  const numbers = removeFormatting(cep);
  return numbers.length === 8;
};