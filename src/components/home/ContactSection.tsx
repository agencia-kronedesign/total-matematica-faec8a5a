
import React from 'react';
import ContactForm from '@/components/ContactForm';

const ContactSection: React.FC = () => {
  return (
    <section className="py-12 px-4 bg-totalBlue">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Fale Conosco / Sugestões
        </h2>
        <ContactForm />
      </div>
    </section>
  );
};

export default ContactSection;
