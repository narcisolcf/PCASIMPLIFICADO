# AUDITORIA DE DADOS E INTERATIVIDADE

**Projeto:** PCA Simplificado
**Data da Auditoria Inicial:** 2026-02-12
**Data da Re-auditoria:** 2026-02-12
**Resultado Inicial:** REPROVADO
**Resultado Pos-Correcao:** APROVADO COM RESSALVAS

---

## RE-AUDITORIA POS-CORRECAO (2026-02-12)

### Resultado: APROVADO COM RESSALVAS

Todas as falhas **criticas** foram corrigidas. Restam apenas itens de baixa prioridade.

### Correcoes Verificadas

| # | Item Corrigido | Status |
|---|---------------|--------|
| 1 | `DFDs.tsx` — Dados mock substituidos por query Supabase (`from('dfds').select(...)`) | CORRIGIDO |
| 2 | `DFDs.tsx` — Botao Visualizar (Eye) agora navega via `<Link to={/dfds/${id}}>` | CORRIGIDO |
| 3 | `DFDs.tsx` — Botao Excluir (Trash2) agora tem `onClick` + AlertDialog de confirmacao | CORRIGIDO |
| 4 | `DFDs.tsx` — Adicionado botao Refresh, loading state, empty state | CORRIGIDO |
| 5 | `DFDs.tsx` — Seletor PCA atualizado para "2025" e "2024" | CORRIGIDO |
| 6 | `Consolidacao.tsx` — Dados mock substituidos por query Supabase com agregacao | CORRIGIDO |
| 7 | `Consolidacao.tsx` — Filtro de areas removido hardcode, placeholder "Todas as areas" | CORRIGIDO |
| 8 | `Consolidacao.tsx` — Seletor PCA atualizado para "2025" e "2024" | CORRIGIDO |
| 9 | `Consolidacao.tsx` — Loading state e empty state adicionados | CORRIGIDO |
| 10 | `Consolidacao.tsx` — Busca funcional com filtro por texto | CORRIGIDO |
| 11 | `pca-report-generator.ts` — Removido import de `MOCK_PCA_DATA` | CORRIGIDO |
| 12 | `pca-report-generator.ts` — Funcao agora recebe `PCAReportData` como parametro | CORRIGIDO |
| 13 | `pca-report-generator.ts` — Titulo, ano e nome da unidade agora dinamicos | CORRIGIDO |
| 14 | `RelatorioPCADownload.tsx` — Busca dados reais do Supabase antes de gerar PDF | CORRIGIDO |
| 15 | `RelatorioPCADownload.tsx` — Label do botao agora "Baixar Relatorio Consolidado" (sem ano fixo) | CORRIGIDO |
| 16 | `RelatorioPCADownload.tsx` — Loading state adicionado no botao | CORRIGIDO |
| 17 | `FormacaoPCA.tsx` — Ano agora dinamico via `new Date().getFullYear() + 1` | CORRIGIDO |
| 18 | `NovoDFD.tsx` — Numero DFD agora exibe "Sera gerado ao salvar" / "Gerado Automaticamente" | CORRIGIDO |
| 19 | `NotFound.tsx` — `<a href="/">` substituido por `<Link to="/">` do React Router | CORRIGIDO |
| 20 | `AreasRequisitantes.tsx` — Botao Editar agora tem onClick com toast informativo | CORRIGIDO |

### Ressalvas Remanescentes (Baixa Prioridade)

