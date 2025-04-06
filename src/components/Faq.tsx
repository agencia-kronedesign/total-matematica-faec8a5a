
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
    question: "Qual a base/pilar Científica do Método?",
    answer: "O método Total Matemática é baseado em pesquisas cognitivas e pedagógicas modernas, combinando técnicas de aprendizado ativo com tecnologia educacional para maximizar a compreensão matemática."
  },
  {
    question: "Como utilizar no dia a dia da escola?",
    answer: "O Total Matemática pode ser integrado ao currículo regular como complemento às aulas, utilizado em laboratórios de matemática, ou como reforço para estudantes com dificuldades específicas."
  },
  {
    question: "Qual a formação da equipe técnica?",
    answer: "Nossa equipe é formada por educadores especializados em matemática, pesquisadores em pedagogia, desenvolvedores de software educacional e especialistas em design instrucional."
  },
  {
    question: "Como funciona a integração com o currículo escolar?",
    answer: "O método é adaptável aos diferentes currículos, com atividades alinhadas à BNCC e outros padrões curriculares, permitindo personalização conforme as necessidades específicas de cada instituição."
  }
];

const Faq: React.FC = () => {
  return (
    <section className="py-10 px-4 bg-gray-50">
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
        
        <div className="text-center mt-6">
          <button className="text-sm text-totalBlue hover:underline">
            Veja mais questões!
          </button>
        </div>
      </div>
    </section>
  );
};

export default Faq;
