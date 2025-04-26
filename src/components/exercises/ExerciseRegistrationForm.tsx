
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Save, Upload, Loader, ImageIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCategoriesAndSubcategories } from '@/hooks/useCategoriesAndSubcategories';
import ImageUploadPreview from './ImageUploadPreview';

// Validation schema for the exercise form
const formSchema = z.object({
  subcategoria_id: z.string({ required_error: "Selecione uma subcategoria" }),
  ordem: z.coerce.number().int().min(1, { message: "A ordem deve ser um número inteiro positivo" }),
  formula: z.string().min(1, { message: "A fórmula é obrigatória" }),
  margem_erro: z.coerce.number().min(0, { message: "A margem de erro deve ser um número positivo" }),
});

type FormValues = z.infer<typeof formSchema>;

const ExerciseRegistrationForm = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { categories, subcategories, isLoading } = useCategoriesAndSubcategories();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ordem: 1,
      formula: '',
      margem_erro: 0.1,
    },
  });

  // Filter subcategories based on the selected category
  const filteredSubcategories = subcategories.filter(
    (subcategory) => subcategory.categoria_id === selectedCategory
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem não deve exceder 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('O arquivo deve ser uma imagem');
      return;
    }

    setImageFile(file);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsUploading(true);

      // First insert the exercise data
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

      // If there's an image, upload it
      if (imageFile && exerciseData?.id) {
        // Create a storage path for the image
        const filePath = `exercises/${exerciseData.id}/${imageFile.name}`;
        
        // Upload the image
        const { error: uploadError } = await supabase
          .storage
          .from('exercise-images')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        }

        // Get the public URL for the image
        const { data: urlData } = supabase
          .storage
          .from('exercise-images')
          .getPublicUrl(filePath);

        // Update the exercise with the image URL
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

      // Success notification
      toast.success('Exercício cadastrado com sucesso!');
      
      // Reset the form
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setSelectedCategory(null);
      
      // Invalidate queries to refresh data
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Category selection */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    value={selectedCategory || ""}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      // Clear the subcategory when category changes
                      form.setValue('subcategoria_id', '');
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory selection */}
                <FormField
                  control={form.control}
                  name="subcategoria_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoria</FormLabel>
                      <Select
                        disabled={!selectedCategory}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione uma subcategoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredSubcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={subcategory.id}>
                              {subcategory.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Order and Margin of error */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ordem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="margem_erro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Margem de Erro
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="ml-2">
                            <span className="text-xs bg-slate-200 rounded-full h-5 w-5 inline-flex items-center justify-center">?</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Valor entre 0 e 1 que representa a margem de erro aceita.
                              Ex: 0.1 aceita respostas dentro de 10% do valor correto.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Formula */}
            <FormField
              control={form.control}
              name="formula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    Fórmula
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="ml-2">
                          <span className="text-xs bg-slate-200 rounded-full h-5 w-5 inline-flex items-center justify-center">?</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Expressão matemática que será calculada. Use 'n' como variável.
                            Exemplo: "2*n + 5" ou "Math.pow(n, 2)"
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image upload */}
            <div className="space-y-2">
              <FormLabel>Imagem do Exercício</FormLabel>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors">
                      <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Clique para selecionar uma imagem</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (máx. 5MB)</span>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {imagePreview && (
                  <ImageUploadPreview
                    imagePreview={imagePreview}
                    onRemove={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Submit button */}
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
