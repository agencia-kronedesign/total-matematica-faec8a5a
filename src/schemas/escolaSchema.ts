
import { z } from 'zod';
import { validateCNPJ, validatePhone, validateCEP } from '@/utils/formatters';

export const escolaSchema = z.object({
  razao_social: z.string().min(1, 'Razão social é obrigatória'),
  nome_fantasia: z.string().min(1, 'Nome fantasia é obrigatório'),
  cnpj: z.string().optional().refine((val) => validateCNPJ(val || ''), {
    message: 'CNPJ inválido'
  }),
  inscricao_municipal: z.string().optional(),
  inscricao_estadual: z.string().optional(),
  isento_municipal: z.boolean().default(false),
  isento_estadual: z.boolean().default(false),
  cep: z.string().min(1, 'CEP é obrigatório').refine((val) => validateCEP(val), {
    message: 'CEP inválido'
  }),
  telefone: z.string().optional().refine((val) => validatePhone(val || ''), {
    message: 'Telefone inválido'
  }),
  telefone_secundario: z.string().optional().refine((val) => validatePhone(val || ''), {
    message: 'Telefone secundário inválido'
  }),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  email_secundario: z.string().email('E-mail secundário inválido').optional().or(z.literal('')),
  site: z.string().url('URL inválida').optional().or(z.literal('')),
  endereco: z.string().optional(),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  observacoes: z.string().max(1000, 'Observações não podem exceder 1000 caracteres').optional(),
  status: z.boolean().default(true),
}).refine((data) => {
  // Inscrição municipal é obrigatória se não estiver isento
  if (!data.isento_municipal && !data.inscricao_municipal) {
    return false;
  }
  return true;
}, {
  message: 'Inscrição municipal é obrigatória quando não isento',
  path: ['inscricao_municipal'],
}).refine((data) => {
  // Inscrição estadual é obrigatória se não estiver isento
  if (!data.isento_estadual && !data.inscricao_estadual) {
    return false;
  }
  return true;
}, {
  message: 'Inscrição estadual é obrigatória quando não isento',
  path: ['inscricao_estadual'],
});

export type EscolaFormData = z.infer<typeof escolaSchema>;
