import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="inline-block">
      <img 
        src="/lovable-uploads/logo.png" 
        alt="Total Matemática" 
        className="h-10 md:h-12" 
      />
    </Link>
  );
};

export default Logo;
