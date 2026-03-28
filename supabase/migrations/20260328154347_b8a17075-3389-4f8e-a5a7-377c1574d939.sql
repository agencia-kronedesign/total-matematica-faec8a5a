ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS nome_responsavel2 text,
  ADD COLUMN IF NOT EXISTS email_responsavel2 text;