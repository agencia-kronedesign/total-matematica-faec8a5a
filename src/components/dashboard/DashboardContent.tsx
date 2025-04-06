
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeSection from './sections/WelcomeSection';
import NotificationsSection from './sections/NotificationsSection';
import DailyExerciseSection from './sections/DailyExerciseSection';
import ProgressSection from './sections/ProgressSection';
import MedalsSection from './sections/MedalsSection';

const DashboardContent = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.nome || 'Aluno';
  
  return (
    <div className="container mx-auto px-4 py-6">
      <WelcomeSection userName={userName} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <NotificationsSection />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        <div className="md:col-span-5">
          <DailyExerciseSection />
        </div>
        <div className="md:col-span-4">
          <ProgressSection />
        </div>
        <div className="md:col-span-3">
          <MedalsSection />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
