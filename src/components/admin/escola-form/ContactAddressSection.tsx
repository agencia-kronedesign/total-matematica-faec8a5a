
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FormattedInput } from '@/components/ui/formatted-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { EscolaFormData } from '@/schemas/escolaSchema';

interface ContactAddressSectionProps {
  form: UseFormReturn<EscolaFormData>;
  selectedEstado: string;
  cidadesDisponiveis: string[];
  isLoadingCidades: boolean;
}

// Brazilian states
const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MG', 'MS', 'MT', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function ContactAddressSection({ 
  form, 
  selectedEstado, 
  cidadesDisponiveis, 
  isLoadingCidades 
}: ContactAddressSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contato e Endereço</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <FormattedInput
                    formatter="phone"
                    placeholder="(00) 00000-0000"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="escola@exemplo.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número, bairro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset cidade when estado changes
                    form.setValue('cidade', '');
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedEstado || isLoadingCidades}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !selectedEstado 
                            ? "Primeiro selecione o Estado" 
                            : isLoadingCidades 
                              ? "Carregando cidades..." 
                              : "Selecione a Cidade"
                        } 
                      />
                      {isLoadingCidades && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cidadesDisponiveis.length === 0 && !isLoadingCidades && selectedEstado && (
                      <SelectItem value="" disabled>
                        Nenhuma cidade disponível
                      </SelectItem>
                    )}
                    {cidadesDisponiveis.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>
                        {cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
