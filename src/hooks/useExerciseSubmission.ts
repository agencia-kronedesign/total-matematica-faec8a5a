import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type AcertoNivel } from '@/domain/exercises';

export interface ExerciseSubmissionData {
  exerciseId: string;
  atividadeId?: string;
  numeroN: number;
  respostaDigitada: string;
  resultadoCalculado: number;
  margemAplicada: number;
  acertoNivel: AcertoNivel;
}

export function useExerciseSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitExercise = async (data: ExerciseSubmissionData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('[useExerciseSubmission] Salvando resposta:', {
        exerciseId: data.exerciseId,
        atividadeId: data.atividadeId,
        acertoNivel: data.acertoNivel
      });

      const { error: insertError } = await supabase
        .from('respostas')
        .insert({
          exercicio_id: data.exerciseId,
          atividade_id: data.atividadeId,
          aluno_id: user.id,
          numero_n: data.numeroN,
          resposta_digitada: data.respostaDigitada,
          resultado_calculado: data.resultadoCalculado,
          margem_aplicada: data.margemAplicada,
          acerto_nivel: data.acertoNivel,
          data_envio: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      console.log('[useExerciseSubmission] Resposta salva com sucesso');

      return { success: true, acertoNivel: data.acertoNivel };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useExerciseSubmission] Erro:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitExercise,
    isSubmitting,
    error
  };
}
