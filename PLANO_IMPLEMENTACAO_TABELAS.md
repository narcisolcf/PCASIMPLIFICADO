# PLANO ESTRUTURADO - IMPLEMENTAÇÃO DE TABELAS E FUNCIONALIDADES

## 📋 SUMÁRIO EXECUTIVO

**Projeto:** Sistema de Plano Contratual Simplificado (PCA)
**Data de Análise:** 01/12/2024
**Status Atual:** Estrutura base implementada, necessita correções e ajustes

---

## 🔍 ANÁLISE DO ESTADO ATUAL

### ✅ O QUE JÁ ESTÁ IMPLEMENTADO

#### 1. Estrutura de Banco de Dados (Migrations)
```sql
✓ Tabela areas_requisitantes
  - id (UUID, PK)
  - numero (SERIAL, auto-incrementado)
  - numero_uasg (TEXT)
  - nome (TEXT)
  - disponibilidade_orcamentaria (DECIMAL)
  - created_at (TIMESTAMP)

✓ Tabela dfds
  - id (UUID, PK)
  - numero (SERIAL, auto-incrementado)
  - area_requisitante_id (FK → areas_requisitantes)
  - descricao_sucinta (TEXT)
  - justificativa_necessidade (TEXT)
  - data_conclusao (DATE)
  - prioridade (ENUM)
  - situacao (ENUM)
  - valor_total (DECIMAL)
  - user_id (FK → auth.users)

✓ Tabela materiais_servicos
  - id (UUID, PK)
  - dfd_id (FK → dfds)
  - tipo (ENUM: Material, Serviço)
  - codigo_item (TEXT)
  - descricao (TEXT)
  - unidade_medida (TEXT)
  - quantidade (INTEGER)
  - valor_unitario (DECIMAL)
  - valor_total (DECIMAL, calculado automaticamente)
  - justificativa (TEXT)

✓ Tabela responsaveis
  - id (UUID, PK)
  - dfd_id (FK → dfds)
  - nome (TEXT)
  - cpf (TEXT)
  - cargo (TEXT)
  - funcao (ENUM: Requisitante, Técnico, Gerente, Fiscal)
  - telefone (TEXT)
  - email (TEXT)

✓ Tabela anexos_dfd (Storage Integration)
  - id (UUID, PK)
  - dfd_id (FK → dfds)
  - nome_arquivo (TEXT)
  - caminho_storage (TEXT)
  - tamanho_bytes (NUMBER)
  - tipo_mime (TEXT)
  - uploaded_by (TEXT)
```

#### 2. Triggers e Functions Implementadas
```sql
✓ update_updated_at_column() - Atualiza timestamp automaticamente
✓ update_dfd_valor_total() - Recalcula valor total do DFD ao modificar materiais
```

#### 3. Row Level Security (RLS)
```sql
✓ Todas as tabelas possuem RLS habilitado
✓ Políticas de acesso configuradas por usuário autenticado
✓ Isolamento de dados por user_id em DFDs
```

#### 4. Componentes React Implementados
```typescript
✓ MateriaisServicos.tsx - Gerenciamento de materiais/serviços
✓ ResponsaveisDFD.tsx - Gerenciamento de responsáveis
✓ AnexosDFD.tsx - Upload e gestão de anexos
✓ SelecionarItemCatalogo.tsx - Importar itens do catálogo
```

#### 5. Hooks Customizados
```typescript
✓ useAreasRequisitantes() - CRUD de áreas requisitantes
✓ useUASGs() - Gestão de UASGs
✓ useCatalogoItens() - Catálogo de materiais/serviços
✓ useFuncoes() - Funções de responsáveis
✓ useCargos() - Cargos
```

---

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **Relacionamento Áreas Requisitantes ↔ UASGs**

**Problema:**
- A tabela `areas_requisitantes` tem campo `uasg_id` (FK), MAS:
  - Não há validação de disponibilidade orçamentária vs. UASG
  - Falta trigger para verificar limite orçamentário

**Impacto:**
- Áreas requisitantes podem ter orçamento maior que a UASG (erro de negócio)

**Solução Necessária:**
```sql
-- Migration a ser criada
CREATE FUNCTION validate_area_orcamento()
RETURNS TRIGGER AS $$
DECLARE
  uasg_orcamento DECIMAL;
BEGIN
  SELECT disponibilidade_orcamentaria INTO uasg_orcamento
  FROM uasgs
  WHERE id = NEW.uasg_id;

  IF NEW.disponibilidade_orcamentaria > uasg_orcamento THEN
    RAISE EXCEPTION 'Orçamento da área (%) excede o da UASG (%)',
      NEW.disponibilidade_orcamentaria, uasg_orcamento;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_area_orcamento_before_insert_update
  BEFORE INSERT OR UPDATE ON areas_requisitantes
  FOR EACH ROW
  EXECUTE FUNCTION validate_area_orcamento();
```

