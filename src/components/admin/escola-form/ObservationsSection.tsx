import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { EscolaFormData } from '@/schemas/escolaSchema';

interface ObservationsSectionProps {
  form: UseFormReturn<EscolaFormData>;
  observacoesCount: number;
}

export function ObservationsSection({ form, observacoesCount }: ObservationsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Observações</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Digite observações adicionais (máximo 1000 caracteres)"
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <FormMessage />
                <span className={observacoesCount > 1000 ? 'text-destructive' : ''}>
                  {observacoesCount}/1000 caracteres
                </span>
              </div>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}