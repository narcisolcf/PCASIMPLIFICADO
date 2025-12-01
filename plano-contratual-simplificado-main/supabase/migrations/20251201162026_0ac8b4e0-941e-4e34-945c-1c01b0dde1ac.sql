-- Adicionar coluna cargo_id à tabela agentes_publicos
ALTER TABLE public.agentes_publicos 
ADD COLUMN cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_agentes_publicos_cargo_id ON public.agentes_publicos(cargo_id);