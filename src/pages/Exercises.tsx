import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ExerciseList from '@/components/exercises/ExerciseList';
import ExerciseFilters from '@/components/exercises/ExerciseFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Plus, ListFilter } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';

const Exercises = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  return (
    <ProtectedRoute>
      <AppLayout title="Exercícios">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-totalBlue">Exercícios</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/exercicios/cadastrar?tab=lista-categorias" className="flex items-center">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Gerenciar Categorias
                </Link>
              </Button>
              <Button asChild variant="default">
                <Link to="/exercicios/cadastrar" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Exercício
                </Link>
              </Button>
            </div>
          </div>
          
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
      </AppLayout>
    </ProtectedRoute>
  );
};

export default Exercises;
