-- Apply only the new migrations to avoid conflicts

-- Migration 1: UASG Budget Validation
-- Function to validate area budget against UASG
CREATE OR REPLACE FUNCTION public.validate_area_orcamento()
RETURNS TRIGGER AS $$
DECLARE
  uasg_orcamento DECIMAL;
  total_areas_atual DECIMAL;
  total_outras_areas DECIMAL;
BEGIN
  -- Get UASG budget
  SELECT disponibilidade_orcamentaria INTO uasg_orcamento
  FROM public.uasgs
  WHERE id = NEW.uasg_id;

  -- If UASG not found, allow (will fail on FK constraint)
  IF uasg_orcamento IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate total budget of other areas from same UASG (excluding current area if updating)
  SELECT COALESCE(SUM(disponibilidade_orcamentaria), 0) INTO total_outras_areas
  FROM public.areas_requisitantes
  WHERE uasg_id = NEW.uasg_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Calculate what would be the total if we add/update this area
  total_areas_atual := total_outras_areas + NEW.disponibilidade_orcamentaria;

  -- Validate: total of all areas cannot exceed UASG budget
  IF total_areas_atual > uasg_orcamento THEN
    RAISE EXCEPTION 'Orçamento total das áreas (R$ %) excede o orçamento da UASG (R$ %). Disponível: R$ %',
      total_areas_atual,
      uasg_orcamento,
      (uasg_orcamento - total_outras_areas);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists to avoid error
DROP TRIGGER IF EXISTS check_area_orcamento_before_insert_update ON public.areas_requisitantes;

-- Create trigger to validate before insert or update
CREATE TRIGGER check_area_orcamento_before_insert_update
  BEFORE INSERT OR UPDATE ON public.areas_requisitantes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_area_orcamento();

-- Add comment for documentation
COMMENT ON FUNCTION public.validate_area_orcamento() IS
'Validates that the sum of all areas_requisitantes budgets does not exceed the parent UASG budget';


-- Migration 2: Fix responsaveis schema to use FK instead of ENUM

-- Step 1: Add new columns with FK references (check if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'responsaveis' AND column_name = 'funcao_id') THEN
    ALTER TABLE public.responsaveis
    ADD COLUMN funcao_id UUID REFERENCES public.funcoes(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'responsaveis' AND column_name = 'cargo_id') THEN
    ALTER TABLE public.responsaveis
    ADD COLUMN cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Step 2: Migrate existing data from enum to FK (if possible)
UPDATE public.responsaveis r
SET funcao_id = f.id
FROM public.funcoes f
WHERE LOWER(r.funcao::text) = LOWER(f.nome)
AND r.funcao_id IS NULL;

-- Step 3: Migrate existing cargo string values to cargos FK (if possible)
UPDATE public.responsaveis r
SET cargo_id = c.id
FROM public.cargos c
WHERE LOWER(r.cargo) = LOWER(c.nome)
AND r.cargo_id IS NULL;

-- Step 4: Make old columns nullable
ALTER TABLE public.responsaveis ALTER COLUMN funcao DROP NOT NULL;
ALTER TABLE public.responsaveis ALTER COLUMN cargo DROP NOT NULL;

-- Step 5: Add comments for documentation
COMMENT ON COLUMN public.responsaveis.funcao_id IS 'Foreign key to funcoes table (new schema)';
COMMENT ON COLUMN public.responsaveis.cargo_id IS 'Foreign key to cargos table (new schema)';
COMMENT ON COLUMN public.responsaveis.funcao IS 'Deprecated: Use funcao_id instead';
COMMENT ON COLUMN public.responsaveis.cargo IS 'Deprecated: Use cargo_id instead';
