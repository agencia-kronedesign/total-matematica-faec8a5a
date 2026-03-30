
import React, { useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useCategoriesAndSubcategories } from '@/hooks/useCategoriesAndSubcategories';
import CategorySelection from './form/CategorySelection';
import SubcategoryField from './form/SubcategoryField';
import NumericFields from './form/NumericFields';
import FormulaField from './form/FormulaField';
import ExerciseImageUpload from './form/components/ExerciseImageUpload';
import { useExerciseForm } from '@/hooks/useExerciseForm';
import { ExerciseFormValues } from './form/types';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseRegistrationFormProps {
  exerciseId?: string;
}

const ExerciseRegistrationForm = ({ exerciseId }: ExerciseRegistrationFormProps) => {
  const {
    form,
    selectedCategory,
    setSelectedCategory,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview,
    isUploading,
    setIsUploading,
    exerciseData,
    isLoadingExercise,
    updateMutation,
    queryClient,
  } = useExerciseForm(exerciseId);

  const { categories, subcategories, isLoading } = useCategoriesAndSubcategories();
  const filteredSubcategories = subcategories.filter(
    (subcategory) => subcategory.categoria_id === selectedCategory
  );

  useEffect(() => {
    if (exerciseData) {
      form.reset({
        subcategoria_id: exerciseData.subcategoria_id,
        ordem: exerciseData.ordem,
        formula: exerciseData.formula,
        margem_erro: exerciseData.margem_erro,
      });
      setSelectedCategory(exerciseData.subcategoria?.categoria?.id || null);
      if (exerciseData.imagem_url) {
        setImagePreview(exerciseData.imagem_url);
      }
    }
  }, [exerciseData, form]);

  const onSubmit = async (data: ExerciseFormValues) => {
    try {
      setIsUploading(true);

      if (exerciseId) {
        await updateMutation.mutateAsync(data);
      } else {
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
            .from('exercise-images')
            .upload(filePath, imageFile);

          if (uploadError) {
            throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
          }

          const { data: urlData } = supabase
            .storage
            .from('Exercise Images')
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
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao processar exercício');
      console.error('Erro ao processar exercício:', error);
    } finally {
      setIsUploading(false);
    }
  };

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

  if (isLoadingExercise) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-totalBlue" />
        <span className="ml-2">Carregando exercício...</span>
      </div>
    );
  }

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CategorySelection 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={(value) => {
                    setSelectedCategory(value);
                    form.resetField('subcategoria_id');
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

            <ExerciseImageUpload
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
      </CardContent>
    </Card>
  );
};

export default ExerciseRegistrationForm;
