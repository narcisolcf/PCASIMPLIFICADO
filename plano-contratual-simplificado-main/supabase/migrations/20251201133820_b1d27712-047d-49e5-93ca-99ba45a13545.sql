-- Criar tabela de funções
CREATE TABLE public.funcoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de cargos
CREATE TABLE public.cargos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.funcoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;

-- Políticas para funções
CREATE POLICY "Usuários autenticados podem visualizar funções ativas"
ON public.funcoes
FOR SELECT
USING (ativo = true);

CREATE POLICY "Usuários autenticados podem criar funções"
ON public.funcoes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar funções"
ON public.funcoes
FOR UPDATE
USING (true);

-- Políticas para cargos
CREATE POLICY "Usuários autenticados podem visualizar cargos ativos"
ON public.cargos
FOR SELECT
USING (ativo = true);

CREATE POLICY "Usuários autenticados podem criar cargos"
ON public.cargos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar cargos"
ON public.cargos
FOR UPDATE
USING (true);

-- Inserir funções padrão
INSERT INTO public.funcoes (nome, descricao) VALUES
  ('Requisitante', 'Responsável pela solicitação da demanda'),
  ('Técnico', 'Responsável técnico pela análise'),
  ('Gerente', 'Gerente responsável pela aprovação'),
  ('Fiscal', 'Fiscal do contrato');

-- Inserir cargos padrão
INSERT INTO public.cargos (nome, descricao) VALUES
  ('Analista de Contratos', 'Responsável pela análise de contratos'),
  ('Coordenador', 'Coordenador da área'),
  ('Diretor', 'Diretor da unidade'),
  ('Técnico Administrativo', 'Técnico responsável pela gestão administrativa'),
  ('Engenheiro', 'Engenheiro responsável por projetos técnicos'),
  ('Contador', 'Responsável pela área contábil');

-- Modificar tabela responsaveis para aceitar funcao_id e cargo_id
ALTER TABLE public.responsaveis
ADD COLUMN funcao_id UUID REFERENCES public.funcoes(id),
ADD COLUMN cargo_id UUID REFERENCES public.cargos(id);

-- Atualizar RLS de responsaveis para permitir visualizar funções e cargos relacionados
-- (mantém as políticas existentes)