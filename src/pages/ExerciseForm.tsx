
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExerciseRegistrationForm from '@/components/exercises/ExerciseRegistrationForm';
import CategoryForm from '@/components/exercises/form/CategoryForm';
import CategoryList from '@/components/exercises/form/components/CategoryList';

const ExerciseForm = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-gray-50">
          <DashboardSidebar />
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold text-totalBlue mb-6">
                {location.pathname.includes('/editar') ? 'Editar Exercício' : 'Cadastro de Exercícios'}
              </h1>
              
              <Tabs defaultValue="exercicio" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="exercicio">Exercício</TabsTrigger>
                  <TabsTrigger value="categoria">Nova Categoria</TabsTrigger>
                  <TabsTrigger value="lista-categorias">Gerenciar Categorias</TabsTrigger>
                </TabsList>

                <TabsContent value="exercicio">
                  <ExerciseRegistrationForm />
                </TabsContent>

                <TabsContent value="categoria">
                  <CategoryForm />
                </TabsContent>

                <TabsContent value="lista-categorias">
                  <CategoryList />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default ExerciseForm;
