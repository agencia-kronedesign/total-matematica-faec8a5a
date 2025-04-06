
import React from 'react';
import Testimonial from '@/components/Testimonial';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      name: "Maria Silva",
      role: "Professora de Matemática",
      quote: "O Total Matemática transformou minha sala de aula. Os alunos ficam mais engajados e entusiasmados!"
    }
  ];

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="section-heading text-center mb-8">
          Veja algumas possibilidades:
        </h2>
        
        <div className="grid md:grid-cols-1 gap-6 mb-12 max-w-3xl mx-auto">
          {testimonials.map((testimonial, index) => 
            <Testimonial 
              key={index} 
              image={testimonial.image} 
              name={testimonial.name} 
              role={testimonial.role} 
              quote={testimonial.quote} 
            />
          )}
        </div>
        
        <div className="text-center">
          <Link to="/signup">
            <Button className="btn-amarelo text-lg py-3 px-10">
              Faça você mesmo!
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
