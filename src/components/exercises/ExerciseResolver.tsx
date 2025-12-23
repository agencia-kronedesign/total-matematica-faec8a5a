import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useExerciseSubmission } from '@/hooks/useExerciseSubmission';
import { 
  evaluateExercise, 
  getResultClassName, 
  getToastType,
  type EvaluationResult 
} from '@/domain/exercises';
import { SafeMathEvaluator } from '@/utils/safeMathEvaluator';
import { Lock, AlertTriangle } from 'lucide-react';

export type ExerciseMode = 'CASA' | 'AULA' | 'PRATICA_LIVRE';

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
  atividadeId?: string;
  mode?: ExerciseMode;
  studentCallNumber?: number | null;
}

export function ExerciseResolver({ 
  exerciseId, 
  category, 
  subcategory, 
  order, 
  formula, 
  marginError,
  imageUrl,
  atividadeId,
  mode = 'PRATICA_LIVRE',
  studentCallNumber
}: ExerciseResolverProps) {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const { submitExercise, isSubmitting } = useExerciseSubmission();
  const queryClient = useQueryClient();
  
  const isCasaMode = mode === 'CASA';
  const isInputDisabled = isCasaMode && studentCallNumber != null;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      input: isInputDisabled ? studentCallNumber : undefined,
      answer: undefined
    }
  });

  // Atualizar o campo input quando studentCallNumber mudar no modo CASA
  useEffect(() => {
    if (isCasaMode && studentCallNumber != null) {
      form.setValue('input', studentCallNumber);
    }
  }, [isCasaMode, studentCallNumber, form]);

  // Verificar se a fórmula é válida
  const isFormulaValid = formula && formula.trim() !== '' && SafeMathEvaluator.isValidFormula(formula);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('[ExerciseResolver] Iniciando submissão:', { 
        exerciseId, 
        formula, 
        marginError, 
        input: values.input, 
        answer: values.answer,
        atividadeId 
      });
      
      // Validar fórmula antes de avaliar
      if (!formula || formula.trim() === '') {
        toast.error('Fórmula do exercício não está definida. Contate o administrador.');
        return;
      }

      if (!SafeMathEvaluator.isValidFormula(formula)) {
        console.error('[ExerciseResolver] Fórmula inválida:', formula);
        toast.error('A fórmula deste exercício está incorreta. Contate o administrador.');
        return;
      }
      
      // Tentar avaliar a fórmula com try-catch específico
      let evaluationResult: EvaluationResult;
      try {
        console.log('[ExerciseResolver] Avaliando exercício com fórmula:', formula);
        evaluationResult = evaluateExercise({
          formula,
          margem: marginError,
          n: values.input,
          respostaAluno: values.answer.toString()
        });
        console.log('[ExerciseResolver] Resultado da avaliação:', evaluationResult);
      } catch (formulaError) {
        console.error('[ExerciseResolver] Erro ao avaliar fórmula:', formulaError);
        toast.error('Erro ao processar a fórmula do exercício. Contate o administrador.');
        return;
      }
      
      setResult(evaluationResult);

      // Salvar resposta no banco de dados
      console.log('[ExerciseResolver] Salvando resposta no banco...');
      const submissionResult = await submitExercise({
        exerciseId,
        atividadeId,
        numeroN: values.input,
        respostaDigitada: values.answer.toString(),
        resultadoCalculado: evaluationResult.valorEsperado,
        margemAplicada: marginError,
        acertoNivel: evaluationResult.acertoNivel
      });
      if (submissionResult.success) {
        // Invalidar queries para atualizar progresso em tempo real
        queryClient.invalidateQueries({ queryKey: ['activity-all-responses', atividadeId] });
        queryClient.invalidateQueries({ queryKey: ['student-activities'] });
        // Invalidar query do relatório do professor para sincronizar
        queryClient.invalidateQueries({ queryKey: ['activity-report', atividadeId] });
        // Invalidar query de exercícios para atualizar filtros Pendentes/Concluídos
        queryClient.invalidateQueries({ queryKey: ['exercises'] });
        console.log('[ExerciseResolver] Cache invalidado: exercises, student-activities, activity-report');
        
        const toastType = getToastType(evaluationResult.acertoNivel);
        if (toastType === 'success') {
          toast.success(evaluationResult.mensagem);
        } else if (toastType === 'warning') {
          toast.warning(evaluationResult.mensagem);
        } else {
          toast.error(evaluationResult.mensagem);
        }
      } else {
        toast.error('Erro ao salvar resposta: ' + submissionResult.error);
      }
    } catch (error) {
      console.error('[ExerciseResolver] Erro detalhado:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro: ${errorMessage}`);
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

        {/* Alerta se a fórmula for inválida */}
        {!isFormulaValid && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro no Exercício</AlertTitle>
            <AlertDescription>
              Este exercício possui uma fórmula inválida ou não configurada. 
              Por favor, contate o administrador do sistema.
            </AlertDescription>
          </Alert>
        )}

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
                  <FormLabel className="flex items-center gap-2">
                    Número da chamada (Digite o valor que você atribuiu ao "n")
                    {isInputDisabled && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      disabled={isInputDisabled}
                      className={isInputDisabled ? 'bg-muted cursor-not-allowed' : ''}
                    />
                  </FormControl>
                  {isInputDisabled && (
                    <FormDescription className="text-xs text-muted-foreground">
                      No modo CASA, o valor de "n" é fixado como seu número de chamada.
                    </FormDescription>
                  )}
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>

            {result && (
              <div className={`p-4 rounded-lg text-center font-medium ${getResultClassName(result.acertoNivel)}`}>
                {result.mensagem}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
