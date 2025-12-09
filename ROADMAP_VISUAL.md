# 🗺️ ROADMAP VISUAL - PCA CAMOCIM

## 📊 Status Atual vs MVP Proposto

```
┌─────────────────────────────────────────────────────────────────┐
│                     CÓDIGO ATUAL (GITHUB)                        │
│                                                                   │
│  ✅ Frontend: React + TypeScript + Shadcn-ui                     │
│  ✅ Backend: Supabase (PostgreSQL + Auth + Storage)              │
│  ✅ 13 Tabelas SQL (756 linhas)                                  │
│  ✅ 40+ Componentes UI                                           │
│  ✅ 12 Páginas Funcionais                                        │
│  ✅ 6 Hooks Customizados                                         │
│  ✅ Autenticação + RLS                                           │
│  ✅ CRUD Completo: UASGs, Áreas, DFDs, Catálogo                 │
│  ⚠️ Em Desenvolvimento: Formação PCA, Aprovação, Consolidação   │
└─────────────────────────────────────────────────────────────────┘
                              VS
┌─────────────────────────────────────────────────────────────────┐
│                       MVP PROPOSTO (PROMPT)                      │
│                                                                   │
│  📋 Frontend: React + TypeScript + Componentes Customizados      │
│  📋 Backend: Express.js + Google Drive API                       │
│  📋 Sem Banco de Dados Relacional                                │
│  📋 4 Componentes UI Básicos                                     │
│  📋 2 Páginas: Formulário + Cadastro                             │
│  📋 1 Hook Simples                                               │
│  ❌ Sem Autenticação                                             │
│  📋 Funcionalidades: Formulário PCA + Cadastro Unidades          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 DECISÃO ESTRATÉGICA

### ✅ CENÁRIO RECOMENDADO: Adicionar MVP ao Sistema Atual

```
CÓDIGO ATUAL (Preservar)  +  FEATURES MVP (Adicionar)  =  SISTEMA COMPLETO
      100%                         10-15%                     110-115%
```

**Por quê?**
- ✅ Preserva trabalho de meses
- ✅ Arquitetura superior (Supabase > Express + Drive)
- ✅ Adiciona funcionalidades sem perder nada
- ✅ Menor risco, maior retorno

---

## 📅 CRONOGRAMA DE IMPLEMENTAÇÃO

### 🟢 FASE 1: Preparação (Semana 1)
```
Duração: 5 dias
Esforço: 1 desenvolvedor

[✓] Revisar relatório comparativo
[✓] Decisão de arquitetura
[✓] Criar issues no GitHub
[✓] Setup de ambiente
[✓] Definir prioridades
```

---

### 🟡 FASE 2: Core do MVP (Semanas 2-3)
```
Duração: 10 dias
Esforço: 1-2 desenvolvedores

📁 src/hooks/
[░░░░░░░░░░] useFormularioPCA.ts (0%)
  ├─ Validações de formulário
  ├─ Estado local-first
  ├─ Integração com Supabase
  └─ Handlers de envio

📁 src/components/formulario/
[░░░░░░░░░░] DadosRequisitante.tsx (0%)
  ├─ Select de Unidade Gestora
  ├─ Campos de responsável
  └─ Validações em tempo real

[░░░░░░░░░░] ItemContratacao.tsx (0%)
  ├─ Adaptação de MateriaisServicos.tsx
  ├─ Tipos: Material, Serviço, Obra, Eng.
  ├─ Prioridade e data pretendida
  └─ Cálculos automáticos

[░░░░░░░░░░] FormularioPCA.tsx (0%)
  ├─ Orquestração de componentes
  ├─ Fluxo de envio
  └─ Feedback ao usuário
```

---

### 🟠 FASE 3: Integração (Semana 4)
```
Duração: 5 dias
Esforço: 1 desenvolvedor

📁 supabase/migrations/
[░░░░░░░░░░] add_pca_fields.sql (0%)
  ├─ ALTER TABLE materiais_servicos
  │   ├─ ADD prioridade (Alta, Média, Baixa)
  │   ├─ ADD data_pretendida DATE
  │   └─ MODIFY tipo ENUM (+Obra, +Serviço Eng.)
  └─ CREATE TABLE requisicoes_pca (opcional)

