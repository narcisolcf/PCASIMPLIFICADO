-- Função auxiliar para pegar o perfil do usuário logado
CREATE OR REPLACE FUNCTION public.get_user_perfil()
RETURNS public.perfil_usuario AS $$
DECLARE
  v_email text;
  v_perfil public.perfil_usuario;
BEGIN
  -- Tenta pegar o email do JWT (auth.jwt() -> 'email')
  v_email := auth.jwt() ->> 'email';
  
  IF v_email IS NULL THEN
    RETURN 'requisitante'::public.perfil_usuario;
  END IF;

  SELECT perfil INTO v_perfil
  FROM public.agentes_publicos
  WHERE email = v_email
  LIMIT 1;

  IF v_perfil IS NULL THEN
    RETURN 'requisitante'::public.perfil_usuario;
  END IF;

  RETURN v_perfil;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar Políticas da Tabela DFDS

-- 1. Drops policies existentes para recriar
DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios DFDs" ON public.dfds;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios DFDs" ON public.dfds;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios DFDs" ON public.dfds;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios DFDs" ON public.dfds;

-- 2. Recriar Políticas

-- SELECT: Admin/Gestor vê tudo. Requisitante vê os seus.
CREATE POLICY "DFDs - Visualização"
ON public.dfds
FOR SELECT
USING (
  public.get_user_perfil() IN ('admin', 'gestor')
  OR
  auth.uid() = user_id
);

-- UPDATE: Admin/Gestor altera qualquer um. Requisitante altera os seus (com restrição de status idealmente, mas por enquanto vamos manter permissivo no owner para não quebrar fluxo de edição).
CREATE POLICY "DFDs - Edição"
ON public.dfds
FOR UPDATE
USING (
  public.get_user_perfil() IN ('admin', 'gestor')
  OR
  auth.uid() = user_id
);

-- INSERT: Qualquer autenticado (mantém lógica de criação)
CREATE POLICY "DFDs - Criação"
ON public.dfds
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- DELETE: Apenas owner (por enquanto) ou Admin
CREATE POLICY "DFDs - Exclusão"
ON public.dfds
FOR DELETE
USING (
  public.get_user_perfil() = 'admin'
  OR
  auth.uid() = user_id
);
