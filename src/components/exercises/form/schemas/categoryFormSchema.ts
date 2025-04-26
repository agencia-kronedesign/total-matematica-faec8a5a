
import { z } from 'zod';

export const categoryFormSchema = z.object({
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  descricao: z.string().optional(),
  ordem: z.coerce.number().int().min(1, { message: "Ordem deve ser um número inteiro positivo" }).optional(),
  nivel_dificuldade: z.coerce.number().int().min(1).max(5, { message: "Nível de dificuldade deve ser entre 1 e 5" }).optional(),
  cor: z.string().min(1, { message: "Cor é obrigatória" }).optional(),
  ativo: z.boolean().default(true)
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