---

### 2. **Tabela `responsaveis` - Divergência de Schema**

**Problema:**
- Migration original define: `funcao` como ENUM `funcao_responsavel`
- TypeScript types definem: `funcao_id` (FK para tabela `funcoes`)
- Componente `ResponsaveisDFD.tsx` espera: `funcao_id` e `cargo_id`

**Impacto:**
- Incompatibilidade entre schema do banco e código TypeScript
- Queries com JOIN em tabelas que não existem no relacionamento

**Solução Necessária:**
```sql
-- Migration para corrigir schema
-- 1. Alterar tabela responsaveis para usar FKs
ALTER TABLE responsaveis DROP COLUMN funcao;
ALTER TABLE responsaveis ADD COLUMN funcao_id UUID REFERENCES funcoes(id);
ALTER TABLE responsaveis DROP COLUMN cargo;
ALTER TABLE responsaveis ADD COLUMN cargo_id UUID REFERENCES cargos(id);

-- 2. Verificar se as tabelas funcoes e cargos existem (já existem por outras migrations)
```

---

### 3. **Modo Local vs. Modo Persistido (DFD não salvo)**

**Problema:**
- Componentes `MateriaisServicos` e `ResponsaveisDFD` suportam dois modos:
  - `isLocalMode`: DFD ainda não foi salvo (apenas em memória)
  - `Modo Persistido`: DFD já existe no banco
- PORÉM: A lógica de transição entre modos está incompleta

**Cenário de Erro:**
1. Usuário adiciona 3 materiais localmente
2. Clica em "Salvar DFD"
3. Sistema salva DFD, mas **não transfere materiais locais para o banco**

**Código Atual em NovoDFD.tsx (linhas 84-99):**
```typescript
// ✅ CORRETO: Salva materiais locais ao criar DFD
if (localMateriais.length > 0) {
  const materiaisParaSalvar = localMateriais.map(m => ({
    dfd_id: data.id,
    tipo: m.tipo,
    descricao: m.descricao,
    // ...
  }));

  await supabase.from("materiais_servicos").insert(materiaisParaSalvar);
}
```

**MAS falta o mesmo para responsáveis!**

**Solução Necessária:**
```typescript
// Adicionar em NovoDFD.tsx após salvar materiais
if (localResponsaveis.length > 0) {
  const responsaveisParaSalvar = localResponsaveis.map(r => ({
    dfd_id: data.id,
    funcao_id: r.funcao_id,
    cargo_id: r.cargo_id,
    nome: r.nome,
    cpf: r.cpf,
    email: r.email,
    telefone: r.telefone,
  }));

  const { error: responsaveisError } = await supabase
    .from("responsaveis")
    .insert(responsaveisParaSalvar);

  if (responsaveisError) {
    console.error("Erro ao salvar responsáveis:", responsaveisError);
    toast.error("Erro ao salvar responsáveis");
  }
}
```

---

### 4. **Validação de CPF - Inconsistência**

**Problema:**
- Hook `useDocumentValidation` foi criado com algoritmo de módulo 11
- Componente `ResponsaveisDFD.tsx` tem formatação manual de CPF
- NÃO há validação de CPF no componente usando o hook

**Solução Necessária:**
```typescript
// Em ResponsaveisDFD.tsx, importar e usar o hook
import { useDocumentValidation } from "@/hooks/useDocumentValidation";

// Dentro do componente
const { validateCPF, formatCPF } = useDocumentValidation();

// No handleSave
if (!validateCPF(formData.cpf)) {
  toast.error("CPF inválido");
  return;
}
```

---

### 5. **Número Sequencial de Áreas Requisitantes**

**Status:** ✅ **JÁ IMPLEMENTADO CORRETAMENTE**
- Campo `numero` usa SERIAL (auto-incremento)
- Não requer ação adicional

---

### 6. **Opção de Criar Nova Área Requisitante no Formulário de DFD**

**Problema:**
- Requisito: "ao clicar em criar novo DFD, deve ter opção de incluir área requisitante"
- Implementação Atual: Apenas dropdown de seleção (sem botão "Criar Nova Área")

