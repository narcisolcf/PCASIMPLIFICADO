# ROTINA DE REVISAO DE ROTAS E ARQUITETURA

**Projeto:** PCA Simplificado
**Data da Auditoria:** 2026-02-12
**Tecnologias:** React 18 + TypeScript + React Router DOM v6 + Supabase + Shadcn UI

---

## Passo 1: Analise Global e Navegacao

### Arquivo de Roteamento Principal

**Arquivo:** `src/App.tsx`
**Biblioteca:** React Router DOM v6.30.1 (`BrowserRouter` + `Routes` + `Route`)

O roteamento e definido de forma flat (sem nested routes nativas do React Router). A hierarquia e representada apenas por prefixos de caminho (ex: `/cadastros/cargos`).

### Estrutura de Navegacao

O aplicativo **nao possui sidebar/menu lateral tradicional**. A navegacao e feita por **cards interativos**:

| Local | Arquivo | Quantidade de Links |
|-------|---------|---------------------|
| Dashboard (Home) | `src/pages/Index.tsx` | 7 cards de navegacao |
| Submenu Cadastros | `src/pages/Cadastros.tsx` | 4 cards de navegacao |

Todas as paginas possuem botao "Voltar" (ArrowLeft) no header, retornando a pagina pai ou ao Dashboard.

### Integracao com Autenticacao

- **Supabase Auth** esta configurado em `src/integrations/supabase/client.ts` com `persistSession: true` e `autoRefreshToken: true`
- **Nenhuma rota possui protecao de autenticacao**
- **Nao existem** componentes de route guard, PrivateRoute ou RequireAuth
- **Nao existe** pagina de login/logout
- **Status:** Todas as rotas sao publicas

### Integracao com Dados

- Supabase e usado para persistencia (queries via React Query)
- Supabase Storage usado para anexos de DFD
- Nenhuma integracao afeta diretamente a navegacao

---

## Passo 2: Mapeamento Hierarquico (Rotas e Sub-rotas)

### Arvore de Rotas

```
/ (Dashboard)
|-- /cadastros (Hub de Cadastros)
|   |-- /cadastros/agentes-publicos
|   |-- /cadastros/unidades-gestoras
|   |-- /cadastros/cargos
|   +-- /cadastros/orcamento
|-- /areas-requisitantes
|-- /catalogo-itens
|-- /dfds
|   +-- /dfds/novo
|-- /consolidacao
|-- /formacao-pca
|-- /aprovacao-pca
+-- * (404 - Catch-all)
```

### Tabela Detalhada de Rotas

| Rota | Componente | Arquivo | Tipo | Protegida? | Status |
|------|-----------|---------|------|------------|--------|
| `/` | `Index` | `src/pages/Index.tsx` | Pagina principal (Dashboard) | Nao | Funcional |
| `/cadastros` | `Cadastros` | `src/pages/Cadastros.tsx` | Hub de navegacao | Nao | Funcional |
| `/cadastros/agentes-publicos` | `AgentesPublicos` | `src/pages/AgentesPublicos.tsx` | CRUD | Nao | Funcional |
| `/cadastros/unidades-gestoras` | `UnidadesGestoras` | `src/pages/UnidadesGestoras.tsx` | CRUD | Nao | Funcional |
| `/cadastros/cargos` | `Cargos` | `src/pages/Cargos.tsx` | CRUD | Nao | Funcional |
| `/cadastros/orcamento` | `Orcamento` | `src/pages/Orcamento.tsx` | Placeholder | Nao | Em desenvolvimento |
| `/areas-requisitantes` | `AreasRequisitantes` | `src/pages/AreasRequisitantes.tsx` | CRUD + Orcamento | Nao | Funcional |
| `/catalogo-itens` | `CatalogoItens` | `src/pages/CatalogoItens.tsx` | CRUD | Nao | Funcional |
| `/dfds` | `DFDs` | `src/pages/DFDs.tsx` | Listagem com tabs | Nao | Funcional |
| `/dfds/novo` | `NovoDFD` | `src/pages/NovoDFD.tsx` | Formulario multi-step | Nao | Funcional |
| `/consolidacao` | `Consolidacao` | `src/pages/Consolidacao.tsx` | Visualizacao consolidada | Nao | Funcional |
| `/formacao-pca` | `FormacaoPCA` | `src/pages/FormacaoPCA.tsx` | Formulario + Download | Nao | Funcional |
| `/aprovacao-pca` | `AprovacaoPCA` | `src/pages/AprovacaoPCA.tsx` | Placeholder | Nao | Em desenvolvimento |
| `*` | `NotFound` | `src/pages/NotFound.tsx` | Erro 404 | Nao | Funcional |

