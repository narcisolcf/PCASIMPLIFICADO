-- Tornar o campo funcao opcional (nullable) já que agora usamos funcao_id
ALTER TABLE public.responsaveis
ALTER COLUMN funcao DROP NOT NULL;

-- Remover a constraint do enum se existir
ALTER TABLE public.responsaveis
ALTER COLUMN funcao TYPE TEXT;