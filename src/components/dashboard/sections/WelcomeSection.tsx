
import React from 'react';

interface WelcomeSectionProps {
  userName: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-lg font-medium text-gray-700">
        Olá, <span className="font-semibold">{userName}</span>. Algumas novidades chegaram...
      </h1>
    </div>
  );
};

export default WelcomeSection;
