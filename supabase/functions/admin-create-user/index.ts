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
    const { email, password, nome, tipo_usuario, recreate, existingUserId } = await req.json()

    // Validate required fields
    if (!email || !password || !nome || !tipo_usuario) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
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

    // Se for recriação, primeiro verificar se usuário já existe no auth
    if (recreate && existingUserId) {
      console.log(`[admin-create-user] Modo recriação para usuário: ${email}, ID existente: ${existingUserId}`)
      
      // Verificar se já existe no auth.users pelo email
      const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === email)
      
      if (existingAuthUser) {
        console.log(`[admin-create-user] Usuário ${email} já existe no auth.users com ID: ${existingAuthUser.id}`)
        
        // Se o ID do auth é diferente do ID na tabela usuarios, precisamos atualizar
        if (existingAuthUser.id !== existingUserId) {
          // Deletar o registro órfão na tabela usuarios
          const { error: deleteError } = await supabaseAdmin
            .from('usuarios')
            .delete()
            .eq('id', existingUserId)
          
          if (deleteError) {
            console.error('[admin-create-user] Erro ao deletar registro órfão:', deleteError)
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'Usuário já existe no sistema de autenticação. Registro órfão removido.',
              authUserId: existingAuthUser.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Usuário já está sincronizado com autenticação'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Usuário não existe no auth, precisamos criar e sincronizar
      console.log(`[admin-create-user] Criando usuário ${email} no auth e sincronizando com ID existente`)
      
      // Primeiro, deletar o registro órfão para evitar duplicidade
      const { error: deleteOrphanError } = await supabaseAdmin
        .from('usuarios')
        .delete()
        .eq('id', existingUserId)
      
      if (deleteOrphanError) {
        console.error('[admin-create-user] Erro ao deletar registro órfão:', deleteOrphanError)
      }
    }

    // Create user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        nome: nome,
        tipo_usuario: tipo_usuario
      },
      email_confirm: true // Skip email confirmation for admin-created users
    })

    if (authError) {
      console.error('[admin-create-user] Erro ao criar usuário:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (authData.user) {
      console.log(`[admin-create-user] Usuário criado no auth: ${authData.user.id}`)
      
      // O trigger handle_new_user vai criar o registro na tabela usuarios
      // Mas precisamos atualizar o tipo_usuario
      
      // Aguardar um pouco para o trigger executar
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update user type in usuarios table
      const { error: updateError } = await supabaseAdmin
        .from('usuarios')
        .update({ 
          tipo_usuario,
          nome,
          ativo: true
        })
        .eq('id', authData.user.id)

      if (updateError) {
        console.error('[admin-create-user] Erro ao atualizar tipo de usuário:', updateError)
        return new Response(
          JSON.stringify({ error: 'Usuário criado mas erro ao definir tipo' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log(`[admin-create-user] Usuário ${email} criado e configurado com sucesso`)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: authData.user,
          message: recreate ? 'Usuário recriado com sucesso' : 'Usuário criado com sucesso'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Erro desconhecido ao criar usuário' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[admin-create-user] Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
