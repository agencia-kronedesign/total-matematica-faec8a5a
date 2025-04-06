
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BenefitCard from '@/components/BenefitCard';
import Faq from '@/components/Faq';
import VideoButton from '@/components/VideoButton';
import VideoModal from '@/components/VideoModal';
import ContactForm from '@/components/ContactForm';
import Testimonial from '@/components/Testimonial';
import { Book, Users, Calendar, Video, ChevronDown } from 'lucide-react';
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section - Full Width */}
      <section className="relative w-full">
        {/* Yellow header bar */}
        <div className="bg-totalYellow h-12"></div>
        
        {/* Main hero with background image */}
        <div className="relative h-[70vh] bg-totalBlue">
          <img 
            src="/lovable-uploads/fbf672bd-0589-43f6-9578-6a3226fb3d13.png" 
            alt="Criança com símbolos matemáticos" 
            className="w-full h-full object-cover object-center absolute inset-0 opacity-90 mix-blend-overlay"
          />
          
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10">
            <h2 className="text-xl md:text-2xl font-medium mb-2">
              Integrando alunos e professores <br />
              na solução de problemas!
            </h2>
            <h1 className="text-3xl md:text-5xl font-bold text-totalYellow mb-8">
              Matemática <br />
              Criativa
            </h1>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-lg md:text-xl mb-2">Criamos um método didático que</p>
            <h2 className="section-heading text-lg md:text-xl font-bold">
              auxilia professores e alunos a praticar<br />
              matemática de forma eficiente e inovadora!
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <BenefitCard 
                key={index}
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Video Preview Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-xl font-semibold text-totalBlue mb-8">
            Veja como é fácil!
            <div className="w-48 h-1 bg-totalYellow mx-auto mt-2"></div>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-10">
            <div className="relative cursor-pointer" onClick={() => setIsMethodVideoOpen(true)}>
              <img 
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1470&auto=format&fit=crop"
                alt="Método" 
                className="w-full h-48 object-cover rounded"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white py-2 text-totalBlue font-medium">
                Método
              </div>
            </div>
            <div className="relative cursor-pointer" onClick={() => setIsPracticeVideoOpen(true)}>
              <img 
                src="https://images.unsplash.com/photo-1560785496-3c9d27877182?q=80&w=1374&auto=format&fit=crop"
                alt="Na prática" 
                className="w-full h-48 object-cover rounded"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-white py-2 text-totalBlue font-medium">
                Na prática
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-16 px-4 bg-totalBlue text-white">
        <div className="container mx-auto text-center">
          <p className="text-sm uppercase tracking-wider mb-2">Confira</p>
          <h2 className="text-2xl font-bold mb-12">
            Alguns de nossos exercícios<br />
            para seus alunos!
          </h2>
          
          <div className="max-w-md mx-auto mb-16">
            <img 
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1470&auto=format&fit=crop"
              alt="Professora com material didático" 
              className="w-full rounded"
            />
          </div>
          
          <p className="text-sm text-totalYellow mb-2">Hora de praticar!</p>
          <h3 className="text-xl font-semibold mb-6">Faça um teste agora mesmo:</h3>
          
          <Link to="/teste">
            <Button className="bg-white text-totalBlue border border-white hover:bg-totalBlue hover:text-white transition-colors rounded-full py-2 px-8">
              Fazer um teste!
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Request Demo Section */}
      <section className="py-12 px-4 bg-gray-200">
        <div className="container mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Converse com a gente!
          </h2>
          <h3 className="text-2xl font-bold text-totalBlue mb-8">
            Solicite uma demonstração
          </h3>
          
          <form className="max-w-md mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Seu nome"
                className="w-full px-4 py-2 rounded border-none"
              />
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full px-4 py-2 rounded border-none"
              />
            </div>
            <button className="bg-totalBlue text-white font-semibold py-2 px-8 rounded w-full md:w-auto hover:bg-blue-900 transition-colors">
              Vamos conversar!
            </button>
          </form>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-xl font-semibold text-totalBlue mb-8">
            Tire suas dúvidas
            <div className="w-48 h-1 bg-totalYellow mx-auto mt-2"></div>
          </h2>
          
          <div className="max-w-2xl mx-auto mt-8">
            <div className="border-b border-gray-200 py-4">
              <div className="flex justify-between items-center cursor-pointer">
                <h3 className="font-medium text-left">Qual a formação da equipe técnica?</h3>
                <ChevronDown size={20} />
              </div>
            </div>
            <div className="border-b border-gray-200 py-4">
              <div className="flex justify-between items-center cursor-pointer">
                <h3 className="font-medium text-left">FAQ 1</h3>
                <ChevronDown size={20} />
              </div>
            </div>
            <div className="border-b border-gray-200 py-4">
              <div className="flex justify-between items-center cursor-pointer">
                <h3 className="font-medium text-left">FAQ 2</h3>
                <ChevronDown size={20} />
              </div>
            </div>
            
            <div className="text-center mt-8">
              <button className="text-sm text-totalBlue font-medium hover:underline">
                Veja mais questões!
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
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
