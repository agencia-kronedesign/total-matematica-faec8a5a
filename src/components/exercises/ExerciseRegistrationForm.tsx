
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Loader } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCategoriesAndSubcategories } from '@/hooks/useCategoriesAndSubcategories';
import CategorySelection from './form/CategorySelection';
import SubcategoryField from './form/SubcategoryField';
import ImageUpload from './form/ImageUpload';
import NumericFields from './form/NumericFields';
import FormulaField from './form/FormulaField';
import CategoryForm from './form/CategoryForm';
import SubcategoryForm from './form/SubcategoryForm';
import { exerciseFormSchema, type ExerciseFormValues } from './form/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ExerciseRegistrationForm = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { categories, subcategories, isLoading } = useCategoriesAndSubcategories();
  const queryClient = useQueryClient();

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      ordem: 1,
      formula: '',
      margem_erro: 0.1,
    },
  });

  const filteredSubcategories = subcategories.filter(
    (subcategory) => subcategory.categoria_id === selectedCategory
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem não deve exceder 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('O arquivo deve ser uma imagem');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ExerciseFormValues) => {
    try {
      setIsUploading(true);

      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercicios')
        .insert({
          subcategoria_id: data.subcategoria_id,
          ordem: data.ordem,
          formula: data.formula,
          margem_erro: data.margem_erro,
        })
        .select('id')
        .single();

      if (exerciseError) {
        throw new Error(`Erro ao salvar exercício: ${exerciseError.message}`);
      }

      if (imageFile && exerciseData?.id) {
        const filePath = `${exerciseData.id}/${imageFile.name}`;
        const { error: uploadError } = await supabase
          .storage
          .from('exercise-images')  // Use the correct bucket name
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        const { data: urlData } = supabase
          .storage
          .from('exercise-images')  // Use the correct bucket name
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase
          .from('exercicios')
          .update({
            imagem_url: urlData.publicUrl
          })
          .eq('id', exerciseData.id);

        if (updateError) {
          throw new Error(`Erro ao atualizar URL da imagem: ${updateError.message}`);
        }
      }

      toast.success('Exercício cadastrado com sucesso!');
      
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setSelectedCategory(null);
      
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar exercício');
      console.error('Erro ao cadastrar exercício:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-totalBlue" />
        <span className="ml-2">Carregando categorias...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="exercicio">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="exercicio">Exercício</TabsTrigger>
            <TabsTrigger value="categoria">Cadastrar Categoria</TabsTrigger>
            <TabsTrigger value="subcategoria">Cadastrar Subcategoria</TabsTrigger>
          </TabsList>
          
          <TabsContent value="exercicio">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CategorySelection 
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onCategoryChange={(value) => {
                        setSelectedCategory(value);
                        form.setValue('subcategoria_id', '');
                      }}
                    />
                    <SubcategoryField
                      form={form}
                      subcategories={filteredSubcategories}
                      disabled={!selectedCategory}
                    />
                  </div>
                </div>

                <NumericFields form={form} />
                <FormulaField form={form} />

                <ImageUpload
                  imagePreview={imagePreview}
                  onImageChange={handleImageChange}
                  onRemoveImage={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="flex items-center"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="animate-spin mr-2 h-4 w-4" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Exercício
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="categoria">
            <CategoryForm />
          </TabsContent>

          <TabsContent value="subcategoria">
            <SubcategoryForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExerciseRegistrationForm;
