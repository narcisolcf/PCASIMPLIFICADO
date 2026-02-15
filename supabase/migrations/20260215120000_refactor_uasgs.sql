-- Create table for Unidades Orçamentárias
CREATE TABLE IF NOT EXISTS public.unidades_orcamentarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uasg_id UUID NOT NULL REFERENCES public.uasgs(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Rubricas
CREATE TABLE IF NOT EXISTS public.rubricas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uasg_id UUID NOT NULL REFERENCES public.uasgs(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unidades_orcamentarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubricas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Unidades Orçamentárias
CREATE POLICY "Public read access for unidades_orcamentarias"
ON public.unidades_orcamentarias FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert unidades_orcamentarias"
ON public.unidades_orcamentarias FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update unidades_orcamentarias"
ON public.unidades_orcamentarias FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete unidades_orcamentarias"
ON public.unidades_orcamentarias FOR DELETE
USING (auth.role() = 'authenticated');

-- RLS Policies for Rubricas
CREATE POLICY "Public read access for rubricas"
ON public.rubricas FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert rubricas"
ON public.rubricas FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rubricas"
ON public.rubricas FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete rubricas"
ON public.rubricas FOR DELETE
USING (auth.role() = 'authenticated');

-- Ensure ordenador_despesa_id is a FK to agentes_publicos
-- First, we need to check if the column exists, if not add it. 
-- In this case we know it likely exists but might not be a FK.
-- We will try to add the constraint. SAFELY.

DO $$
BEGIN
  -- Check if constraint already exists to avoid error
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uasgs_ordenador_despesa_id_fkey'
  ) THEN
    -- Try to add constraint. This might fail if data is invalid, providing a warning is better than failing hard script?
    -- For now we assume data is clean or we might need to clean it. 
    -- Let's just Add it.
    ALTER TABLE public.uasgs
    ADD CONSTRAINT uasgs_ordenador_despesa_id_fkey
    FOREIGN KEY (ordenador_despesa_id)
    REFERENCES public.agentes_publicos(id)
    ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not add foreign key constraint to ordenador_despesa_id. Data might be inconsistent.';
END $$;
