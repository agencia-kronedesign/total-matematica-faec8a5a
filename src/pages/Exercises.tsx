
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ExerciseList from '@/components/exercises/ExerciseList';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';

const Exercises = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-gray-50">
          <DashboardSidebar />
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold text-totalBlue mb-6">Exercícios</h1>
              
              <Tabs defaultValue="todos" className="mb-8">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="todos">Todos os Exercícios</TabsTrigger>
                  <TabsTrigger value="pendentes">Exercícios Pendentes</TabsTrigger>
                  <TabsTrigger value="concluidos">Exercícios Concluídos</TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <ExerciseFilters 
                    onCategoryChange={setSelectedCategory}
                    onDifficultyChange={setSelectedDifficulty}
                  />
                </div>
                
                <TabsContent value="todos" className="mt-6">
                  <ExerciseList 
                    filter="todos"
                    selectedCategory={selectedCategory}
                    selectedDifficulty={selectedDifficulty}
                  />
                </TabsContent>
                
                <TabsContent value="pendentes" className="mt-6">
                  <ExerciseList 
                    filter="pendentes"
                    selectedCategory={selectedCategory}
                    selectedDifficulty={selectedDifficulty}
                  />
                </TabsContent>
                
                <TabsContent value="concluidos" className="mt-6">
                  <ExerciseList 
                    filter="concluidos"
                    selectedCategory={selectedCategory}
                    selectedDifficulty={selectedDifficulty}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Exercises;
