import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const leadFormSchema = z.object({
  nome: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  escolaOuRede: z.string().optional(),
  termos: z.boolean().refine(val => val === true, 'Aceite os termos de uso'),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const LeadForm: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [escolaOuRede, setEscolaOuRede] = useState('');
  const [termos, setTermos] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const result = leadFormSchema.safeParse({ nome, email, escolaOuRede, termos });
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LeadFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LeadFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('[LeadForm]', 'validation-failed', { errors });
      return;
    }

    setStatus('submitting');
    console.log('[LeadForm]', 'submit', { nome, email, escolaOuRede });

    try {
      // TODO: integrar com Supabase (tabela leads) na próxima fase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      console.log('[LeadForm]', 'success');
      
      toast({
        title: "Solicitação enviada!",
        description: "Em breve um representante entrará em contato.",
      });
      
      // Reset form
      setNome('');
      setEmail('');
      setEscolaOuRede('');
      setTermos(false);
      
      // Reset status after a moment
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      console.log('[LeadForm]', 'error', error);
      
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um problema ao enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
      
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div>
        <Input 
          type="text" 
          placeholder="Nome" 
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={status === 'submitting'}
          className={`w-full px-4 py-2 rounded border-none bg-white ${errors.nome ? 'ring-2 ring-red-400' : ''}`}
        />
        {errors.nome && <p className="text-red-600 text-xs mt-1">{errors.nome}</p>}
      </div>
      
      <div>
        <Input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          className={`w-full px-4 py-2 rounded border-none bg-white ${errors.email ? 'ring-2 ring-red-400' : ''}`}
        />
        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
      </div>
      
      <div>
        <Input 
          type="text" 
          placeholder="Escola ou Rede de Ensino (opcional)" 
          value={escolaOuRede}
          onChange={(e) => setEscolaOuRede(e.target.value)}
          disabled={status === 'submitting'}
          className="w-full px-4 py-2 rounded border-none bg-white"
        />
      </div>
      
      <div className="flex items-center justify-center space-x-2">
        <Checkbox 
          id="terms" 
          checked={termos}
          onCheckedChange={(checked) => setTermos(checked as boolean)}
          disabled={status === 'submitting'}
          className="border-totalBlue data-[state=checked]:bg-totalBlue data-[state=checked]:text-white"
        />
        <label htmlFor="terms" className="text-sm text-totalBlue cursor-pointer">
          Aceito os termos de uso
        </label>
      </div>
      {errors.termos && <p className="text-red-600 text-xs text-center">{errors.termos}</p>}
      
      <Button 
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-totalBlue text-white font-semibold py-2 px-8 rounded hover:bg-blue-900 transition-colors"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : status === 'success' ? (
          'Enviado!'
        ) : (
          'Vamos conversar!'
        )}
      </Button>
    </form>
  );
};

export default LeadForm;
