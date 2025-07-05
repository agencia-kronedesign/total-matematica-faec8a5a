import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useEscolas } from '@/hooks/useEscolas';
import { useCidades } from '@/hooks/useCidades';
import { escolaSchema, type EscolaFormData } from '@/schemas/escolaSchema';

interface UseEscolaFormProps {
  escola?: any;
  onClose: () => void;
}

export function useEscolaForm({ escola, onClose }: UseEscolaFormProps) {
  const { toast } = useToast();
  const { createEscola, updateEscola } = useEscolas();
  const [loading, setLoading] = useState(false);
  const [observacoesCount, setObservacoesCount] = useState(0);

  const form = useForm<EscolaFormData>({
    resolver: zodResolver(escolaSchema),
    defaultValues: {
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      inscricao_municipal: '',
      inscricao_estadual: '',
      isento_municipal: false,
      isento_estadual: false,
      cep: '',
      telefone: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      observacoes: '',
      status: true,
    },
  });

  const selectedEstado = form.watch('estado');
  const { data: cidadesDisponiveis = [], isLoading: isLoadingCidades } = useCidades(selectedEstado);

  // Load existing data when editing
  useEffect(() => {
    if (escola) {
      form.reset({
        razao_social: escola.razao_social || '',
        nome_fantasia: escola.nome_fantasia || '',
        cnpj: escola.cnpj || '',
        inscricao_municipal: escola.inscricao_municipal || '',
        inscricao_estadual: escola.inscricao_estadual || '',
        isento_municipal: escola.isento_municipal || false,
        isento_estadual: escola.isento_estadual || false,
        cep: escola.cep || '',
        telefone: escola.telefone || '',
        email: escola.email || '',
        endereco: escola.endereco || '',
        cidade: escola.cidade || '',
        estado: escola.estado || '',
        observacoes: escola.observacoes || '',
        status: escola.status ?? true,
      });
      setObservacoesCount(escola.observacoes?.length || 0);
    }
  }, [escola, form]);

  // Watch observacoes field for character count
  const observacoes = form.watch('observacoes');
  useEffect(() => {
    setObservacoesCount(observacoes?.length || 0);
  }, [observacoes]);

  // Format CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  const onSubmit = async (data: EscolaFormData) => {
    try {
      setLoading(true);
      
      if (escola) {
        await updateEscola(escola.id, data);
        toast({
          title: "Escola atualizada",
          description: "A escola foi atualizada com sucesso.",
        });
      } else {
        await createEscola(data);
        toast({
          title: "Escola cadastrada",
          description: "A escola foi cadastrada com sucesso.",
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a escola. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    observacoesCount,
    selectedEstado,
    cidadesDisponiveis,
    isLoadingCidades,
    formatCEP,
    onSubmit,
  };
}