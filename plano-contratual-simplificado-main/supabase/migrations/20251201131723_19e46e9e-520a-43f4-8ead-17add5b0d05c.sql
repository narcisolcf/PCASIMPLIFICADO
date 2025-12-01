-- Criar tabela de áreas requisitantes
CREATE TABLE public.areas_requisitantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE NOT NULL,
  numero_uasg TEXT NOT NULL,
  nome TEXT NOT NULL,
  disponibilidade_orcamentaria DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tipo enum para situação do DFD
CREATE TYPE public.situacao_dfd AS ENUM ('Rascunho', 'Enviado', 'Vinculado');

-- Criar tipo enum para prioridade
CREATE TYPE public.prioridade AS ENUM ('Baixa', 'Média', 'Alta');

-- Criar tabela de DFDs
CREATE TABLE public.dfds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE NOT NULL,
  area_requisitante_id UUID REFERENCES public.areas_requisitantes(id) ON DELETE CASCADE,
  numero_uasg TEXT NOT NULL,
  descricao_sucinta TEXT,
  justificativa_necessidade TEXT,
  data_conclusao DATE,
  prioridade public.prioridade DEFAULT 'Média',
  situacao public.situacao_dfd DEFAULT 'Rascunho',
  valor_total DECIMAL(15,2) DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tipo enum para tipo de material/serviço
CREATE TYPE public.tipo_material_servico AS ENUM ('Material', 'Serviço');

-- Criar tabela de materiais/serviços
CREATE TABLE public.materiais_servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dfd_id UUID REFERENCES public.dfds(id) ON DELETE CASCADE NOT NULL,
  tipo public.tipo_material_servico NOT NULL,
  codigo_item TEXT,
  descricao TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(15,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tipo enum para função do responsável
CREATE TYPE public.funcao_responsavel AS ENUM ('Requisitante', 'Técnico', 'Gerente', 'Fiscal');

-- Criar tabela de responsáveis
CREATE TABLE public.responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dfd_id UUID REFERENCES public.dfds(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  cargo TEXT,
  funcao public.funcao_responsavel NOT NULL,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.areas_requisitantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dfds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responsaveis ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para áreas requisitantes (todos usuários autenticados podem ver e criar)
CREATE POLICY "Usuários autenticados podem visualizar áreas requisitantes"
  ON public.areas_requisitantes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar áreas requisitantes"
  ON public.areas_requisitantes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar áreas requisitantes"
  ON public.areas_requisitantes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem deletar áreas requisitantes"
  ON public.areas_requisitantes FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para DFDs (usuários podem ver e gerenciar seus próprios DFDs)
CREATE POLICY "Usuários podem visualizar seus próprios DFDs"
  ON public.dfds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios DFDs"
  ON public.dfds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios DFDs"
  ON public.dfds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios DFDs"
  ON public.dfds FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para materiais/serviços (baseado no DFD)
CREATE POLICY "Usuários podem visualizar materiais/serviços de seus DFDs"
  ON public.materiais_servicos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dfds
      WHERE dfds.id = materiais_servicos.dfd_id
      AND dfds.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar materiais/serviços em seus DFDs"
  ON public.materiais_servicos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dfds
      WHERE dfds.id = materiais_servicos.dfd_id
      AND dfds.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar materiais/serviços de seus DFDs"
  ON public.materiais_servicos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dfds
      WHERE dfds.id = materiais_servicos.dfd_id
      AND dfds.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar materiais/serviços de seus DFDs"
  ON public.materiais_servicos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dfds
      WHERE dfds.id = materiais_servicos.dfd_id
      AND dfds.user_id = auth.uid()
    )
  );

-- Políticas RLS para responsáveis (baseado no DFD)
CREATE POLICY "Usuários podem visualizar responsáveis de seus DFDs"
  ON public.responsaveis FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dfds
      WHERE dfds.id = responsaveis.dfd_id
      AND dfds.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar responsáveis em seus DFDs"
  ON public.responsaveis FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dfds
      WHERE dfds.id = responsaveis.dfd_id
      AND dfds.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar responsáveis de seus DFDs"
  ON public.responsaveis FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dfds
      WHERE dfds.id = responsaveis.dfd_id
      AND dfds.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar responsáveis de seus DFDs"
  ON public.responsaveis FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.dfds
      WHERE dfds.id = responsaveis.dfd_id
      AND dfds.user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at em DFDs
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dfds_updated_at
  BEFORE UPDATE ON public.dfds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar valor total do DFD
CREATE OR REPLACE FUNCTION public.update_dfd_valor_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.dfds
  SET valor_total = (
    SELECT COALESCE(SUM(valor_total), 0)
    FROM public.materiais_servicos
    WHERE dfd_id = COALESCE(NEW.dfd_id, OLD.dfd_id)
  )
  WHERE id = COALESCE(NEW.dfd_id, OLD.dfd_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dfd_valor_total_on_material_change
  AFTER INSERT OR UPDATE OR DELETE ON public.materiais_servicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_dfd_valor_total();