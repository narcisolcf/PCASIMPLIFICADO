-- Criar sequência para gerar códigos únicos de materiais/serviços
CREATE SEQUENCE IF NOT EXISTS public.codigo_material_servico_seq START WITH 1000;

-- Criar função para gerar código único automaticamente
CREATE OR REPLACE FUNCTION public.gerar_codigo_material_servico()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Se o código não foi fornecido, gerar automaticamente
  IF NEW.codigo_item IS NULL OR NEW.codigo_item = '' THEN
    NEW.codigo_item := 'MS-' || LPAD(nextval('public.codigo_material_servico_seq')::text, 6, '0');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para gerar código antes de inserir
DROP TRIGGER IF EXISTS trigger_gerar_codigo_material_servico ON public.materiais_servicos;

CREATE TRIGGER trigger_gerar_codigo_material_servico
BEFORE INSERT ON public.materiais_servicos
FOR EACH ROW
EXECUTE FUNCTION public.gerar_codigo_material_servico();

-- Adicionar constraint de unicidade no código do item
ALTER TABLE public.materiais_servicos
DROP CONSTRAINT IF EXISTS materiais_servicos_codigo_item_unique;

ALTER TABLE public.materiais_servicos
ADD CONSTRAINT materiais_servicos_codigo_item_unique UNIQUE (codigo_item);