import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { EscolaFormData } from '@/schemas/escolaSchema';

interface InscriptionsSectionProps {
  form: UseFormReturn<EscolaFormData>;
}

export function InscriptionsSection({ form }: InscriptionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscrições</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="inscricao_municipal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Municipal</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite a inscrição municipal" 
                        {...field}
                        disabled={form.watch('isento_municipal')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isento_municipal"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 pb-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Isento
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="inscricao_estadual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inscrição Estadual</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite a inscrição estadual" 
                        {...field}
                        disabled={form.watch('isento_estadual')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isento_estadual"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 pb-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    Isento
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}