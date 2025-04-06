
import React from 'react';
import BenefitCard from '@/components/BenefitCard';
import { Book, Users, Calendar, Video } from 'lucide-react';

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: Book,
      title: "Sequência Didática",
      description: "Exercícios Claros"
    }, 
    {
      icon: Users,
      title: "Aprendizado Cooperativo",
      description: "Alunos se ajudam mutuamente"
    }, 
    {
      icon: Calendar,
      title: "Exercícios Diários",
      description: "Exercícios práticos"
    }, 
    {
      icon: Video,
      title: "Vídeo Aulas",
      description: "Aprenda quando quiser"
    }
  ];

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="section-heading">
            Criamos um método didático que auxilia professores e alunos a praticar matemática de forma eficiente e inovadora!
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => 
            <BenefitCard 
              key={index} 
              icon={benefit.icon} 
              title={benefit.title} 
              description={benefit.description} 
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
