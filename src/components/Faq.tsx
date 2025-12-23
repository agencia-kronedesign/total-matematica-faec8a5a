import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "Quanto tempo leva para começar a usar o Total Matemática na escola?",
    answer: "A implantação é rápida. Após a apresentação inicial, configuramos o portal em poucos dias e oferecemos formação para os professores, permitindo início imediato das atividades."
  },
  {
    question: "O que a equipe pedagógica precisa fazer para implantar o método?",
    answer: "A equipe gestora define as turmas participantes e acompanha os relatórios. Os professores recebem formação completa e suporte contínuo. Não é necessário conhecimento técnico avançado."
  },
  {
    question: "Como os relatórios ajudam a reduzir reprovação em matemática?",
    answer: "Os relatórios identificam rapidamente alunos com dificuldades, permitindo intervenção precoce. Acompanhamos a evolução individual e por turma, facilitando decisões pedagógicas baseadas em dados."
  },
  {
    question: "É possível começar com um projeto piloto ou poucas turmas?",
    answer: "Sim! Recomendamos iniciar com algumas turmas para validar o método na realidade da sua escola. Após os primeiros resultados, a expansão é simples e escalável."
  }
];

const Faq: React.FC = () => {
  return (
    <section id="faq" className="py-10 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="section-heading text-center mb-8">Vamos conversar!</h2>
        <h3 className="text-center mb-6 text-gray-600">Tire suas dúvidas</h3>
        
        <Accordion type="single" collapsible className="max-w-2xl mx-auto">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium text-totalBlue">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {/* Mini-CTA ao final do FAQ */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-3">
            Ainda ficou alguma dúvida? Peça uma conversa rápida com nossa equipe.
          </p>
          <button 
            onClick={() => {
              const element = document.getElementById('contato-escola');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-totalBlue font-semibold hover:underline transition-colors"
          >
            Quero tirar dúvidas →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Faq;
