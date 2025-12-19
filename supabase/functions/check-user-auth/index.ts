import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, email } = await req.json()

    if (!userId && !email) {
      return new Response(
        JSON.stringify({ error: 'userId ou email é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Buscar usuário pelo ID ou email
    if (userId) {
      const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      if (error || !user?.user) {
        console.log(`[check-user-auth] Usuário ${userId} não encontrado no auth`)
        return new Response(
          JSON.stringify({ exists: false, userId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`[check-user-auth] Usuário ${userId} encontrado no auth: ${user.user.email}`)
      return new Response(
        JSON.stringify({ 
          exists: true, 
          userId: user.user.id,
          email: user.user.email,
          created_at: user.user.created_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Buscar por email
    if (email) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const user = users?.users?.find(u => u.email === email)

      if (!user) {
        console.log(`[check-user-auth] Email ${email} não encontrado no auth`)
        return new Response(
          JSON.stringify({ exists: false, email }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`[check-user-auth] Email ${email} encontrado no auth: ${user.id}`)
      return new Response(
        JSON.stringify({ 
          exists: true, 
          userId: user.id,
          email: user.email,
          created_at: user.created_at
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Parâmetros inválidos' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[check-user-auth] Erro:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
