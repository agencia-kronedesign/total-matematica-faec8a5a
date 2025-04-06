
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VideoModal from '@/components/VideoModal';
import Hero from '@/components/home/Hero';
import Benefits from '@/components/home/Benefits';
import Testimonials from '@/components/home/Testimonials';
import VideoConferenceRequest from '@/components/home/VideoConferenceRequest';
import Faq from '@/components/Faq';
import ContactSection from '@/components/home/ContactSection';
import RegistrationCTA from '@/components/home/RegistrationCTA';

const Index = () => {
  const [isMethodVideoOpen, setIsMethodVideoOpen] = useState(false);
  const [isPracticeVideoOpen, setIsPracticeVideoOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <Hero 
        onMethodVideoOpen={() => setIsMethodVideoOpen(true)}
        onPracticeVideoOpen={() => setIsPracticeVideoOpen(true)}
      />
      
      <Benefits />
      
      <Testimonials />
      
      <VideoConferenceRequest />
      
      <Faq />
      
      <ContactSection />
      
      <RegistrationCTA />
      
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
