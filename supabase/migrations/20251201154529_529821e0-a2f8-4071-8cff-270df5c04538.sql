CREATE TABLE public.agentes_publicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  email TEXT,
  telefone TEXT,
  cargo TEXT,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.agentes_publicos ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.uasgs ADD COLUMN unidades_orcamentarias TEXT;
ALTER TABLE public.uasgs ADD COLUMN rubricas TEXT;
ALTER TABLE public.uasgs ADD COLUMN ordenador_despesa_id UUID;

ALTER TABLE public.uasgs 
  ADD CONSTRAINT fk_ordenador_despesa 
  FOREIGN KEY (ordenador_despesa_id) 
  REFERENCES public.agentes_publicos(id) 
  ON DELETE SET NULL;

CREATE INDEX idx_agentes_cpf ON public.agentes_publicos(cpf);
CREATE INDEX idx_agentes_ativo ON public.agentes_publicos(ativo);
CREATE INDEX idx_uasgs_ordenador_despesa ON public.uasgs(ordenador_despesa_id);