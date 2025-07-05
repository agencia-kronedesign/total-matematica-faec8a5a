import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useEscolas } from '@/hooks/useEscolas';
import { escolaSchema, type EscolaFormData } from '@/schemas/escolaSchema';

interface EscolaFormProps {
  escola?: any;
  onClose: () => void;
}

export function EscolaForm({ escola, onClose }: EscolaFormProps) {
  const { toast } = useToast();
  const { createEscola, updateEscola } = useEscolas();
  const [loading, setLoading] = useState(false);
  const [observacoesCount, setObservacoesCount] = useState(0);

  // Brazilian states
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MG', 'MS', 'MT', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Cities by state (major cities for each state)
  const cidadesPorEstado: Record<string, string[]> = {
    'AC': ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá'],
    'AL': ['Maceió', 'Arapiraca', 'Palmeira dos Índios', 'Rio Largo'],
    'AP': ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque'],
    'AM': ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro', 'Ilhéus'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
    'DF': ['Brasília', 'Taguatinga', 'Ceilândia', 'Gama', 'Planaltina'],
    'ES': ['Vitória', 'Vila Velha', 'Cariacica', 'Serra', 'Cachoeiro de Itapemirim'],
    'GO': ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
    'MA': ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros'],
    'MS': ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã'],
    'MT': ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'],
    'PA': ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas'],
    'PB': ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
    'PI': ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano'],
    'RJ': ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Campos dos Goytacazes'],
    'RN': ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria', 'Gravataí'],
    'RO': ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'],
    'RR': ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma', 'Chapecó'],
    'SP': ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'Ribeirão Preto', 'Sorocaba'],
    'SE': ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana'],
    'TO': ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins']
  };

  const form = useForm<EscolaFormData>({
    resolver: zodResolver(escolaSchema),
    defaultValues: {
      razao_social: '',
      nome_fantasia: '',
      cnpj: '',
      inscricao_municipal: '',
      inscricao_estadual: '',
      isento_municipal: false,
      isento_estadual: false,
      cep: '',
      telefone: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      observacoes: '',
      status: true,
    },
  });

  const selectedEstado = form.watch('estado');
  const cidadesDisponiveis = selectedEstado ? cidadesPorEstado[selectedEstado] || [] : [];

  // Load existing data when editing
  useEffect(() => {
    if (escola) {
      form.reset({
        razao_social: escola.razao_social || '',
        nome_fantasia: escola.nome_fantasia || '',
        cnpj: escola.cnpj || '',
        inscricao_municipal: escola.inscricao_municipal || '',
        inscricao_estadual: escola.inscricao_estadual || '',
        isento_municipal: escola.isento_municipal || false,
        isento_estadual: escola.isento_estadual || false,
        cep: escola.cep || '',
        telefone: escola.telefone || '',
        email: escola.email || '',
        endereco: escola.endereco || '',
        cidade: escola.cidade || '',
        estado: escola.estado || '',
        observacoes: escola.observacoes || '',
        status: escola.status ?? true,
      });
      setObservacoesCount(escola.observacoes?.length || 0);
    }
  }, [escola, form]);

  // Watch observacoes field for character count
  const observacoes = form.watch('observacoes');
  useEffect(() => {
    setObservacoesCount(observacoes?.length || 0);
  }, [observacoes]);

  // Format CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  const onSubmit = async (data: EscolaFormData) => {
    try {
      setLoading(true);
      
      if (escola) {
        await updateEscola(escola.id, data);
        toast({
          title: "Escola atualizada",
          description: "A escola foi atualizada com sucesso.",
        });
      } else {
        await createEscola(data);
        toast({
          title: "Escola cadastrada",
          description: "A escola foi cadastrada com sucesso.",
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a escola. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
                        <Input placeholder="00.000.000/0000-00" {...field} />
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
                        <Input 
                          placeholder="00000-000" 
                          {...field}
                          onChange={(e) => {
                            const formatted = formatCEP(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

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
                        <Input placeholder="(00) 0000-0000" {...field} />
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
                        disabled={!selectedEstado}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={!selectedEstado ? "Primeiro selecione o Estado" : "Selecione a Cidade"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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