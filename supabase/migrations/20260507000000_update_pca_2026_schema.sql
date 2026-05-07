-- Migration: Atualização do schema para PCA 2026
-- Baseado na nova tabela "TABELA - PCA CAMOCIM 2026"

-- ============================================
-- 1. ATUALIZAR ENUM tipo_material_servico
-- ============================================
-- Adicionar novos valores ao enum existente
ALTER TYPE tipo_material_servico ADD VALUE IF NOT EXISTS 'Material Permanente';
ALTER TYPE tipo_material_servico ADD VALUE IF NOT EXISTS 'Material de Consumo';
ALTER TYPE tipo_material_servico ADD VALUE IF NOT EXISTS 'Obra';
ALTER TYPE tipo_material_servico ADD VALUE IF NOT EXISTS 'Serviço de Engenharia';

-- ============================================
-- 2. ATUALIZAR ENUM prioridade
-- ============================================
-- Adicionar nível "Altíssima" ao enum
ALTER TYPE prioridade ADD VALUE IF NOT EXISTS 'Altíssima';

-- ============================================
-- 3. CRIAR ENUM expectativa_contratacao
-- ============================================
DO $$ BEGIN
    CREATE TYPE expectativa_contratacao AS ENUM (
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
        'No Primeiro Trimestre',
        'No Segundo Trimestre',
        'No Terceiro Trimestre',
        'No Quarto Trimestre',
        'Até o Primeiro Trimestre',
        'Até o Segundo Trimestre',
        'Até o Terceiro Trimestre',
        'Até o Quarto Trimestre'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 4. ADICIONAR NOVOS CAMPOS à tabela materiais_servicos
-- ============================================
ALTER TABLE materiais_servicos
ADD COLUMN IF NOT EXISTS expectativa_consumo VARCHAR(100),
ADD COLUMN IF NOT EXISTS expectativa_contratacao expectativa_contratacao,
ADD COLUMN IF NOT EXISTS prioridade_item prioridade DEFAULT 'Média',
ADD COLUMN IF NOT EXISTS valor_preliminar DECIMAL(15,2);

-- ============================================
-- 5. ADICIONAR CAMPO ano_exercicio à tabela dfds
-- ============================================
ALTER TABLE dfds
ADD COLUMN IF NOT EXISTS ano_exercicio INTEGER DEFAULT 2026;

-- ============================================
-- 6. COMENTÁRIOS para documentação
-- ============================================
COMMENT ON COLUMN materiais_servicos.expectativa_consumo IS 'Período de consumo esperado (ex: 12 MESES, NÃO SE APLICA)';
COMMENT ON COLUMN materiais_servicos.expectativa_contratacao IS 'Quando a contratação deve ocorrer';
COMMENT ON COLUMN materiais_servicos.prioridade_item IS 'Prioridade específica do item';
COMMENT ON COLUMN materiais_servicos.valor_preliminar IS 'Valor total preliminar do item';
COMMENT ON COLUMN dfds.ano_exercicio IS 'Ano do exercício fiscal do PCA';
