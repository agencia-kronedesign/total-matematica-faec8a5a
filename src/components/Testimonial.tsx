
import React from 'react';

interface TestimonialProps {
  image: string;
  name: string;
  role: string;
  quote: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ image, name, role, quote }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
      <img 
        src={image} 
        alt={name} 
        className="w-20 h-20 rounded-full object-cover mb-4" 
      />
      <p className="text-gray-600 italic mb-4">"{quote}"</p>
      <h4 className="font-semibold text-totalBlue">{name}</h4>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  );
};

export default Testimonial;
