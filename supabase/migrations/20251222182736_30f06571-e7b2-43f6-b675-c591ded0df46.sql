-- Adicionar coluna status na tabela leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'novo';

COMMENT ON COLUMN public.leads.status IS 'Status do lead: novo, em_atendimento, concluido, arquivado';

-- Adicionar coluna status na tabela contacts
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'novo';

COMMENT ON COLUMN public.contacts.status IS 'Status do contato: novo, em_atendimento, concluido, arquivado';