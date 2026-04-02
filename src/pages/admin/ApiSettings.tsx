import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Zap, CheckCircle, Save, TestTube, Eye, EyeOff, Loader2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ApiSettings = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [useOpenRouter, setUseOpenRouter] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('configuracoes_sistema')
      .select('chave, valor')
      .in('chave', ['OPENROUTER_API_KEY', 'AI_PROVIDER']);

    if (data) {
      const keyRow = data.find(r => r.chave === 'OPENROUTER_API_KEY');
      const providerRow = data.find(r => r.chave === 'AI_PROVIDER');
      setHasKey(!!keyRow?.valor);
      setUseOpenRouter(providerRow?.valor === 'openrouter');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert API key
      if (apiKey) {
        const { error: keyError } = await supabase
          .from('configuracoes_sistema')
          .upsert(
            { chave: 'OPENROUTER_API_KEY', valor: apiKey, categoria: 'ai', tipo: 'secret', descricao: 'Chave API do OpenRouter' },
            { onConflict: 'chave' }
          );
        if (keyError) throw keyError;
      }

      // Upsert provider choice
      const { error: provError } = await supabase
        .from('configuracoes_sistema')
        .upsert(
          { chave: 'AI_PROVIDER', valor: useOpenRouter ? 'openrouter' : 'lovable', categoria: 'ai', tipo: 'string', descricao: 'Provider de IA ativo' },
          { onConflict: 'chave' }
        );
      if (provError) throw provError;

      setApiKey('');
      await loadSettings();
      toast({ title: 'Configurações salvas com sucesso' });
    } catch (e: any) {
      toast({ title: 'Erro ao salvar', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Teste de conexão. Responda apenas: OK' }] }),
      });
      setTestResult(resp.ok ? 'success' : 'error');
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast({ title: 'Falha no teste', description: err.error || `Status ${resp.status}`, variant: 'destructive' });
      } else {
        toast({ title: 'Conexão OK!' });
      }
    } catch {
      setTestResult('error');
      toast({ title: 'Erro de conexão', variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Configurações de API
        </h1>
        <p className="text-muted-foreground text-sm">Gerencie o provider de IA e chaves de API</p>
      </div>

      {/* Provider Switch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Provider de IA
          </CardTitle>
          <CardDescription>Escolha entre o gateway padrão ou OpenRouter com chave própria.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Usar OpenRouter (chave própria)</p>
              <p className="text-xs text-muted-foreground">
                {useOpenRouter ? 'Usando OpenRouter com sua chave API' : 'Usando Lovable AI Gateway (padrão)'}
              </p>
            </div>
            <Switch checked={useOpenRouter} onCheckedChange={setUseOpenRouter} />
          </div>

          <div className="flex items-center gap-3">
            {hasKey || !useOpenRouter ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">
                  {useOpenRouter ? 'Chave OpenRouter configurada' : 'Gateway Lovable ativo'}
                </span>
                <Badge variant="outline" className="text-green-600 border-green-300">Online</Badge>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium">Chave OpenRouter não configurada</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Key */}
      {useOpenRouter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chave API OpenRouter</CardTitle>
            <CardDescription>Insira sua chave de <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline text-primary">openrouter.ai/keys</a></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showKey ? 'text' : 'password'}
                    placeholder={hasKey ? '••••••••••••••••••••' : 'sk-or-v1-...'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar
              </Button>
              <Button variant="outline" onClick={handleTest} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                Testar Conexão
                {testResult === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {testResult === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Models */}
      <Card>
        <CardContent className="pt-6 space-y-3">
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

          <div className="bg-muted rounded-lg p-4 mt-4">
            <h3 className="text-sm font-semibold mb-2">Informações:</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Todas as chamadas são feitas via Edge Function (seguro)</li>
              <li>• Histórico de conversas salvo no banco de dados</li>
              <li>• Chaves nunca são expostas no frontend</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiSettings;
