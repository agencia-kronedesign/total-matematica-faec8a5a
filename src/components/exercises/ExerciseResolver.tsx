
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { SafeMathEvaluator } from '@/utils/safeMathEvaluator';

const formSchema = z.object({
  input: z.coerce.number()
    .positive('O número deve ser positivo')
    .int('O número deve ser inteiro'),
  answer: z.coerce.number()
    .min(-999999999, 'Resposta inválida')
    .max(999999999, 'Resposta inválida')
});

interface ExerciseResolverProps {
  exerciseId: string;
  category: string;
  subcategory: string;
  order: number;
  formula: string;
  marginError: number;
  imageUrl?: string;
}

export function ExerciseResolver({ 
  exerciseId, 
  category, 
  subcategory, 
  order, 
  formula, 
  marginError,
  imageUrl 
}: ExerciseResolverProps) {
  const [result, setResult] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: undefined,
      answer: undefined
    }
  });

  const calculateResult = (formula: string, input: number, answer: number, margin: number) => {
    // Validate and safely evaluate the mathematical expression
    if (!SafeMathEvaluator.isValidFormula(formula)) {
      throw new Error('Fórmula inválida ou insegura');
    }
    
    const expectedResult = SafeMathEvaluator.evaluate(formula, input);
    const userAnswer = answer;
    
    // Calcula as margens de erro
    const lowerBound = expectedResult * (1 - margin/100);
    const upperBound = expectedResult * (1 + margin/100);
    const absoluteDiff = Math.abs(userAnswer - expectedResult);

    if (userAnswer === expectedResult) {
      return 'PARABÉNS! 100% CORRETO!';
    } else if (userAnswer >= lowerBound && userAnswer <= upperBound) {
      return 'PARABÉNS! VOCÊ ACERTOU!';
    } else if (Math.abs(Math.abs(userAnswer) - Math.abs(expectedResult)) <= Math.abs(expectedResult * 0.1)) {
      return 'Pode-se dizer que está "MEIO CERTO"! Não desista, continue tentando!';
    } else {
      return 'NÃO FOI DESSA VEZ! Continue tentando, VOCÊ CONSEGUE!';
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    try {
      const result = calculateResult(formula, values.input, values.answer, marginError);
      setResult(result);
      if (result.includes('PARABÉNS')) {
        toast.success(result);
      } else {
        toast.error(result);
      }
    } catch (error) {
      console.error('Erro ao calcular resultado:', error);
      toast.error('Erro ao processar sua resposta. Tente novamente.');
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            <span>{category}</span>
            {' > '}
            <span>{subcategory}</span>
          </p>
          <h2 className="text-xl font-semibold mt-2">
            Exercício {order}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            (OBS: Os exercícios NÃO estão em ordem crescente de dificuldade)
          </p>
        </div>

        {imageUrl && (
          <div className="mb-6">
            <img 
              src={imageUrl} 
              alt={`Exercício ${order}`} 
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="input"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número da chamada (Digite o valor que você atribuiu ao "n")</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resposta (Utilizando no mínimo quatro casas decimais quando possível)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Enviar
            </Button>

            {result && (
              <div className={`p-4 rounded-lg text-center font-medium ${
                result.includes('PARABÉNS') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
