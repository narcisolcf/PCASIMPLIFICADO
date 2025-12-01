-- Criar bucket de storage para anexos dos DFDs
INSERT INTO storage.buckets (id, name, public)
VALUES ('dfd-anexos', 'dfd-anexos', false);

-- Criar tabela de anexos
CREATE TABLE public.anexos_dfd (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dfd_id UUID NOT NULL,
  nome_arquivo TEXT NOT NULL,
  caminho_storage TEXT NOT NULL,
  tamanho_bytes BIGINT NOT NULL,
  tipo_mime TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID NOT NULL
);

-- Adicionar índice para melhor performance
CREATE INDEX idx_anexos_dfd_dfd_id ON public.anexos_dfd(dfd_id);

-- Habilitar RLS
ALTER TABLE public.anexos_dfd ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela de anexos
CREATE POLICY "Usuários podem visualizar anexos de seus DFDs"
ON public.anexos_dfd
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dfds
    WHERE dfds.id = anexos_dfd.dfd_id
    AND dfds.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar anexos em seus DFDs"
ON public.anexos_dfd
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dfds
    WHERE dfds.id = anexos_dfd.dfd_id
    AND dfds.user_id = auth.uid()
  )
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Usuários podem deletar anexos de seus DFDs"
ON public.anexos_dfd
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.dfds
    WHERE dfds.id = anexos_dfd.dfd_id
    AND dfds.user_id = auth.uid()
  )
);

-- Políticas de storage para o bucket dfd-anexos
CREATE POLICY "Usuários podem fazer upload de anexos em seus DFDs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'dfd-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem visualizar seus próprios anexos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'dfd-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuários podem deletar seus próprios anexos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'dfd-anexos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);