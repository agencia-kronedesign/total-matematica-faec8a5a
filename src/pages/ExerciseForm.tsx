
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Pencil, FolderPlus, ListPlus, List } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import ExerciseRegistrationForm from '@/components/exercises/ExerciseRegistrationForm';
import CategoryForm from '@/components/exercises/form/CategoryForm';
import SubcategoryForm from '@/components/exercises/form/SubcategoryForm';

const ExerciseForm = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-gray-50">
          <DashboardSidebar />
          <div className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-totalBlue">
                  {location.pathname.includes('/editar') ? 'Editar Exercício' : 'Cadastro de Exercícios'}
                </h1>
                <Button asChild variant="outline">
                  <Link to="/exercicios" className="flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Voltar para Lista
                  </Link>
                </Button>
              </div>
              
              <Tabs defaultValue={tab || "dados"} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dados" className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    Dados do Exercício
                  </TabsTrigger>
                  <TabsTrigger value="categoria" className="flex items-center gap-2">
                    <FolderPlus className="h-4 w-4" />
                    Nova Categoria
                  </TabsTrigger>
                  <TabsTrigger value="subcategoria" className="flex items-center gap-2">
                    <ListPlus className="h-4 w-4" />
                    Nova Subcategoria
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dados">
                  <ExerciseRegistrationForm />
                </TabsContent>

                <TabsContent value="categoria">
                  <CategoryForm />
                </TabsContent>

                <TabsContent value="subcategoria">
                  <SubcategoryForm />
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
