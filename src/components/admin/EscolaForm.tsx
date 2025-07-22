
import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useEscolaForm } from '@/hooks/useEscolaForm';
import { BasicInfoSection } from './escola-form/BasicInfoSection';
import { InscriptionsSection } from './escola-form/InscriptionsSection';
import { ContactAddressSection } from './escola-form/ContactAddressSection';
import { ObservationsSection } from './escola-form/ObservationsSection';

interface EscolaFormProps {
  escola?: any;
  onClose: () => void;
}

export function EscolaForm({ escola, onClose }: EscolaFormProps) {
  const {
    form,
    loading,
    observacoesCount,
    selectedEstado,
    cidadesDisponiveis,
    isLoadingCidades,
    onSubmit,
  } = useEscolaForm({ escola, onClose });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {escola ? 'Editar Escola' : 'Nova Escola'}
          </h1>
          <p className="text-muted-foreground">
            {escola ? 'Atualize as informações da escola' : 'Cadastre uma nova escola no sistema'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <BasicInfoSection form={form} formatCEP={() => ''} />
          
          <InscriptionsSection form={form} />
          
          <ContactAddressSection 
            form={form}
            selectedEstado={selectedEstado}
            cidadesDisponiveis={cidadesDisponiveis}
            isLoadingCidades={isLoadingCidades}
          />
          
          <ObservationsSection 
            form={form}
            observacoesCount={observacoesCount}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {escola ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