---

## Passo 3: Catalogo de Componentes

### 3.1 Componentes de Pagina (`src/pages/`)

| Componente | Arquivo | Tipo | Descricao |
|-----------|---------|------|-----------|
| `Index` | `src/pages/Index.tsx` | Visual (Dashboard) | 7 cards de navegacao para os modulos |
| `Cadastros` | `src/pages/Cadastros.tsx` | Visual (Hub) | 4 cards para sub-cadastros |
| `AgentesPublicos` | `src/pages/AgentesPublicos.tsx` | Funcional (CRUD) | Tabela + Dialog com formatacao CPF/telefone |
| `UnidadesGestoras` | `src/pages/UnidadesGestoras.tsx` | Funcional (CRUD) | Tabela + Dialog com gestao de orcamento |
| `Cargos` | `src/pages/Cargos.tsx` | Funcional (CRUD) | Tabela + Dialog simples |
| `Orcamento` | `src/pages/Orcamento.tsx` | Visual (Placeholder) | Pagina em desenvolvimento |
| `AreasRequisitantes` | `src/pages/AreasRequisitantes.tsx` | Funcional (CRUD) | Gestao de areas e distribuicao de orcamento |
| `CatalogoItens` | `src/pages/CatalogoItens.tsx` | Funcional (CRUD) | Catalogo de materiais e servicos |
| `DFDs` | `src/pages/DFDs.tsx` | Funcional (Listagem) | Tabs (Meus DFDs, DFDs da UASG, Lixeira) |
| `NovoDFD` | `src/pages/NovoDFD.tsx` | Funcional (Formulario) | Formulario multi-step com PDF export |
| `Consolidacao` | `src/pages/Consolidacao.tsx` | Funcional (Visualizacao) | Agrupamento expansivel por classe |
| `FormacaoPCA` | `src/pages/FormacaoPCA.tsx` | Funcional (Formulario) | Formulario PCA + botao download |
| `AprovacaoPCA` | `src/pages/AprovacaoPCA.tsx` | Visual (Placeholder) | Pagina em desenvolvimento |
| `NotFound` | `src/pages/NotFound.tsx` | Visual (Erro) | Pagina 404 |

### 3.2 Componentes de Funcionalidade (`src/components/`)

| Componente | Arquivo | Tipo | Usado Em |
|-----------|---------|------|----------|
| `AnexosDFD` | `src/components/AnexosDFD.tsx` | Funcional (Upload) | NovoDFD |
| `MateriaisServicos` | `src/components/MateriaisServicos.tsx` | Funcional (CRUD Table) | NovoDFD |
| `ResponsaveisDFD` | `src/components/ResponsaveisDFD.tsx` | Funcional (CRUD Table) | NovoDFD |
| `SelecionarItemCatalogo` | `src/components/SelecionarItemCatalogo.tsx` | Funcional (Dialog/Picker) | MateriaisServicos |
| `NavLink` | `src/components/NavLink.tsx` | Funcional (Navegacao) | Wrapper de NavLink |

### 3.3 Componentes de Formulario (`src/components/formulario/`)

| Componente | Arquivo | Tipo | Usado Em |
|-----------|---------|------|----------|
| `FormularioPCA` | `src/components/formulario/FormularioPCA.tsx` | Funcional (Form multi-secao) | FormacaoPCA |
| `DadosRequisitante` | `src/components/formulario/DadosRequisitante.tsx` | Funcional (Secao de form) | FormularioPCA |
| `ItemContratacao` | `src/components/formulario/ItemContratacao.tsx` | Funcional (Secao repetivel) | FormularioPCA |

### 3.4 Componentes de Relatorio (`src/components/relatorios/`)

| Componente | Arquivo | Tipo | Usado Em |
|-----------|---------|------|----------|
| `RelatorioPCADownload` | `src/components/relatorios/RelatorioPCADownload.tsx` | Funcional (Botao + PDF) | FormacaoPCA |

### 3.5 Componentes UI - Shadcn (`src/components/ui/`)

58 componentes de design system (Shadcn UI). Principais utilizados:

