
import { useState, useEffect, useMemo } from 'react';

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

  // Estabilizar a dependência formErrors usando useMemo
  const stableFormErrors = useMemo(() => {
    return JSON.stringify(formErrors);
  }, [formErrors]);

  // Memoizar o mapeamento de campos para evitar recálculos
  const fieldStepMap = useMemo(() => ({
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
  }), []);

  useEffect(() => {
    const parsedFormErrors = JSON.parse(stableFormErrors);
    
    const updatedProgress = steps.map((step, index) => {
      const currentIndex = steps.indexOf(currentStep);
      const isCompleted = index < currentIndex;
      const hasErrors = Object.keys(parsedFormErrors).some(errorField => {
        return fieldStepMap[errorField as keyof typeof fieldStepMap] === step;
      });

      return {
        name: step,
        completed: isCompleted,
        hasErrors: hasErrors && step !== currentStep
      };
    });

    setProgress(updatedProgress);
  }, [steps, currentStep, stableFormErrors, fieldStepMap]);

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
