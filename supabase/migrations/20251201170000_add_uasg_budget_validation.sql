-- Migration: Add UASG Budget Validation
-- Prevents areas_requisitantes from having budget greater than parent UASG

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

-- Create trigger to validate before insert or update
CREATE TRIGGER check_area_orcamento_before_insert_update
  BEFORE INSERT OR UPDATE ON public.areas_requisitantes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_area_orcamento();

-- Add comment for documentation
COMMENT ON FUNCTION public.validate_area_orcamento() IS
'Validates that the sum of all areas_requisitantes budgets does not exceed the parent UASG budget';
