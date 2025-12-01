-- Criar tabela de catálogo de materiais/serviços
CREATE TABLE public.catalogo_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_item TEXT UNIQUE,
  tipo tipo_material_servico NOT NULL,
  descricao TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  valor_unitario_referencia NUMERIC,
  especificacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_catalogo_itens_tipo ON public.catalogo_itens(tipo);
CREATE INDEX idx_catalogo_itens_unidade ON public.catalogo_itens(unidade_medida);
CREATE INDEX idx_catalogo_itens_ativo ON public.catalogo_itens(ativo);

-- Trigger para updated_at
CREATE TRIGGER update_catalogo_itens_updated_at
BEFORE UPDATE ON public.catalogo_itens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.catalogo_itens ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Usuários autenticados podem visualizar itens ativos do catálogo"
ON public.catalogo_itens
FOR SELECT
USING (ativo = true);

CREATE POLICY "Usuários autenticados podem criar itens no catálogo"
ON public.catalogo_itens
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar itens do catálogo"
ON public.catalogo_itens
FOR UPDATE
USING (true);

-- Inserir alguns itens de exemplo
INSERT INTO public.catalogo_itens (codigo_item, tipo, descricao, unidade_medida, valor_unitario_referencia, especificacoes) VALUES
  ('MAT-001', 'Material', 'Papel A4 75g/m² Branco', 'CX', 25.00, 'Caixa com 2500 folhas (5 resmas de 500 folhas cada)'),
  ('MAT-002', 'Material', 'Caneta Esferográfica Azul', 'UN', 1.50, 'Corpo plástico transparente, ponta média 1.0mm'),
  ('MAT-003', 'Material', 'Grampeador Médio', 'UN', 35.00, 'Capacidade para 20 folhas, grampos 26/6'),
  ('MAT-004', 'Material', 'Toner para Impressora HP LaserJet', 'UN', 280.00, 'Modelo CE285A, rendimento aproximado 1600 páginas'),
  ('MAT-005', 'Material', 'Mesa de Escritório', 'UN', 450.00, '120cm x 60cm, MDP 15mm, cor Nogal'),
  ('MAT-006', 'Material', 'Cadeira Giratória', 'UN', 380.00, 'Assento e encosto em courino, regulagem de altura'),
  ('SRV-001', 'Serviço', 'Manutenção Preventiva de Ar Condicionado', 'UN', 150.00, 'Limpeza de filtros, verificação de gás, teste de funcionamento'),
  ('SRV-002', 'Serviço', 'Limpeza e Conservação', 'M2', 8.50, 'Varrição, lavagem e enceramento por metro quadrado'),
  ('SRV-003', 'Serviço', 'Vigilância Patrimonial', 'Mês', 2500.00, 'Posto 12h diurno, vigilante uniformizado'),
  ('SRV-004', 'Serviço', 'Desenvolvimento de Sistema Web', 'Hora', 120.00, 'Desenvolvimento em React/Node.js por hora técnica'),
  ('SRV-005', 'Serviço', 'Suporte Técnico de TI', 'Hora', 80.00, 'Atendimento remoto ou presencial');