
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BenefitCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="w-16 h-16 bg-totalBlue rounded-full flex items-center justify-center mb-3">
        <Icon size={28} className="text-white" />
      </div>
      <h3 className="text-lg font-semibold text-totalBlue mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default BenefitCard;
