-- Adicionar novos valores ao ENUM situacao_dfd
-- Postgres não suporta "ADD VALUE IF NOT EXISTS" nativamente em todas as versões de forma simples num bloco transaction, 
-- mas podemos tentar adicionar um a um ou recriar o tipo. A abordagem mais segura para produção é ADD VALUE.

DO $$
BEGIN
    ALTER TYPE public.situacao_dfd ADD VALUE 'Em Análise';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE public.situacao_dfd ADD VALUE 'Correção Solicitada';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE public.situacao_dfd ADD VALUE 'Aprovado';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar colunas de controle de aprovação na tabela dfds
ALTER TABLE public.dfds
ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS aprovado_por UUID REFERENCES public.agentes_publicos(id),
ADD COLUMN IF NOT EXISTS motivo_correcao TEXT;

-- Indexar para busca rápida por status
CREATE INDEX IF NOT EXISTS idx_dfds_situacao ON public.dfds(situacao);
