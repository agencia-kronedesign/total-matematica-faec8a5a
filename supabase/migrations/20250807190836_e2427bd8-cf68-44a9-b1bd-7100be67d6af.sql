-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar função para atualizar último keep-alive
CREATE OR REPLACE FUNCTION public.update_keep_alive()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar métricas do dashboard (aproveita para manter dados atualizados)
  PERFORM public.atualizar_metricas_dashboard();
  
  -- Log da execução do keep-alive
  INSERT INTO public.logs_acesso (usuario_id, data_login, ip_address)
  VALUES (
    '00000000-0000-0000-0000-000000000000', -- UUID especial para keep-alive
    NOW(),
    'keep-alive-cron'
  ) ON CONFLICT DO NOTHING;
END;
$$;

-- Configurar cron job para executar às 00:01 todos os dias
SELECT cron.schedule(
  'keep-alive-daily',
  '1 0 * * *', -- 00:01 todos os dias
  $$
  SELECT
    net.http_post(
        url:='https://bckalmbnlgukcjbvyzbe.supabase.co/functions/v1/keep-alive',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJja2FsbWJubGd1a2NqYnZ5emJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4OTkyODksImV4cCI6MjA1OTQ3NTI4OX0.SzKOmNzCcQkq6IkxJbTzJzixA5QNHWMSUa3XzYWZan0"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);