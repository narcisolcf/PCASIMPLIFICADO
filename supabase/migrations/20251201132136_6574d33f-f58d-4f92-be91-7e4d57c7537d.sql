-- Criar tabela para UASGs com disponibilidade orçamentária
CREATE TABLE public.uasgs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_uasg TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  disponibilidade_orcamentaria NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar trigger para updated_at
CREATE TRIGGER update_uasgs_updated_at
BEFORE UPDATE ON public.uasgs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.uasgs ENABLE ROW LEVEL SECURITY;

-- Políticas para UASGs
CREATE POLICY "Usuários autenticados podem visualizar UASGs"
ON public.uasgs
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem criar UASGs"
ON public.uasgs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar UASGs"
ON public.uasgs
FOR UPDATE
USING (true);

CREATE POLICY "Usuários autenticados podem deletar UASGs"
ON public.uasgs
FOR DELETE
USING (true);

-- Adicionar foreign key de areas_requisitantes para uasgs
ALTER TABLE public.areas_requisitantes
ADD COLUMN uasg_id UUID REFERENCES public.uasgs(id) ON DELETE CASCADE;

-- Criar função para validar disponibilidade orçamentária da área
CREATE OR REPLACE FUNCTION public.validar_disponibilidade_area()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  disponibilidade_uasg NUMERIC;
  total_areas NUMERIC;
BEGIN
  -- Buscar disponibilidade da UASG
  SELECT disponibilidade_orcamentaria INTO disponibilidade_uasg
  FROM public.uasgs
  WHERE id = NEW.uasg_id;
  
  -- Calcular total já alocado em outras áreas (excluindo a atual se for update)
  SELECT COALESCE(SUM(disponibilidade_orcamentaria), 0) INTO total_areas
  FROM public.areas_requisitantes
  WHERE uasg_id = NEW.uasg_id
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Validar se o novo valor não excede o disponível
  IF (total_areas + NEW.disponibilidade_orcamentaria) > disponibilidade_uasg THEN
    RAISE EXCEPTION 'A disponibilidade orçamentária total das áreas (%) excede a disponibilidade da UASG (%)', 
      (total_areas + NEW.disponibilidade_orcamentaria), disponibilidade_uasg;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para validar disponibilidade
CREATE TRIGGER validar_disponibilidade_area_trigger
BEFORE INSERT OR UPDATE ON public.areas_requisitantes
FOR EACH ROW
EXECUTE FUNCTION public.validar_disponibilidade_area();

-- Inserir algumas UASGs de exemplo
INSERT INTO public.uasgs (numero_uasg, nome, disponibilidade_orcamentaria)
VALUES 
  ('200999', 'UASG Central', 5000000),
  ('413001', 'UASG Regional Sul', 3000000),
  ('413002', 'UASG Regional Norte', 2500000);