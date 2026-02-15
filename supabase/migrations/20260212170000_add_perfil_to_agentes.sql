-- Criar tipo enum para perfil do usuário
CREATE TYPE public.perfil_usuario AS ENUM ('admin', 'gestor', 'requisitante');

-- Adicionar coluna perfil à tabela agentes_publicos
ALTER TABLE public.agentes_publicos 
ADD COLUMN perfil public.perfil_usuario NOT NULL DEFAULT 'requisitante';

-- Criar índice para melhor performance em queries de permissão
CREATE INDEX idx_agentes_publicos_perfil ON public.agentes_publicos(perfil);

-- Atualizar políticas de RLS (Exemplo: Admin pode ver tudo, outros apenas o próprio ou público)
-- Por enquanto, mantemos as políticas existentes, mas a aplicação usará este campo para controle de UI e Rotas.
