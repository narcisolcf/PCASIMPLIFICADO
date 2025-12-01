-- Migration: Fix responsaveis schema to use FK instead of ENUM
-- Changes funcao and cargo from direct values to foreign keys

-- Step 1: Add new columns with FK references
ALTER TABLE public.responsaveis
ADD COLUMN funcao_id UUID REFERENCES public.funcoes(id) ON DELETE SET NULL,
ADD COLUMN cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL;

-- Step 2: Migrate existing data from enum to FK (if possible)
-- This attempts to match existing funcao enum values to funcoes table names
UPDATE public.responsaveis r
SET funcao_id = f.id
FROM public.funcoes f
WHERE LOWER(r.funcao::text) = LOWER(f.nome);

-- Step 3: Migrate existing cargo string values to cargos FK (if possible)
UPDATE public.responsaveis r
SET cargo_id = c.id
FROM public.cargos c
WHERE LOWER(r.cargo) = LOWER(c.nome);

-- Step 4: Drop old columns (keep as TEXT temporarily for backward compatibility)
-- We'll keep the enum column but make it nullable for now
ALTER TABLE public.responsaveis ALTER COLUMN funcao DROP NOT NULL;
ALTER TABLE public.responsaveis ALTER COLUMN cargo DROP NOT NULL;

-- Step 5: Add comment for documentation
COMMENT ON COLUMN public.responsaveis.funcao_id IS 'Foreign key to funcoes table (new schema)';
COMMENT ON COLUMN public.responsaveis.cargo_id IS 'Foreign key to cargos table (new schema)';
COMMENT ON COLUMN public.responsaveis.funcao IS 'Deprecated: Use funcao_id instead';
COMMENT ON COLUMN public.responsaveis.cargo IS 'Deprecated: Use cargo_id instead';

-- Note: We keep old columns for backward compatibility during transition
-- In a future migration, we can drop them completely after ensuring all code uses new schema
