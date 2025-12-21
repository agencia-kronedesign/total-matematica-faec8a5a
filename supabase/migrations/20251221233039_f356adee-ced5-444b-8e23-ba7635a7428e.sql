-- Tabela para leads (solicitações de videoconferência/representante)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL,
  email text NOT NULL,
  escola_ou_rede text,
  origem text NOT NULL DEFAULT 'landing:lead-form',
  user_agent text,
  ip text
);

-- Ativar RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: permitir insert anônimo (visitantes do site)
CREATE POLICY "Leads allow anonymous insert"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: select apenas para admin (usando função existente)
CREATE POLICY "Leads select only admin"
ON public.leads
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'admin'::user_type);

-- Policy: update apenas para admin
CREATE POLICY "Leads update only admin"
ON public.leads
FOR UPDATE
TO authenticated
USING (get_current_user_role() = 'admin'::user_type);

-- Policy: delete apenas para admin
CREATE POLICY "Leads delete only admin"
ON public.leads
FOR DELETE
TO authenticated
USING (get_current_user_role() = 'admin'::user_type);

-- Tabela para contatos genéricos (formulário do footer)
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  nome text NOT NULL,
  email text NOT NULL,
  mensagem text NOT NULL,
  origem text NOT NULL DEFAULT 'landing:footer',
  user_agent text,
  ip text
);

-- Ativar RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy: permitir insert anônimo
CREATE POLICY "Contacts allow anonymous insert"
ON public.contacts
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: select apenas para admin
CREATE POLICY "Contacts select only admin"
ON public.contacts
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'admin'::user_type);

-- Policy: update apenas para admin
CREATE POLICY "Contacts update only admin"
ON public.contacts
FOR UPDATE
TO authenticated
USING (get_current_user_role() = 'admin'::user_type);

-- Policy: delete apenas para admin
CREATE POLICY "Contacts delete only admin"
ON public.contacts
FOR DELETE
TO authenticated
USING (get_current_user_role() = 'admin'::user_type);