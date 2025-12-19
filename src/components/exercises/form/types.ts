
import { z } from 'zod';

export const exerciseFormSchema = z.object({
  subcategoria_id: z.string({ required_error: "Selecione uma subcategoria" })
    .min(1, { message: "Selecione uma subcategoria" })
    .uuid({ message: "Subcategoria inválida" }),
  ordem: z.coerce.number().int().min(1, { message: "A ordem deve ser um número inteiro positivo" }),
  formula: z.string().min(1, { message: "A fórmula é obrigatória" }),
  margem_erro: z.coerce.number().min(0, { message: "A margem de erro deve ser um número positivo" }),
});

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;
