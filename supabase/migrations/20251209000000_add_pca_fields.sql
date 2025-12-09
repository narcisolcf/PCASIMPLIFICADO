-- Migration: Adicionar campos para suporte ao Formulário PCA
-- Data: 2024-12-09
-- Descrição: Adiciona campos de prioridade e data_pretendida na tabela materiais_servicos
--            e expande o ENUM de tipo para incluir "Obra" e "Serviço de Engenharia"

-- 1. Expandir ENUM de tipo para incluir novos tipos de item
-- Nota: PostgreSQL não permite ALTER TYPE diretamente em ENUMs com valores dependentes
-- Solução: Usar ALTER TYPE ... ADD VALUE (disponível no PostgreSQL 9.1+)

DO $$
BEGIN
  -- Verificar se o tipo já existe antes de adicionar
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.tipo_item_enum'::regtype
    AND enumlabel = 'Obra'
  ) THEN
    ALTER TYPE public.tipo_item_enum ADD VALUE 'Obra';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.tipo_item_enum'::regtype
    AND enumlabel = 'Serviço de Engenharia'
  ) THEN
    ALTER TYPE public.tipo_item_enum ADD VALUE 'Serviço de Engenharia';
  END IF;
END $$;

-- 2. Adicionar campo de prioridade (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'materiais_servicos'
    AND column_name = 'prioridade'
  ) THEN
    ALTER TABLE public.materiais_servicos
    ADD COLUMN prioridade TEXT DEFAULT 'Média' CHECK (prioridade IN ('Alta', 'Média', 'Baixa'));
  END IF;
END $$;

-- 3. Adicionar campo data_pretendida (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'materiais_servicos'
    AND column_name = 'data_pretendida'
  ) THEN
    ALTER TABLE public.materiais_servicos
    ADD COLUMN data_pretendida DATE;
  END IF;
END $$;

-- 4. Adicionar comentários para documentação
COMMENT ON COLUMN public.materiais_servicos.prioridade IS 'Grau de prioridade do item: Alta, Média ou Baixa';
COMMENT ON COLUMN public.materiais_servicos.data_pretendida IS 'Data pretendida para a contratação do item';

-- 5. Criar índice para melhorar performance de consultas por prioridade
CREATE INDEX IF NOT EXISTS idx_materiais_servicos_prioridade
ON public.materiais_servicos(prioridade);

-- 6. Criar índice para melhorar performance de consultas por data_pretendida
CREATE INDEX IF NOT EXISTS idx_materiais_servicos_data_pretendida
ON public.materiais_servicos(data_pretendida);
