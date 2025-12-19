import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExerciseResolver } from '@/components/exercises/ExerciseResolver';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ExercisePractice = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();

  const { data: exercise, isLoading, error } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      if (!exerciseId) throw new Error('ID do exercício não fornecido');

      const { data, error } = await supabase
        .from('exercicios')
        .select(`
          id,
          formula,
          margem_erro,
          ordem,
          imagem_url,
          subcategoria:subcategorias(
            id,
            nome,
            categoria:categorias(
              id,
              nome
            )
          )
        `)
        .eq('id', exerciseId)
        .eq('ativo', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!exerciseId
  });

  if (isLoading) {
    return (
      <AppLayout title="Resolver Exercício">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !exercise) {
    return (
      <AppLayout title="Resolver Exercício">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Exercício não encontrado ou indisponível.
              </p>
              <Button 
                className="mt-4 w-full" 
                variant="outline"
                onClick={() => navigate('/exercicios')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Lista de Exercícios
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const subcategoria = exercise.subcategoria;
  const categoria = subcategoria?.categoria;

  return (
    <AppLayout title="Resolver Exercício">
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/exercicios')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Lista
        </Button>

        <ExerciseResolver
          exerciseId={exercise.id}
          category={categoria?.nome || 'Sem categoria'}
          subcategory={subcategoria?.nome || 'Sem subcategoria'}
          order={exercise.ordem || 1}
          formula={exercise.formula || ''}
          marginError={exercise.margem_erro || 0}
          imageUrl={exercise.imagem_url || undefined}
          atividadeId={undefined}
        />
      </div>
    </AppLayout>
  );
};

export default ExercisePractice;
