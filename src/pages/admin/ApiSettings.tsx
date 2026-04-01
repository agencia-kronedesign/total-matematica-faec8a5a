import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, CheckCircle } from 'lucide-react';

const ApiSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Configurações de API
        </h1>
        <p className="text-muted-foreground text-sm">Configuração do gateway de IA</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Lovable AI Gateway
          </CardTitle>
          <CardDescription>
            O Playground AI utiliza o Lovable AI Gateway, que é provisionado automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Gateway ativo e configurado</span>
            <Badge variant="outline" className="text-green-600 border-green-300">Online</Badge>
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold">Modelos disponíveis:</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { name: 'Gemini Flash', desc: 'Rápido e eficiente', tag: 'Padrão' },
                { name: 'Gemini 2.5 Flash', desc: 'Balanceado custo/qualidade', tag: '' },
                { name: 'Gemini 2.5 Pro', desc: 'Máxima qualidade', tag: 'Premium' },
              ].map(m => (
                <div key={m.name} className="border rounded p-3 bg-background">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{m.name}</span>
                    {m.tag && <Badge variant="secondary" className="text-[10px]">{m.tag}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Informações:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Chave API gerenciada automaticamente pelo Lovable</li>
              <li>• Todas as chamadas são feitas via Edge Function (seguro)</li>
              <li>• Histórico de conversas salvo no banco de dados</li>
              <li>• Limite de requisições baseado no plano do workspace</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiSettings;