📁 src/pages/
[██░░░░░░░░] FormacaoPCA.tsx (20% atual → 100%)
  ├─ Integrar FormularioPCA
  ├─ Listagem de requisições
  └─ Filtros e busca

📁 src/utils/
[████░░░░░░] exportDFDtoPDF.ts (40% → adaptar para PCA)
  ├─ Formato PCA vs DFD
  ├─ Campos adicionais
  └─ Logo e cabeçalho Camocim
```

---

### 🔵 FASE 4: Exportação e Armazenamento (Semana 5)
```
Duração: 5 dias
Esforço: 1 desenvolvedor

📁 src/utils/
[░░░░░░░░░░] exportPCAtoJSON.ts (0%)
  ├─ Serializar dados do formulário
  ├─ Download automático
  └─ Preview antes de salvar

🔶 OPCIONAL: Integração Google Drive
[░░░░░░░░░░] supabase/functions/sync-to-drive/ (0%)
  ├─ Autenticação Service Account
  ├─ Criar pastas por unidade
  ├─ Upload de PDF + JSON
  └─ Webhook de confirmação
```

---

### 🟣 FASE 5: Testes e Ajustes (Semana 6)
```
Duração: 5 dias
Esforço: 1-2 desenvolvedores

[░░░░░░░░░░] Testes unitários (useFormularioPCA)
[░░░░░░░░░░] Testes de integração (fluxo completo)
[░░░░░░░░░░] Testes de validação (CPF, orçamento, etc)
[░░░░░░░░░░] Testes de exportação (PDF, JSON)
[░░░░░░░░░░] Correções de bugs
[░░░░░░░░░░] Revisão de código
```

---

### 🟢 FASE 6: Deploy (Semana 7)
```
Duração: 3 dias
Esforço: 1 desenvolvedor + DevOps

[░░░░░░░░░░] Deploy em staging
[░░░░░░░░░░] Testes de aceitação
[░░░░░░░░░░] Documentação de usuário
[░░░░░░░░░░] Treinamento de usuários
[░░░░░░░░░░] Deploy em produção
[░░░░░░░░░░] Monitoramento pós-deploy
```

---

## 🎯 ENTREGAS POR FASE

| Fase | Duração | Entregável Principal | Status |
|------|---------|---------------------|--------|
| 1 | 5 dias | Plano detalhado + Issues | 🟢 Pronto para iniciar |
| 2 | 10 dias | Hook + Componentes MVP | ⚪ Aguardando Fase 1 |
| 3 | 5 dias | Integração com sistema | ⚪ Aguardando Fase 2 |
| 4 | 5 dias | Exportação JSON/PDF | ⚪ Aguardando Fase 3 |
| 5 | 5 dias | Sistema testado | ⚪ Aguardando Fase 4 |
| 6 | 3 dias | Sistema em produção | ⚪ Aguardando Fase 5 |
| **TOTAL** | **33 dias** | **MVP integrado ao sistema** | **0% Completo** |

---

## 🔥 CONFLITOS CRÍTICOS

### CONFLITO #1: Arquitetura Backend
```diff
- MVP Proposto: Express.js + Google Drive
+ Código Atual: Supabase (PostgreSQL)
! Decisão: MANTER SUPABASE (superior)
```

### CONFLITO #2: Componentes UI
```diff
- MVP Proposto: Componentes customizados simples
+ Código Atual: Shadcn-ui (40+ componentes)
! Decisão: MANTER SHADCN-UI (acessibilidade)
```

### CONFLITO #3: Tipos de Item
```diff
- Código Atual: tipo ENUM ('Material', 'Serviço')
+ MVP Proposto: tipo ENUM (+' Obra', +'Serviço de Eng.')
! Solução: Migration para expandir ENUM
```

### CONFLITO #4: Campos Faltantes
```diff
- Código Atual: materiais_servicos sem prioridade/data_pretendida
+ MVP Proposto: ItemContratacao com esses campos
! Solução: Migration para adicionar campos
```

---

## 📊 MATRIZ DE COMPATIBILIDADE

| Feature | Atual | MVP | Ação |
|---------|-------|-----|------|
| Cadastro Unidades | ✅ Completo | ✅ Básico | ✅ Manter atual |
| Formulário PCA | ❌ Ausente | ✅ Proposto | 🟢 Implementar |
| Gestão Materiais | ✅ Avançado | ✅ Básico | 🟡 Expandir |
| Exportação PDF | ✅ Sim (DFD) | ✅ Sim (PCA) | 🟡 Adaptar |
| Exportação JSON | ❌ Não | ✅ Sim | 🟢 Implementar |
| Google Drive | ❌ Não | ✅ Sim | 🔶 Opcional |
| Autenticação | ✅ Sim | ❌ Não | ✅ Manter |
| Banco Dados | ✅ PostgreSQL | ❌ Arquivos | ✅ Manter |

**Legenda:**
- ✅ Manter atual (já superior)
- 🟢 Implementar (feature nova)
- 🟡 Expandir (melhorar existente)
- 🔶 Opcional (avaliar necessidade)

---

## 🚀 QUICK START - Próximos 3 Dias

### Dia 1: Análise
```bash
# 1. Clonar ou atualizar repositório
git checkout -b feature/mvp-pca-integration