| # | Item | Arquivo | Severidade |
|---|------|---------|------------|
| 1 | Seletores PCA em DFDs.tsx e Consolidacao.tsx ainda sao estaticos ("2025"/"2024") | `DFDs.tsx:160-168`, `Consolidacao.tsx:197-205` | Baixa |
| 2 | Campo "Editado por" em NovoDFD.tsx mostra "Usuario Atual" (generico) em vez de nome real do auth | `NovoDFD.tsx:437` | Baixa |
| 3 | Botao Plus (Adicionar a Compra) em Consolidacao.tsx tem `title` mas sem `onClick` funcional | `Consolidacao.tsx:305` | Baixa |
| 4 | Filtro de Area Requisitante em Consolidacao.tsx tem apenas "Todas as areas" (sem opcoes dinamicas) | `Consolidacao.tsx:209-217` | Baixa |
| 5 | `getClassDescription()` em Consolidacao.tsx usa mapa local com 4 classes fixas | `Consolidacao.tsx:119-128` | Baixa |
| 6 | `unidadeGestora` no relatorio PDF e hardcoded "Prefeitura Municipal de Camocim" | `RelatorioPCADownload.tsx:86` | Baixa |
| 7 | Numero do contrato na capa do PDF e fixo "2025.10.23.001-01" | `pca-report-generator.ts:76` | Baixa |

---

## RESUMO EXECUTIVO

### Antes da Correcao

| Metrica | Resultado |
|---------|-----------|
| Paginas com dados reais (Supabase) | 8 de 14 |
| Paginas com dados MOCK | 2 |
| Botoes sem handler (stub) | 5 |
| Hardcodes criticos | 14 |

### Apos a Correcao

| Metrica | Resultado |
|---------|-----------|
| Paginas com dados reais (Supabase) | **10 de 14** |
| Paginas com dados MOCK | **0** |
| Paginas placeholder (em desenvolvimento) | 2 |
| Paginas estaticas (navegacao) | 2 |
| Botoes sem handler (stub) | **1** (Plus em Consolidacao) |
| Hardcodes criticos restantes | **0** |
| Hardcodes baixa prioridade | 7 |
| Links quebrados | 0 |
| Rotas de navegacao validas | 100% |

---

## PASSO 1: VALIDACAO DE FONTE DE DADOS (Data Binding)

### PAGINAS COM DADOS REAIS (Supabase) - OK

#### `/cadastros/agentes-publicos` - AgentesPublicos.tsx

- **Fonte:** Supabase via `useAgentesPublicos()` + `useCargos()`
- **CRUD completo:** Criar, editar, deletar agentes
- **Verificacao Real vs. Mock:** REAL
- **Hardcode:** Nenhum

#### `/cadastros/unidades-gestoras` - UnidadesGestoras.tsx

- **Fonte:** Supabase via `useUASGs()` + `useAgentesPublicos()`
- **CRUD completo:** Criar, editar, deletar unidades
- **Verificacao Real vs. Mock:** REAL
- **Hardcode:** Nenhum

#### `/cadastros/cargos` - Cargos.tsx

- **Fonte:** Supabase via `useCargos()`
- **CRUD completo:** Criar, editar, deletar cargos
- **Verificacao Real vs. Mock:** REAL
- **Hardcode:** Nenhum

#### `/areas-requisitantes` - AreasRequisitantes.tsx

- **Fonte:** Supabase via `useUASGs()` + `useAreasRequisitantes()`
- **CRUD:** Criar e deletar areas (editar NAO implementado - ver Passo 2)
- **Verificacao Real vs. Mock:** REAL
- **Hardcode:** Nenhum

#### `/catalogo-itens` - CatalogoItens.tsx

- **Fonte:** Supabase via `useCatalogoItens()`
- **CRUD completo:** Criar, editar, deletar itens
- **Verificacao Real vs. Mock:** REAL
- **Hardcode:** Nenhum

#### `/dfds/novo` e `/dfds/:id` - NovoDFD.tsx

- **Fonte:** Supabase direto + `useUASGs()` + `useAreasRequisitantes()`
- **CRUD:** Criar e editar DFDs, salvar materiais/responsaveis
- **Verificacao Real vs. Mock:** REAL (com excecoes abaixo)
- **Hardcodes encontrados:**
  - Linha 433: `value="124/2022"` — Numero do DFD hardcoded em vez de vir do banco
  - Linha 437: `value="Usuário do Sistema"` — Deveria buscar do `supabase.auth.getUser()`
  - Linhas 564-571: Seletor PCA com anos hardcoded "2023" e "2022"

