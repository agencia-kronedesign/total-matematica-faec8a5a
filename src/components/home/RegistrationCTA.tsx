
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const RegistrationCTA: React.FC = () => {
  return (
    <section className="py-10 px-4 bg-totalYellow text-center">
      <div className="container mx-auto">
        <Link to="/cadastrar">
          <Button className="bg-totalBlue text-white font-bold py-3 px-10 rounded-full text-lg hover:bg-blue-900 transition-colors">
            Cadastrar
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default RegistrationCTA;
