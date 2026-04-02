import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: userData } = await supabase
      .from("usuarios")
      .select("tipo_usuario")
      .eq("id", user.id)
      .single();

    if (!userData || userData.tipo_usuario !== "admin") {
      return new Response(JSON.stringify({ error: "Acesso restrito a administradores" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, model } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Mensagens inválidas" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine provider: check configuracoes_sistema for custom OpenRouter key
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: configs } = await serviceClient
      .from("configuracoes_sistema")
      .select("chave, valor")
      .in("chave", ["AI_PROVIDER", "OPENROUTER_API_KEY"]);

    const providerConfig = configs?.find((c: any) => c.chave === "AI_PROVIDER");
    const openrouterKeyConfig = configs?.find((c: any) => c.chave === "OPENROUTER_API_KEY");

    const useOpenRouter = providerConfig?.valor === "openrouter" && !!openrouterKeyConfig?.valor;

    const selectedModel = model || "google/gemini-3-flash-preview";

    const systemMessage = {
      role: "system",
      content: `Você é o assistente AI do sistema Total Matemática (totalmatematica.com.br). 
Você ajuda o administrador a entender o sistema, responder dúvidas sobre funcionalidades, 
sugerir melhorias e fornecer informações sobre a plataforma educacional de matemática.
Responda sempre em português do Brasil, de forma clara e objetiva.
O sistema possui: gestão de escolas, turmas, matrículas, exercícios matemáticos, 
atividades para alunos, relatórios (REDIN, REDALGRAF), perfis de acesso 
(admin, direção, coordenação, professor, aluno, responsável).`,
    };

    let apiUrl: string;
    let apiHeaders: Record<string, string>;

    if (useOpenRouter) {
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      apiHeaders = {
        Authorization: `Bearer ${openrouterKeyConfig!.valor}`,
        "Content-Type": "application/json",
      };
    } else {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiHeaders = {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      };
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: apiHeaders,
      body: JSON.stringify({
        model: selectedModel,
        messages: [systemMessage, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace Lovable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: useOpenRouter ? "Erro no OpenRouter. Verifique sua chave API." : "Erro no gateway AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save conversation (fire and forget)
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    if (lastUserMessage) {
      serviceClient.from("ai_conversations").insert({
        user_id: user.id,
        message: lastUserMessage.content,
        model: selectedModel,
      }).then(() => {});
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
