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

      console.log('[useExerciseSubmission] Iniciando envio de resposta:', {
        exerciseId: data.exerciseId,
        atividadeId: data.atividadeId,
        numeroN: data.numeroN,
        respostaDigitada: data.respostaDigitada,
        acertoNivel: data.acertoNivel,
        userId: user.id
      });

      // Se tiver atividade_id, verificar matrícula antes de submeter
      if (data.atividadeId) {
        console.log('[useExerciseSubmission] Verificando matrícula do aluno...');
        
        // Buscar a turma da atividade
        const { data: atividade, error: atividadeError } = await supabase
          .from('atividades')
          .select('turma_id')
          .eq('id', data.atividadeId)
          .maybeSingle();

        if (atividadeError) {
          console.error('[useExerciseSubmission] Erro ao buscar atividade:', atividadeError);
          throw new Error('Erro ao verificar atividade. Tente novamente.');
        }

        if (!atividade) {
          console.error('[useExerciseSubmission] Atividade não encontrada:', data.atividadeId);
          throw new Error('Atividade não encontrada.');
        }

        console.log('[useExerciseSubmission] Turma da atividade:', atividade.turma_id);

        // Verificar matrícula do aluno na turma
        const { data: matricula, error: matriculaError } = await supabase
          .from('matriculas')
          .select('id, status')
          .eq('usuario_id', user.id)
          .eq('turma_id', atividade.turma_id)
          .maybeSingle();

        if (matriculaError) {
          console.error('[useExerciseSubmission] Erro ao verificar matrícula:', matriculaError);
          throw new Error('Erro ao verificar matrícula. Tente novamente.');
        }

        console.log('[useExerciseSubmission] Matrícula encontrada:', matricula);

        if (!matricula) {
          throw new Error('Você não está matriculado na turma desta atividade.');
        }

        if (matricula.status !== 'ativo') {
          throw new Error(`Sua matrícula está com status "${matricula.status}". Contate o coordenador.`);
        }

        console.log('[useExerciseSubmission] Matrícula válida, prosseguindo com envio...');
      }

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
        console.error('[useExerciseSubmission] Erro do Supabase ao inserir resposta:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        
        // Mensagens específicas para tipos de erro conhecidos
        if (insertError.code === '42501') {
          throw new Error('Você não tem permissão para enviar respostas. Verifique se está matriculado na turma.');
        }
        
        if (insertError.code === '23503') {
          throw new Error('Dados inválidos. Verifique se o exercício e a atividade existem.');
        }
        
        if (insertError.code === '23505') {
          throw new Error('Você já respondeu este exercício.');
        }
        
        throw new Error(`Erro ao salvar resposta: ${insertError.message}`);
      }

      console.log('[useExerciseSubmission] Resposta salva com sucesso!');

      return { success: true, acertoNivel: data.acertoNivel };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useExerciseSubmission] Erro final:', errorMessage);
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
