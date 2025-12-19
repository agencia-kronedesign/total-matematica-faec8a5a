import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Pencil, FolderPlus, ListPlus, List } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import ExerciseRegistrationForm from '@/components/exercises/ExerciseRegistrationForm';
import CategoryForm from '@/components/exercises/form/CategoryForm';
import SubcategoryForm from '@/components/exercises/form/SubcategoryForm';
import CategoryList from '@/components/exercises/form/components/CategoryList';
import AppLayout from '@/components/layout/AppLayout';

const ExerciseForm = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  return (
    <ProtectedRoute>
      <AppLayout title="Cadastro de Exercícios">
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
            <TabsList className="grid w-full grid-cols-4">
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
              <TabsTrigger value="lista-categorias" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Lista de Categorias
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

            <TabsContent value="lista-categorias">
              <CategoryList />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
};

export default ExerciseForm;