# 2. Revisar relatório completo
cat RELATORIO_COMPARATIVO_ROADMAP.md

# 3. Criar issues no GitHub
# Issue #1: Implementar useFormularioPCA.ts
# Issue #2: Criar componente DadosRequisitante.tsx
# Issue #3: Criar componente ItemContratacao.tsx
# Issue #4: Completar FormularioPCA.tsx
# Issue #5: Migration para novos campos
# Issue #6: Exportação JSON
```

### Dia 2: Setup
```bash
# 1. Criar estrutura de pastas
mkdir -p src/components/formulario
mkdir -p src/hooks/pca

# 2. Criar arquivos base
touch src/hooks/useFormularioPCA.ts
touch src/components/formulario/DadosRequisitante.tsx
touch src/components/formulario/ItemContratacao.tsx
touch src/components/formulario/FormularioPCA.tsx

# 3. Criar migration
npx supabase migration new add_pca_fields
```

### Dia 3: Primeiros Commits
```bash
# 1. Implementar useFormularioPCA (esqueleto)
# 2. Criar DadosRequisitante (estrutura básica)
# 3. Commit inicial
git add .
git commit -m "feat: initialize MVP PCA integration - hooks and components structure"
```

---

## 📈 KPIs de Sucesso

### Métricas Técnicas:
- [ ] 100% dos componentes do MVP implementados
- [ ] 0 regressões em funcionalidades existentes
- [ ] Cobertura de testes > 80%
- [ ] Performance: formulário < 2s para salvar

### Métricas de Negócio:
- [ ] Formulário PCA funcional
- [ ] Exportação PDF + JSON implementada
- [ ] Validações em conformidade com Lei 14.133/2021
- [ ] Usuários conseguem criar requisições PCA

---

## 🎓 Recursos e Referências

### Documentação:
- [Código Atual - PLANO_IMPLEMENTACAO_TABELAS.md](./PLANO_IMPLEMENTACAO_TABELAS.md)
- [Supabase Docs](https://supabase.com/docs)
- [Shadcn-ui Components](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)

### Migrations Existentes:
```bash
ls supabase/migrations/
# 13 arquivos SQL (756 linhas total)
```

### Componentes Reutilizáveis:
```typescript
// Já implementados e prontos para uso:
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"

// Hooks prontos:
import { useUASGs } from "@/hooks/useUASGs"
import { useAreasRequisitantes } from "@/hooks/useAreasRequisitantes"
import { useCatalogoItens } from "@/hooks/useCatalogoItens"
```

---

## ✅ CHECKLIST FINAL PRÉ-IMPLEMENTAÇÃO

- [ ] Relatório completo revisado e aprovado
- [ ] Cenário 1 (recomendado) escolhido oficialmente
- [ ] Issues criadas no GitHub
- [ ] Branch `feature/mvp-pca-integration` criada
- [ ] Desenvolvedores alocados (1-2 pessoas)
- [ ] Prazo definido (33 dias úteis)
- [ ] Stakeholders alinhados
- [ ] Reunião de kickoff agendada

---

**Status do Roadmap:** 🟢 PRONTO PARA INICIAR

**Próxima Ação:** Reunião de aprovação com stakeholders
