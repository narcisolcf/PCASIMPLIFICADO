# 📋 Instruções para Aplicar Migrations Manualmente no Supabase

## ⚠️ Situação Atual
As tabelas do banco já existem (criadas anteriormente no Lovable/Dashboard), mas as **2 novas migrations** precisam ser aplicadas:

1. `20251201170000_add_uasg_budget_validation.sql` - Validação de orçamento UASG
2. `20251201171000_fix_responsaveis_schema.sql` - Correção do schema de responsáveis

## 🎯 Passo a Passo

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. **Acesse o SQL Editor:**
   - URL: https://supabase.com/dashboard/project/yddqhqobsxgvpgfnfsbo/sql/new

2. **Aplique a Migration 1 (Validação de Orçamento):**
   ```sql
   -- Migration 1: UASG Budget Validation
   CREATE OR REPLACE FUNCTION public.validate_area_orcamento()
   RETURNS TRIGGER AS $$
   DECLARE
     uasg_orcamento DECIMAL;
     total_areas_atual DECIMAL;
     total_outras_areas DECIMAL;
   BEGIN
     SELECT disponibilidade_orcamentaria INTO uasg_orcamento
     FROM public.uasgs
     WHERE id = NEW.uasg_id;

     IF uasg_orcamento IS NULL THEN
       RETURN NEW;
     END IF;

     SELECT COALESCE(SUM(disponibilidade_orcamentaria), 0) INTO total_outras_areas
     FROM public.areas_requisitantes
     WHERE uasg_id = NEW.uasg_id
       AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

     total_areas_atual := total_outras_areas + NEW.disponibilidade_orcamentaria;

     IF total_areas_atual > uasg_orcamento THEN
       RAISE EXCEPTION 'Orçamento total das áreas (R$ %) excede o orçamento da UASG (R$ %). Disponível: R$ %',
         total_areas_atual,
         uasg_orcamento,
         (uasg_orcamento - total_outras_areas);
     END IF;

     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   DROP TRIGGER IF EXISTS check_area_orcamento_before_insert_update ON public.areas_requisitantes;

   CREATE TRIGGER check_area_orcamento_before_insert_update
     BEFORE INSERT OR UPDATE ON public.areas_requisitantes
     FOR EACH ROW
     EXECUTE FUNCTION public.validate_area_orcamento();

   COMMENT ON FUNCTION public.validate_area_orcamento() IS
   'Validates that the sum of all areas_requisitantes budgets does not exceed the parent UASG budget';
   ```

3. **Clique em "RUN"** para executar

4. **Aplique a Migration 2 (Schema de Responsáveis):**
   ```sql
   -- Migration 2: Fix responsaveis schema
   DO $$
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'responsaveis' AND column_name = 'funcao_id') THEN
       ALTER TABLE public.responsaveis
       ADD COLUMN funcao_id UUID REFERENCES public.funcoes(id) ON DELETE SET NULL;
     END IF;

     IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'responsaveis' AND column_name = 'cargo_id') THEN
       ALTER TABLE public.responsaveis
       ADD COLUMN cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL;
     END IF;
   END $$;

   UPDATE public.responsaveis r
   SET funcao_id = f.id
   FROM public.funcoes f
   WHERE LOWER(r.funcao::text) = LOWER(f.nome)
   AND r.funcao_id IS NULL;

   UPDATE public.responsaveis r
   SET cargo_id = c.id
   FROM public.cargos c
   WHERE LOWER(r.cargo) = LOWER(c.nome)
   AND r.cargo_id IS NULL;

   ALTER TABLE public.responsaveis ALTER COLUMN funcao DROP NOT NULL;
   ALTER TABLE public.responsaveis ALTER COLUMN cargo DROP NOT NULL;

   COMMENT ON COLUMN public.responsaveis.funcao_id IS 'Foreign key to funcoes table (new schema)';
   COMMENT ON COLUMN public.responsaveis.cargo_id IS 'Foreign key to cargos table (new schema)';
   COMMENT ON COLUMN public.responsaveis.funcao IS 'Deprecated: Use funcao_id instead';
   COMMENT ON COLUMN public.responsaveis.cargo IS 'Deprecated: Use cargo_id instead';
   ```

5. **Clique em "RUN"** novamente

### Opção 2: Arquivo SQL Consolidado

Use o arquivo `apply_new_migrations.sql` que foi criado na raiz do projeto. Ele contém ambas as migrations em um único arquivo.

## ✅ Validação

Após aplicar as migrations, verifique:

1. **Trigger criado:**
   ```sql
   SELECT tgname FROM pg_trigger WHERE tgname = 'check_area_orcamento_before_insert_update';
   ```

2. **Novas colunas criadas:**
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'responsaveis' AND column_name IN ('funcao_id', 'cargo_id');
   ```

## 🚀 Resultado Esperado

- ✅ Áreas requisitantes não podem exceder orçamento da UASG
- ✅ Responsáveis agora usam FK para funcoes e cargos
- ✅ Sistema pronto para produção
- ✅ Deploy na Vercel funcionando com novo schema

---

**Nota:** Essas migrations são **idempotentes** (podem ser executadas múltiplas vezes sem causar erros).