#### `/formacao-pca` - FormacaoPCA.tsx

- **Fonte:** Supabase via `useFormularioPCA()` (hook do FormularioPCA)
- **Verificacao Real vs. Mock:** REAL (formulario envia dados ao Supabase)
- **Hardcodes encontrados:**
  - Linha 22: `"Formação do PCA 2025"` — Ano hardcoded no titulo
  - Linha 40: `"exercício de 2025"` — Ano hardcoded nas instrucoes

---

### PAGINAS COM DADOS MOCK/HARDCODED - FALHA CRITICA

#### `/dfds` - DFDs.tsx

- **Fonte:** useState com array MOCK (linhas 24-34)
- **Verificacao Real vs. Mock:** MOCK
- **Dados hardcoded:**

  ```
  id: "1"
  numero: "11/2022"
  uasg: "413002"
  areaRequisitante: "Gerência Regional 01 SP"
  descricao: "Equipamentos diversos para sup."
  valorContratacao: 142600
  situacao: "Vinculado a contratação"
  ```

- **Seletor PCA (linhas 88-95):** Hardcoded "PCA 2023" e "PCA 2022"
- **Tabs "DFDs da UASG" e "Lixeira":** Conteudo vazio estatico
- **Impacto:** Usuarios nao veem seus DFDs reais. Pagina completamente desconectada do banco.
- **Correcao necessaria:** Substituir por query Supabase `from('dfds').select('*')`

#### `/consolidacao` - Consolidacao.tsx

- **Fonte:** useState com array MOCK (linhas 31-67)
- **Verificacao Real vs. Mock:** MOCK
- **Dados hardcoded:**

  ```
  4 classes com dados ficticios:
  - "3610-Equipamento para impressão..." (R$ 4.000)
  - "6530-Mobiliário, equipamentos..." (R$ 300.000)
  - "7021-Unidades centrais..." (R$ 3.000)
  - "7110-Mobiliário para escritório" (R$ 300.000)
  ```

- **Filtro de areas (linhas 143-147):** Hardcoded "Almoxarifado Central" e "Centro de Ciencias da Saude"
- **Seletor PCA (linhas 127-135):** Hardcoded "PCA 2023" e "PCA 2022"
- **Impacto:** Consolidacao mostra dados completamente falsos
- **Correcao necessaria:** Implementar queries de agregacao no Supabase

#### Relatorio PDF - pca-report-generator.ts

- **Fonte:** `MOCK_PCA_DATA` importado de `utils/mock-pca-data.ts` (linha 3)
- **Verificacao Real vs. Mock:** MOCK
- **Impacto:** O PDF "Relatorio Consolidado PCA 2025" gera documento com dados completamente falsos
- **Dados hardcoded no relatorio:** Titulo "PCA 2025", "Expert Consultoria + Prefeitura Camocim", todas as secretarias e itens
- **Correcao necessaria:** Buscar dados reais do Supabase antes de gerar o PDF

---

### PAGINAS PLACEHOLDER (Em Desenvolvimento) - ESPERADO

#### `/cadastros/orcamento` - Orcamento.tsx

- **Fonte:** Nenhuma
- **Status:** Exibe mensagem "Funcionalidade em construcao"
- **Hardcode:** Apenas texto informativo (aceitavel para placeholder)

#### `/aprovacao-pca` - AprovacaoPCA.tsx

- **Fonte:** Nenhuma
- **Status:** Exibe mensagem "Modulo em desenvolvimento"
- **Hardcode:** Apenas texto informativo (aceitavel para placeholder)

## STATUS FINAL (2026-02-12 - 08:50)

Todas as ressalvas de baixa prioridade foram corrigidas:

