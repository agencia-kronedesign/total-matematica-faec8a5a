import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Secure admin setup key stored as environment variable
const ADMIN_SETUP_KEY = Deno.env.get('ADMIN_SETUP_KEY') || 'DEFAULT_SETUP_KEY_CHANGE_THIS';

interface ValidateSetupRequest {
  setupKey: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { setupKey }: ValidateSetupRequest = await req.json();

    if (!setupKey || typeof setupKey !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid setup key format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the setup key against the server-side secret
    const isValid = setupKey === ADMIN_SETUP_KEY;
    
    // Log the attempt for security monitoring
    console.log(`Admin setup validation attempt: ${isValid ? 'SUCCESS' : 'FAILED'} at ${new Date().toISOString()}`);

    if (!isValid) {
      // Add a small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(
      JSON.stringify({ valid: isValid }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in validate-admin-setup function:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);