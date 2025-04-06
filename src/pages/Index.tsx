
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BenefitCard from '@/components/BenefitCard';
import Faq from '@/components/Faq';
import VideoButton from '@/components/VideoButton';
import VideoModal from '@/components/VideoModal';
import ContactForm from '@/components/ContactForm';
import Testimonial from '@/components/Testimonial';
import { Book, Users, Calendar, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isMethodVideoOpen, setIsMethodVideoOpen] = useState(false);
  const [isPracticeVideoOpen, setIsPracticeVideoOpen] = useState(false);

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

  const testimonials = [
    {
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
      name: "Maria Silva",
      role: "Professora de Matemática",
      quote: "O Total Matemática transformou minha sala de aula. Os alunos ficam mais engajados e entusiasmados!"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Full-width Hero Section with Background Image */}
      <section className="relative w-full h-[80vh] overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url(/lovable-uploads/banner.png)` 
          }}
        >
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-lg">
            <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white">
              Integrando alunos e professores <br />
              na solução de problemas!
            </h2>
            <h1 className="text-3xl md:text-5xl font-bold text-totalYellow mb-10">
              Matemática <br />
              Criativa
            </h1>
            <p className="text-lg mb-8 text-white">Veja como é fácil!</p>
            
            <div className="flex flex-wrap gap-4">
              <VideoButton title="Método" onClick={() => setIsMethodVideoOpen(true)} />
              <VideoButton title="Na prática" onClick={() => setIsPracticeVideoOpen(true)} />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
      
      {/* Testimonial Section */}
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
      
      {/* Video Conference Request Section */}
      <section className="py-12 px-4 bg-totalYellow">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold text-totalBlue mb-6">
            Solicite uma videoconferência ou visita de um representante!
          </h2>
          
          <form className="max-w-md mx-auto space-y-4">
            <input 
              type="text" 
              placeholder="Nome" 
              className="w-full px-4 py-2 rounded border-none" 
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full px-4 py-2 rounded border-none" 
            />
            <div className="flex items-center justify-center space-x-2">
              <input 
                id="terms" 
                type="checkbox" 
                className="rounded border-gray-300" 
              />
              <label htmlFor="terms" className="text-sm text-totalBlue">
                Aceito os termos de uso
              </label>
            </div>
            <button className="bg-totalBlue text-white font-semibold py-2 px-8 rounded hover:bg-blue-900 transition-colors">
              Vamos conversar!
            </button>
          </form>
        </div>
      </section>
      
      {/* FAQ Section */}
      <Faq />
      
      {/* Contact Section */}
      <section className="py-12 px-4 bg-totalBlue">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Fale Conosco / Sugestões
          </h2>
          <ContactForm />
        </div>
      </section>
      
      {/* Registration Button */}
      <section className="py-10 px-4 bg-totalYellow text-center">
        <div className="container mx-auto">
          <Link to="/cadastrar">
            <Button className="bg-totalBlue text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-blue-900 transition-colors">
              Cadastrar
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
      
      {/* Video Modals */}
      <VideoModal 
        isOpen={isMethodVideoOpen} 
        onClose={() => setIsMethodVideoOpen(false)} 
        title="Conheça nosso método" 
        videoId="dQw4w9WgXcQ" // Placeholder video ID
      />
      
      <VideoModal 
        isOpen={isPracticeVideoOpen} 
        onClose={() => setIsPracticeVideoOpen(false)} 
        title="Total Matemática na prática" 
        videoId="dQw4w9WgXcQ" // Placeholder video ID
      />
    </div>
  );
};

export default Index;
