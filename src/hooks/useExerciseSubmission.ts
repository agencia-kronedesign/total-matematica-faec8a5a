import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AcertoNivelType = Database['public']['Enums']['acerto_nivel_type'];

export interface ExerciseSubmissionData {
  exerciseId: string;
  atividadeId?: string;
  numeroN: number;
  respostaDigitada: string;
  resultadoCalculado: number;
  margemAplicada: number;
  resultMessage: string;
}

export function useExerciseSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapResultToAcertoNivel = (resultMessage: string): AcertoNivelType => {
    if (resultMessage.includes('100% CORRETO')) {
      return 'correto';
    } else if (resultMessage.includes('PARABÉNS! VOCÊ ACERTOU!')) {
      return 'correto_com_margem';
    } else if (resultMessage.includes('MEIO CERTO')) {
      return 'meio_certo';
    } else {
      return 'incorreto';
    }
  };

  const submitExercise = async (data: ExerciseSubmissionData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const acertoNivel = mapResultToAcertoNivel(data.resultMessage);

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
          acerto_nivel: acertoNivel,
          data_envio: new Date().toISOString()
        });

      if (insertError) {
        throw insertError;
      }

      return { success: true, acertoNivel };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
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