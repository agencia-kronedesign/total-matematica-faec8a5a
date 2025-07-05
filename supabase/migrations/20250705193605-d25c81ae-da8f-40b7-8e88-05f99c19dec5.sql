-- Add new fields to escolas table
ALTER TABLE public.escolas 
ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT,
ADD COLUMN IF NOT EXISTS inscricao_estadual TEXT,
ADD COLUMN IF NOT EXISTS isento_municipal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS isento_estadual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Rename nome to razao_social if it exists
ALTER TABLE public.escolas 
RENAME COLUMN nome TO razao_social;

-- Update CEP field to be required
ALTER TABLE public.escolas 
ALTER COLUMN cep SET NOT NULL;

-- Add constraints for observacoes length
ALTER TABLE public.escolas 
ADD CONSTRAINT observacoes_length_check CHECK (LENGTH(observacoes) <= 1000);

-- Enable Row Level Security
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin-only access
CREATE POLICY "Admins can view all schools" 
ON public.escolas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario = 'admin'
  )
);

CREATE POLICY "Admins can insert schools" 
ON public.escolas 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario = 'admin'
  )
);

CREATE POLICY "Admins can update schools" 
ON public.escolas 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario = 'admin'
  )
);

CREATE POLICY "Admins can delete schools" 
ON public.escolas 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario = 'admin'
  )
);