**Layout:** accordion, card, carousel, collapsible, scroll-area, separator, sidebar, tabs
**Formularios:** button, checkbox, form, input, label, radio-group, select, slider, switch, textarea, calendar
**Dialogs/Overlays:** alert-dialog, dialog, drawer, popover, sheet, tooltip, hover-card
**Navegacao:** command, context-menu, dropdown-menu, menubar, navigation-menu, pagination
**Feedback:** alert, badge, progress, skeleton, sonner (Toaster), toast
**Dados:** avatar, chart, table, toggle, toggle-group

---

## Passo 4: Validacao e Testes (Checklist)

### Rota `/`
- [x] Aponta para `src/pages/Index.tsx` — caminho correto
- [x] Componente `Index` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/cadastros`
- [x] Aponta para `src/pages/Cadastros.tsx` — caminho correto
- [x] Componente `Cadastros` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/cadastros/agentes-publicos`
- [x] Aponta para `src/pages/AgentesPublicos.tsx` — caminho correto
- [x] Componente `AgentesPublicos` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/cadastros/unidades-gestoras`
- [x] Aponta para `src/pages/UnidadesGestoras.tsx` — caminho correto
- [x] Componente `UnidadesGestoras` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/cadastros/cargos`
- [x] Aponta para `src/pages/Cargos.tsx` — caminho correto
- [x] Componente `Cargos` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/cadastros/orcamento`
- [x] Aponta para `src/pages/Orcamento.tsx` — caminho correto
- [x] Componente `Orcamento` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/areas-requisitantes`
- [x] Aponta para `src/pages/AreasRequisitantes.tsx` — caminho correto
- [x] Componente `AreasRequisitantes` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/catalogo-itens`
- [x] Aponta para `src/pages/CatalogoItens.tsx` — caminho correto
- [x] Componente `CatalogoItens` existe e exporta default (named function)
- [x] Sem conflitos de URL

### Rota `/dfds`
- [x] Aponta para `src/pages/DFDs.tsx` — caminho correto
- [x] Componente `DFDs` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/dfds/novo`
- [x] Aponta para `src/pages/NovoDFD.tsx` — caminho correto
- [x] Componente `NovoDFD` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/consolidacao`
- [x] Aponta para `src/pages/Consolidacao.tsx` — caminho correto
- [x] Componente `Consolidacao` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/formacao-pca`
- [x] Aponta para `src/pages/FormacaoPCA.tsx` — caminho correto
- [x] Componente `FormacaoPCA` existe e exporta default
- [x] Sem conflitos de URL

### Rota `/aprovacao-pca`
- [x] Aponta para `src/pages/AprovacaoPCA.tsx` — caminho correto
- [x] Componente `AprovacaoPCA` existe e exporta default
- [x] Sem conflitos de URL

### Rota `*` (Catch-all)
- [x] Aponta para `src/pages/NotFound.tsx` — caminho correto
- [x] Componente `NotFound` existe e exporta default
- [x] Posicionada como ultima rota (correto)

---

## Resumo da Auditoria

| Metrica | Valor |
|---------|-------|
| Total de rotas | 14 (13 nomeadas + 1 catch-all) |
| Rotas funcionais | 12 |
| Rotas em desenvolvimento | 2 (`/cadastros/orcamento`, `/aprovacao-pca`) |
| Rotas protegidas | 0 |
| Rotas publicas | 14 |
| Rotas duplicadas | 0 |
| Conflitos de URL | 0 |
| Componentes de pagina | 14 |
| Componentes de funcionalidade | 5 |
| Componentes de formulario | 3 |
| Componentes de relatorio | 1 |
| Componentes UI (Shadcn) | 58 |
| **Total de componentes** | **81** |

### Observacoes Importantes

1. **Sem autenticacao:** Nenhuma rota e protegida. Supabase Auth esta configurado mas nao implementado nas rotas.
2. **Sem lazy loading:** Todos os imports sao estaticos. Considerar `React.lazy()` para melhorar performance.
3. **Sem rotas dinamicas:** Nao existem rotas com parametros (ex: `/dfds/:id`). A edicao de DFDs pode precisar disso.
4. **Sem nested routes:** A estrutura e flat. Rotas como `/cadastros/*` poderiam usar `<Outlet>` para layout compartilhado.
5. **NavLink nao utilizado:** O componente `NavLink.tsx` existe mas a navegacao usa `<Link>` diretamente.