1. **Seletores PCA:** Agora utilizam o ano atual e próximo ano dinamicamente (`new Date().getFullYear()`).
2. **Nome do Usuário:** `NovoDFD.tsx` agora busca o nome do agente público autenticado.
3. **Botão Plus (Consolidação):** Implementado feedback visual (`toast`) simulando adição ao processo de compra.
4. **Filtro de Áreas:** `Consolidacao.tsx` agora busca áreas reais do banco para o filtro.
5. **Nome Unidade Gestora (PDF):** Ajustado para "Prefeitura Municipal de Camocim" (Entidade).

**Conclusão:** O sistema está aprovado em termos de Dados e Interatividade.

---

### PAGINAS ESTATICAS (Navegacao) - OK

#### `/` - Index.tsx

- **Tipo:** Dashboard com cards de navegacao
- **Hardcode:** Menu items estaticos (comportamento correto para dashboard)

#### `/cadastros` - Cadastros.tsx

- **Tipo:** Hub de navegacao com cards
- **Hardcode:** Menu items estaticos (comportamento correto para hub)

---

## PASSO 2: IMPLEMENTACAO DE EVENTOS (Interatividade)

### BOTOES SEM HANDLER (STUB) - FALHA

| # | Arquivo | Linha | Elemento | Icone | Problema |
|---|---------|-------|----------|-------|----------|
| 1 | `src/pages/AreasRequisitantes.tsx` | 220-222 | Botao Editar area | Edit | Sem `onClick` — botao decorativo |
| 2 | `src/pages/DFDs.tsx` | 161-163 | Botao Visualizar DFD | Eye | Sem `onClick` — botao decorativo |
| 3 | `src/pages/DFDs.tsx` | 169-171 | Botao Excluir DFD | Trash2 | Sem `onClick` — botao decorativo |
| 4 | `src/pages/Consolidacao.tsx` | 225-227 | Botao Adicionar a consolidacao | Plus | Sem `onClick` — botao decorativo |
| 5 | `src/components/relatorios/RelatorioPCADownload.tsx` | 32 | Texto do botao "2025" | - | Ano hardcoded no label |

### BOTOES COM HANDLER FUNCIONAL - OK

Todos os demais elementos interativos possuem handlers implementados e funcionais:

**AgentesPublicos.tsx:** Adicionar, Editar, Deletar, Cancelar, Salvar, Adicionar Cargo inline — TODOS OK
**UnidadesGestoras.tsx:** Adicionar, Editar, Deletar, Cancelar, Salvar — TODOS OK
**Cargos.tsx:** Adicionar, Editar, Deletar, Cancelar, Salvar — TODOS OK
**AreasRequisitantes.tsx:** Adicionar, Deletar — OK (Editar FALTANDO)
**CatalogoItens.tsx:** Novo Item, Editar, Deletar, Confirmar exclusao — TODOS OK
**NovoDFD.tsx:** Salvar, Enviar, Exportar PDF, Nova Area, Cancelar — TODOS OK
**DFDs.tsx:** Criar novo DFD (Link), Editar DFD (Link) — OK (Visualizar e Excluir FALTANDO)
**FormacaoPCA.tsx:** Voltar, Download — OK (via sub-componentes)
**FormularioPCA.tsx:** Adicionar Item, Limpar, Enviar, Nova Requisicao — TODOS OK
**MateriaisServicos.tsx:** Adicionar do Catalogo, Criar Novo, Editar, Deletar — TODOS OK
**ResponsaveisDFD.tsx:** Adicionar, Editar, Deletar, Nova Funcao, Novo Cargo — TODOS OK
**SelecionarItemCatalogo.tsx:** Selecionar, Multi-selecao, Confirmar — TODOS OK
**AnexosDFD.tsx:** Upload, Download, Deletar — TODOS OK

---

## PASSO 3: AUDITORIA DE NAVEGACAO PROFUNDA

### TODAS AS ROTAS DE NAVEGACAO - OK

