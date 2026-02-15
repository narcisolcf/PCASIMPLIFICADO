-- Migration: Automate UASG Number Generation
-- Description: Creates a sequence for generating sequential UASG numbers and sets it as the default value for the 'numero_uasg' column.

-- 1. Create a sequence for UASG numbers
-- We use a DO block to dynamically set the start value based on existing data
DO $$
DECLARE
  max_uasg INTEGER;
BEGIN
  -- Try to find the maximum existing numeric UASG number
  -- We cast to INTEGER, ignoring non-numeric values if any exist (using regex to filter)
  SELECT MAX(CAST(numero_uasg AS INTEGER))
  INTO max_uasg
  FROM public.uasgs
  WHERE numero_uasg ~ '^[0-9]+$';

  -- If no numeric UASGs exist, start from 1000, otherwise start from max + 1
  IF max_uasg IS NULL THEN
    max_uasg := 1000;
  END IF;

  -- Create the sequence
  EXECUTE 'CREATE SEQUENCE IF NOT EXISTS public.uasgs_numero_uasg_seq START WITH ' || (max_uasg + 1);
END $$;

-- 2. Alter the table to use the sequence as default
-- We use validation to ensure distinct values if necessary, but the sequence handles uniqueness typically
ALTER TABLE public.uasgs
ALTER COLUMN numero_uasg SET DEFAULT CAST(nextval('public.uasgs_numero_uasg_seq') AS TEXT);

-- 3. Add a comment explaining the automation
COMMENT ON COLUMN public.uasgs.numero_uasg IS 'Unique identifier for the UASG. Automatically generated via public.uasgs_numero_uasg_seq if not provided.';
