import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const contactFormSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres').max(4000, 'Mensagem deve ter no máximo 4000 caracteres'),
  antiRobo: z.boolean().refine(val => val === true, 'Marque a verificação'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  origin: 'meio' | 'footer' | 'generic';
  title?: string;
  className?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const ContactForm: React.FC<ContactFormProps> = ({ origin, title, className = '' }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [antiRobo, setAntiRobo] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const result = contactFormSchema.safeParse({ nome, email, mensagem, antiRobo });
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactFormData;
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
      console.log('[ContactForm]', 'validation-failed', { origin, errors });
      return;
    }

    setStatus('submitting');
    console.log('[ContactForm]', 'submit', { origin, nome, email });

    try {
      // TODO: integrar com Supabase / endpoint real de contato
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      console.log('[ContactForm]', 'success');
      
      toast({
        title: "Mensagem enviada!",
        description: "Em breve entraremos em contato.",
      });
      
      // Reset form
      setNome('');
      setEmail('');
      setMensagem('');
      setAntiRobo(false);
      
      // Reset status after a moment
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      console.log('[ContactForm]', 'error', error);
      
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
      
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const isFooter = origin === 'footer';
  const inputBaseClasses = isFooter 
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/60" 
    : "bg-white/20 border-white/30 text-white placeholder:text-white/70";

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 max-w-md w-full mx-auto ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      
      <div>
        <Input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          disabled={status === 'submitting'}
          className={`${inputBaseClasses} ${errors.nome ? 'border-red-400' : ''}`}
        />
        {errors.nome && <p className="text-red-300 text-xs mt-1">{errors.nome}</p>}
      </div>
      
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'submitting'}
          className={`${inputBaseClasses} ${errors.email ? 'border-red-400' : ''}`}
        />
        {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
      </div>
      
      <div>
        <Textarea
          placeholder="Mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          disabled={status === 'submitting'}
          maxLength={4000}
          className={`min-h-[100px] ${inputBaseClasses} ${errors.mensagem ? 'border-red-400' : ''}`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.mensagem && <p className="text-red-300 text-xs">{errors.mensagem}</p>}
          <p className="text-right text-xs text-white/70 ml-auto">
            {mensagem.length}/4000
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`recaptcha-${origin}`}
          checked={antiRobo}
          onCheckedChange={(checked) => setAntiRobo(checked as boolean)}
          disabled={status === 'submitting'}
          className="border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-totalBlue"
        />
        <label
          htmlFor={`recaptcha-${origin}`}
          className="text-sm font-medium leading-none text-white cursor-pointer"
        >
          Não sou um robô
        </label>
      </div>
      {errors.antiRobo && <p className="text-red-300 text-xs">{errors.antiRobo}</p>}
      
      <Button 
        type="submit" 
        disabled={status === 'submitting'}
        className={isFooter 
          ? "w-full bg-totalYellow text-totalBlue hover:bg-totalYellow/90 font-semibold" 
          : "w-full btn-amarelo"
        }
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : status === 'success' ? (
          'Enviado!'
        ) : (
          'Enviar'
        )}
      </Button>
    </form>
  );
};

export default ContactForm;
