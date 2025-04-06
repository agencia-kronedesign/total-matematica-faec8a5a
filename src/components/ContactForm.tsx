
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [recaptcha, setRecaptcha] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptcha) {
      toast({
        title: "Verificação necessária",
        description: "Por favor, marque a caixa de verificação anti-robô.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Mensagem enviada",
      description: "Agradecemos seu contato! Retornaremos em breve.",
    });
    
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    setRecaptcha(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full mx-auto">
      <div>
        <Input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="bg-opacity-20 bg-white border-white border placeholder-gray-400 text-white"
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-opacity-20 bg-white border-white border placeholder-gray-400 text-white"
        />
      </div>
      <div>
        <Textarea
          placeholder="Mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={4000}
          className="min-h-[100px] bg-opacity-20 bg-white border-white border placeholder-gray-400 text-white"
        />
        <p className="text-right text-xs text-white mt-1">
          {message.length}/4000 caracteres
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="recaptcha" 
          checked={recaptcha}
          onCheckedChange={(checked) => setRecaptcha(checked as boolean)}
        />
        <label
          htmlFor="recaptcha"
          className="text-sm font-medium leading-none text-white"
        >
          Não sou um robô
        </label>
      </div>
      <Button type="submit" className="w-full btn-amarelo">
        Enviar
      </Button>
    </form>
  );
};

export default ContactForm;
