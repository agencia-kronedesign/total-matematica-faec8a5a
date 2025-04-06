
import React from 'react';
import VideoButton from '@/components/VideoButton';

interface HeroProps {
  onMethodVideoOpen: () => void;
  onPracticeVideoOpen: () => void;
}

const Hero: React.FC<HeroProps> = ({ onMethodVideoOpen, onPracticeVideoOpen }) => {
  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      {/* Hero Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ 
          backgroundImage: `url(/lovable-uploads/ee4569cd-b8c1-4090-8a0c-41b1306c0199.png)`,
          filter: 'brightness(0.7)' // Add slight darkening to improve text readability
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
            <VideoButton title="Método" onClick={onMethodVideoOpen} />
            <VideoButton title="Na prática" onClick={onPracticeVideoOpen} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
