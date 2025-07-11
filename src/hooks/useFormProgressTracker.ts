import { useState, useEffect } from 'react';

interface ProgressStep {
  name: string;
  completed: boolean;
  hasErrors: boolean;
}

export const useFormProgressTracker = (
  steps: string[],
  currentStep: string,
  formErrors: Record<string, any>
) => {
  const [progress, setProgress] = useState<ProgressStep[]>([]);

  useEffect(() => {
    const updatedProgress = steps.map((step, index) => {
      const currentIndex = steps.indexOf(currentStep);
      const isCompleted = index < currentIndex;
      const hasErrors = Object.keys(formErrors).some(errorField => {
        // Mapear campos para as suas respectivas seções
        const fieldStepMap: Record<string, string> = {
          nome: 'dados-pessoais',
          email: 'dados-pessoais',
          telefone_mobile: 'dados-pessoais',
          telefone_fixo: 'dados-pessoais',
          cpf: 'dados-pessoais',
          rg: 'dados-pessoais',
          data_nascimento: 'dados-pessoais',
          cargo: 'dados-pessoais',
          numero_matricula: 'dados-pessoais',
          numero_chamada: 'dados-pessoais',
          turma: 'dados-pessoais',
          nome_responsavel: 'dados-pessoais',
          email_responsavel: 'dados-pessoais',
          nome_responsavel2: 'dados-pessoais',
          email_responsavel2: 'dados-pessoais',
          tipo_usuario: 'acesso',
          ativo: 'acesso',
          permissao_relatorios: 'acesso',
          senha: 'acesso',
          confirmarSenha: 'acesso',
          endereco: 'endereco',
          cidade: 'endereco',
          estado: 'endereco',
          cep: 'endereco',
          notificacao_email: 'preferencias',
          notificacao_site: 'preferencias',
          notificacao_push: 'preferencias',
          aceite_notificacoes: 'preferencias',
          termos_uso: 'consentimento',
          politica_privacidade: 'consentimento',
          captcha: 'consentimento'
        };
        
        return fieldStepMap[errorField] === step;
      });

      return {
        name: step,
        completed: isCompleted,
        hasErrors: hasErrors && step !== currentStep
      };
    });

    setProgress(updatedProgress);
  }, [steps, currentStep, formErrors]);

  const getStepStatus = (stepName: string): 'completed' | 'current' | 'error' | 'pending' => {
    const step = progress.find(s => s.name === stepName);
    if (!step) return 'pending';
    
    if (step.name === currentStep) return 'current';
    if (step.hasErrors) return 'error';
    if (step.completed) return 'completed';
    return 'pending';
  };

  const completedSteps = progress.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return {
    progress,
    getStepStatus,
    progressPercentage,
    completedSteps,
    totalSteps
  };
};