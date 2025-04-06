
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="inline-block">
      <h1 className="text-xl md:text-2xl font-bold text-totalBlue">
        <span className="text-totalYellow">T</span>
        <span>O</span>
        <span className="text-totalYellow">T</span>
        <span>AL</span>
      </h1>
    </Link>
  );
};

export default Logo;
