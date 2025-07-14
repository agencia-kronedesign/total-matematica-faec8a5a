import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Book, Users, Clock, FileText, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AtividadeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  atividade?: any;
}

const AtividadeDetailDialog: React.FC<AtividadeDetailDialogProps> = ({ 
  open, 
  onOpenChange, 
  atividade 
}) => {
  if (!atividade) return null;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'ativa': return 'default';
      case 'finalizada': return 'secondary';
      case 'cancelada': return 'destructive';
      default: return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'casa' ? 'blue' : 'purple';
  };

  const isVencida = atividade.data_limite && new Date(atividade.data_limite) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Book className="h-6 w-6" />
            {atividade.titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalhes da Atividade
                </span>
                <div className="flex gap-2">
                  <Badge variant={getStatusColor(atividade.status)}>
                    {atividade.status || 'ativa'}
                  </Badge>
                  <Badge variant="outline" className={`text-${getTipoColor(atividade.tipo)}-600`}>
                    {atividade.tipo === 'casa' ? 'Para Casa' : 'Em Aula'}
                  </Badge>
                  {isVencida && (
                    <Badge variant="destructive">Vencida</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {atividade.descricao && (
                <div>
                  <h4 className="font-medium mb-2">Descrição:</h4>
                  <p className="text-muted-foreground">{atividade.descricao}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Turma</p>
                    <p className="text-sm text-muted-foreground">
                      {atividade.turma?.nome} - {atividade.turma?.ano_letivo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Data de Criação</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(atividade.data_envio), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {atividade.data_limite && (
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${isVencida ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm font-medium">Data Limite</p>
                      <p className={`text-sm ${isVencida ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {format(new Date(atividade.data_limite), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {atividade.professor && (
                <div>
                  <h4 className="font-medium mb-2">Professor:</h4>
                  <p className="text-sm text-muted-foreground">
                    {atividade.professor.nome} ({atividade.professor.email})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Exercícios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Exercícios ({atividade.exercicios?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {atividade.exercicios && atividade.exercicios.length > 0 ? (
                <div className="space-y-4">
                  {atividade.exercicios.map((item: any, index: number) => {
                    const exercicio = item.exercicio;
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="font-mono">
                              #{index + 1}
                            </Badge>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {exercicio.subcategoria && (
                                <Badge variant="secondary" className="text-xs">
                                  {exercicio.subcategoria.categoria?.nome}
                                </Badge>
                              )}
                              {exercicio.subcategoria && (
                                <Badge variant="outline" className="text-xs">
                                  {exercicio.subcategoria.nome}
                                </Badge>
                              )}
                              {exercicio.imagem_url && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  Com Imagem
                                </Badge>
                              )}
                            </div>
                            
                            <div className="bg-muted/50 p-3 rounded font-mono text-sm">
                              {exercicio.formula}
                            </div>

                            {exercicio.imagem_url && (
                              <div className="border rounded-lg p-2">
                                <img 
                                  src={exercicio.imagem_url} 
                                  alt="Imagem do exercício"
                                  className="max-w-full h-auto rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum exercício associado a esta atividade.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas (placeholder para futuras implementações) */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Alunos Participantes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Respostas Enviadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AtividadeDetailDialog;