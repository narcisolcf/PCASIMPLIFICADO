-- Migration: Add automatic unique code generation for materiais_servicos
-- Generates codes in format: MS-001000, MS-001001, etc.

-- Step 1: Create sequence for generating unique codes
CREATE SEQUENCE IF NOT EXISTS public.codigo_material_servico_seq START WITH 1000;

-- Step 2: Create function to generate unique code automatically
CREATE OR REPLACE FUNCTION public.generate_codigo_material_servico()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate code if not provided (NULL or empty)
  IF NEW.codigo_item IS NULL OR NEW.codigo_item = '' THEN
    -- Generate code in format MS-XXXXXX (e.g., MS-001000)
    NEW.codigo_item := 'MS-' || LPAD(nextval('public.codigo_material_servico_seq')::TEXT, 6, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to auto-generate code before insert
DROP TRIGGER IF EXISTS trigger_generate_codigo_material_servico ON public.materiais_servicos;

CREATE TRIGGER trigger_generate_codigo_material_servico
  BEFORE INSERT ON public.materiais_servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_codigo_material_servico();

-- Step 4: Add unique constraint on codigo_item to prevent duplicates
-- First, check if constraint already exists and drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'materiais_servicos_codigo_item_key'
  ) THEN
    ALTER TABLE public.materiais_servicos DROP CONSTRAINT materiais_servicos_codigo_item_key;
  END IF;
END $$;

-- Add unique constraint
ALTER TABLE public.materiais_servicos
ADD CONSTRAINT materiais_servicos_codigo_item_unique UNIQUE (codigo_item);

-- Step 5: Update existing records that have NULL or empty codigo_item
-- This ensures all existing records get a unique code
UPDATE public.materiais_servicos
SET codigo_item = 'MS-' || LPAD(nextval('public.codigo_material_servico_seq')::TEXT, 6, '0')
WHERE codigo_item IS NULL OR codigo_item = '';

-- Step 6: Make codigo_item NOT NULL (now that all records have codes)
ALTER TABLE public.materiais_servicos
ALTER COLUMN codigo_item SET NOT NULL;

-- Add comments for documentation
COMMENT ON SEQUENCE public.codigo_material_servico_seq IS
'Sequence for generating unique material/service codes starting at 1000';

COMMENT ON FUNCTION public.generate_codigo_material_servico() IS
'Automatically generates unique code for materiais_servicos in format MS-XXXXXX';

COMMENT ON COLUMN public.materiais_servicos.codigo_item IS
'Auto-generated unique code in format MS-XXXXXX (e.g., MS-001000)';

-- Create index for faster lookups by codigo_item
CREATE INDEX IF NOT EXISTS idx_materiais_servicos_codigo_item
ON public.materiais_servicos(codigo_item);