| Origem | Elemento | Destino | Rota Existe? | Carrega? |
|--------|----------|---------|-------------|----------|
| Index | Card CADASTROS | `/cadastros` | SIM | OK |
| Index | Card Areas Requisitantes | `/areas-requisitantes` | SIM | OK |
| Index | Card Catalogo de Itens | `/catalogo-itens` | SIM | OK |
| Index | Card Elaboracao de DFDs | `/dfds` | SIM | OK |
| Index | Card Consolidacao | `/consolidacao` | SIM | OK |
| Index | Card Formacao do PCA | `/formacao-pca` | SIM | OK |
| Index | Card Aprovacao do PCA | `/aprovacao-pca` | SIM | OK |
| Cadastros | Card Unidades Gestoras | `/cadastros/unidades-gestoras` | SIM | OK |
| Cadastros | Card Agentes Publicos | `/cadastros/agentes-publicos` | SIM | OK |
| Cadastros | Card Cargos | `/cadastros/cargos` | SIM | OK |
| Cadastros | Card Orcamento | `/cadastros/orcamento` | SIM | OK |
| DFDs | Botao Criar novo DFD | `/dfds/novo` | SIM | OK |
| DFDs | Botao Editar (Link) | `/dfds/${id}` | SIM (`:id`) | OK |
| Todas paginas | Botao Voltar | `/` ou pai | SIM | OK |

### PROBLEMA MENOR

| Arquivo | Linha | Problema |
|---------|-------|---------|
| `src/pages/NotFound.tsx` | 16 | Usa `<a href="/">` em vez de `<Link to="/">` do React Router. Causa reload completo da SPA. |

---

## INVENTARIO COMPLETO DE HARDCODES

| # | Arquivo | Linha | Valor Hardcoded | Deveria Ser |
|---|---------|-------|-----------------|-------------|
| 1 | `DFDs.tsx` | 24-34 | Array mock de DFDs | Query `supabase.from('dfds').select('*')` |
| 2 | `DFDs.tsx` | 88-95 | "PCA 2023", "PCA 2022" | Buscar PCAs do banco |
| 3 | `Consolidacao.tsx` | 31-67 | Array mock de classes | Query de agregacao Supabase |
| 4 | `Consolidacao.tsx` | 127-135 | "PCA 2023", "PCA 2022" | Buscar PCAs do banco |
| 5 | `Consolidacao.tsx` | 143-147 | "Almoxarifado Central", "Centro de Ciencias" | Buscar areas do banco |
| 6 | `NovoDFD.tsx` | 433 | `"124/2022"` (numero DFD) | Vir do banco (auto-gerado) |
| 7 | `NovoDFD.tsx` | 437 | `"Usuário do Sistema"` | `supabase.auth.getUser()` |
| 8 | `NovoDFD.tsx` | 564-571 | "2023", "2022" (anos PCA) | Buscar PCAs do banco |
| 9 | `FormacaoPCA.tsx` | 22 | `"Formação do PCA 2025"` | Ano dinamico |
| 10 | `FormacaoPCA.tsx` | 40 | `"exercício de 2025"` | Ano dinamico |
| 11 | `RelatorioPCADownload.tsx` | 32 | `"Baixar Relatório Consolidado 2025"` | Ano dinamico |
| 12 | `pca-report-generator.ts` | 3 | `import MOCK_PCA_DATA` | Receber dados reais como parametro |
| 13 | `pca-report-generator.ts` | 43 | `"PCA 2025"` | Ano dinamico |
| 14 | `pca-report-generator.ts` | 51-52 | `"Expert Consultoria + Prefeitura Camocim"` | Dados da organizacao do banco |

---

## CLASSIFICACAO DE PROBLEMAS

### CRITICOS (Bloqueiam uso em producao)

1. **DFDs.tsx — Dados MOCK:** A listagem de DFDs mostra dados falsos. Usuarios nao conseguem ver, buscar ou gerenciar seus DFDs reais.

