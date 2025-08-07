import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KeepAliveRequest {
  source?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Keep-alive function started at:', new Date().toISOString());

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse request body
    let requestData: KeepAliveRequest = {};
    try {
      requestData = await req.json();
    } catch (error) {
      console.log('No JSON body provided, using defaults');
    }

    const source = requestData.source || 'manual';
    console.log('Keep-alive triggered by:', source);

    // Execute keep-alive function in database
    const { data, error } = await supabase.rpc('update_keep_alive');

    if (error) {
      console.error('Error executing keep-alive function:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString(),
          source 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Keep-alive executed successfully');

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database keep-alive executed successfully',
        timestamp: new Date().toISOString(),
        source
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Keep-alive function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
