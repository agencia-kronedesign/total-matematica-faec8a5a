
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import ExerciseRegistrationForm from '@/components/exercises/ExerciseRegistrationForm';

const ExerciseForm = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-gray-50">
          <DashboardSidebar />
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold text-totalBlue mb-6">Cadastro de Exercícios</h1>
              <ExerciseRegistrationForm />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default ExerciseForm;