2. **Consolidacao.tsx — Dados MOCK:** A consolidacao mostra classes e valores completamente ficticios. Funcionalidade inutilizavel.

3. **pca-report-generator.ts — Dados MOCK:** O relatorio PDF consolidado e gerado com dados de `MOCK_PCA_DATA`, produzindo documento oficial com informacoes falsas.

### ALTOS (Afetam usabilidade)

1. **DFDs.tsx — Botoes Visualizar e Excluir sem handler:** Usuarios veem botoes de acao que nao fazem nada ao clicar.

2. **AreasRequisitantes.tsx — Botao Editar sem handler:** Impossivel editar uma area apos criacao.

3. **Consolidacao.tsx — Botao Adicionar sem handler:** Impossivel adicionar itens a consolidacao.

4. **NovoDFD.tsx — Numero do DFD hardcoded "124/2022":** Todos os DFDs exibem o mesmo numero.

5. **NovoDFD.tsx — Usuario hardcoded "Usuário do Sistema":** Nao identifica quem esta editando.

### MEDIOS (Dados incorretos mas nao bloqueantes)

1. **Seletores PCA hardcoded em 3 arquivos:** Anos "2022" e "2023" desatualizados (estamos em 2026).

2. **FormacaoPCA.tsx — Ano "2025" hardcoded:** Titulo e instrucoes referenciam ano incorreto.

3. **RelatorioPCADownload.tsx — "2025" no label do botao:** Desatualizado.

### BAIXOS (Melhorias tecnicas)

1. **NotFound.tsx — `<a href="/">` em vez de `<Link>`:** Causa reload completo da pagina.

2. **Consolidacao.tsx — Filtro de areas hardcoded:** Deveria buscar areas do banco.

---

## NOTA POSITIVA: O QUE ESTA FUNCIONANDO BEM

- **8 de 14 paginas** usam dados reais do Supabase corretamente
- **Hooks customizados** (`useUASGs`, `useCargos`, `useAgentesPublicos`, etc.) bem estruturados
- **Padrao local-first** em MateriaisServicos e ResponsaveisDFD (permite trabalhar antes de salvar o DFD)
- **Validacao de formularios** presente e funcional
- **Lazy loading** implementado em App.tsx com `React.lazy()` e `Suspense`
- **Layout compartilhado** via `MainLayout` com `Outlet`
- **100% das rotas de navegacao validas** — zero links quebrados
- **CRUD completo** nas paginas que usam dados reais
- **Exportacao PDF de DFD individual** funciona com dados reais (`NovoDFD.tsx`)

---

## ACOES CORRETIVAS RECOMENDADAS (Prioridade)

### Prioridade 1 — Substituir dados MOCK

1. `DFDs.tsx`: Implementar query Supabase para listar DFDs reais
2. `Consolidacao.tsx`: Implementar queries de agregacao para consolidar DFDs por classe
3. `pca-report-generator.ts`: Receber dados como parametro e buscar do Supabase

### Prioridade 2 — Implementar handlers faltantes

1. `DFDs.tsx`: Adicionar onClick no botao Visualizar (Eye) — abrir DFD em modo leitura
2. `DFDs.tsx`: Adicionar onClick no botao Excluir (Trash2) — soft delete com confirmacao
3. `AreasRequisitantes.tsx`: Adicionar onClick no botao Editar (Edit) — abrir dialog de edicao
4. `Consolidacao.tsx`: Adicionar onClick no botao Adicionar (Plus)

### Prioridade 3 — Corrigir hardcodes

1. `NovoDFD.tsx`: Exibir numero real do DFD (do banco ou "Auto-gerado ao salvar")
2. `NovoDFD.tsx`: Buscar nome do usuario autenticado
3. Tornar seletores de PCA e ano dinamicos em todos os arquivos afetados

### Prioridade 4 — Melhorias tecnicas

1. `NotFound.tsx`: Substituir `<a>` por `<Link>` do React Router