**Solução Necessária:**
```tsx
// Em NovoDFD.tsx, adicionar modal de criação de área
const [novaAreaDialog, setNovaAreaDialog] = useState(false);

<Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione a Área Requisitante" />
  </SelectTrigger>
  <SelectContent>
    {areas.map((area) => (
      <SelectItem key={area.id} value={area.id}>
        {area.numero} - {area.nome}
      </SelectItem>
    ))}
    <Button onClick={() => setNovaAreaDialog(true)} variant="ghost" className="w-full">
      + Nova Área Requisitante
    </Button>
  </SelectContent>
</Select>

{/* Dialog para criar nova área inline */}
```

---

## 🛠️ PLANO DE IMPLEMENTAÇÃO

### FASE 1: Correções Críticas (Alta Prioridade)

#### 1.1. Migration para Validação de Orçamento UASG
**Arquivo:** `supabase/migrations/YYYYMMDD_add_uasg_budget_validation.sql`
```sql
-- Criar função de validação
-- Criar trigger BEFORE INSERT/UPDATE
```
**Responsável:** Backend/Database
**Tempo Estimado:** 2 horas

#### 1.2. Migration para Corrigir Schema de Responsáveis
**Arquivo:** `supabase/migrations/YYYYMMDD_fix_responsaveis_schema.sql`
```sql
-- Alterar colunas funcao e cargo para usar FKs
```
**Responsável:** Backend/Database
**Tempo Estimado:** 1 hora

#### 1.3. Corrigir Salvamento de Responsáveis Locais
**Arquivo:** `src/pages/NovoDFD.tsx`
**Alteração:** Adicionar bloco de insert de responsáveis após salvar DFD
**Responsável:** Frontend
**Tempo Estimado:** 1 hora

---

### FASE 2: Melhorias de UX (Média Prioridade)

#### 2.1. Adicionar Botão "Nova Área" no Formulário de DFD
**Arquivo:** `src/pages/NovoDFD.tsx`
**Componente:** Dialog modal para criação inline de área requisitante
**Responsável:** Frontend
**Tempo Estimado:** 3 horas

#### 2.2. Integrar Validação de CPF no Componente de Responsáveis
**Arquivo:** `src/components/ResponsaveisDFD.tsx`
**Alteração:** Usar hook `useDocumentValidation` para validar CPF
**Responsável:** Frontend
**Tempo Estimado:** 1 hora

---

### FASE 3: Validações e Testes (Média Prioridade)

#### 3.1. Testes de Integração - Fluxo Completo de DFD
**Cenários:**
1. Criar DFD com materiais e responsáveis locais → Salvar → Verificar persistência
2. Tentar criar área com orçamento > UASG → Verificar erro
3. Adicionar material → Verificar recálculo automático de valor_total

**Responsável:** QA/Frontend
**Tempo Estimado:** 4 horas

---

## 📊 RESUMO DE ENTREGAS

| Fase | Tarefa | Arquivo(s) | Status | Prioridade |
|------|--------|-----------|--------|------------|
| 1.1 | Validação Orçamento UASG | Migration SQL | ❌ Pendente | 🔴 Alta |
| 1.2 | Corrigir Schema Responsáveis | Migration SQL | ❌ Pendente | 🔴 Alta |
| 1.3 | Salvar Responsáveis Locais | NovoDFD.tsx | ❌ Pendente | 🔴 Alta |
| 2.1 | Botão "Nova Área" | NovoDFD.tsx | ❌ Pendente | 🟡 Média |
| 2.2 | Validação CPF | ResponsaveisDFD.tsx | ❌ Pendente | 🟡 Média |
| 3.1 | Testes de Integração | Múltiplos | ❌ Pendente | 🟡 Média |

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Criar migration para validação de orçamento UASG**
2. **Corrigir schema da tabela responsaveis**
3. **Adicionar lógica de salvamento de responsáveis locais em NovoDFD**
4. **Testar fluxo completo de criação de DFD**

---

## 📝 OBSERVAÇÕES TÉCNICAS

### Tecnologias Validadas:
- ✅ Supabase PostgreSQL 13.x
- ✅ React 18 + TypeScript
- ✅ Row Level Security (RLS) configurado
- ✅ Triggers automáticos funcionando

### Pontos de Atenção:
- ⚠️ Migrations devem ser aplicadas em ordem cronológica
- ⚠️ Testar RLS policies após cada alteração de schema
- ⚠️ Validar tipos TypeScript após alterar database types

---

**Documento gerado em:** 01/12/2024
**Última atualização:** 01/12/2024
**Versão:** 1.0
