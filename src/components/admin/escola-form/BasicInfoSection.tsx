
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormattedInput } from '@/components/ui/formatted-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { EscolaFormData } from '@/schemas/escolaSchema';

interface BasicInfoSectionProps {
  form: UseFormReturn<EscolaFormData>;
  formatCEP: (value: string) => string;
}

export function BasicInfoSection({ form, formatCEP }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="razao_social"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Razão Social *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a razão social" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nome_fantasia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Fantasia *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome fantasia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <FormattedInput
                    formatter="cnpj"
                    placeholder="00.000.000/0000-00"
                    onValueChange={(unformatted, formatted) => {
                      field.onChange(unformatted);
                    }}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP *</FormLabel>
                <FormControl>
                  <FormattedInput
                    formatter="cep"
                    placeholder="00000-000"
                    onValueChange={(unformatted, formatted) => {
                      field.onChange(unformatted);
                    }}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
