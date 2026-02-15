# Análise de Viabilidade: Testes E2E com Playwright

## 1. Estado Atual do Projeto

- **Configuração do Playwright**: O arquivo `playwright.config.ts` **não existe** na raiz do projeto, nem o pacote `@playwright/test` está listado no `package.json`.
  - *Ação Necessária*: É preciso instalar o Playwright e criar o arquivo de configuração.
- **Servidor Local**: O arquivo `vite.config.ts` confirma a porta `5173`, então `http://localhost:5173` é o endereço correto.
- **Autenticação**: O projeto utiliza Supabase Auth. A maioria das rotas (como `/dfds`, `/novo-dfd`) exige login. O teste genérico proposto falhará ao tentar acessar páginas protegidas sem uma sessão válida.

## 2. Análise do Código Proposto

| Ponto Proposto | Aplicabilidade no PCASIMPLIFICADO | Correção Necessária |
| :--- | :--- | :--- |
| **Pasta `src/tests/e2e`** | ✅ Aplicável. É uma boa prática separar testes E2E. | Nenhuma. |
| **`test.beforeEach`** | ⚠️ Parcialmente aplicável. | Precisa incluir lógica de **Login** ou **Mock de Sessão**, senão o teste cairá na tela de login. |
| **Verificação de Título** | ✅ Aplicável. | O título deve corresponder ao `<title>` real do `index.html`. |
| **Link `/settings`** | ❌ Não Aplicável. Essa rota não existe. | Substituir por rotas reais como `/dfds`, `/areas-requisitantes` ou `/consolidacao`. |
| **Botão de Ação Genérico** | ⚠️ Arriscado. "add/novo/criar" pode ser ambíguo. | Usar seletores específicos, ex: botão "Novo DFD" na tela de DFDs. |
| **Input Genérico** | ⚠️ Arriscado. | Usar `label`, `placeholder` exato ou `data-testid` dos campos do formulário de DFD. |

## 3. Plano de Implementação Recomendado

1. **Instalação**: Executar `npm install -D @playwright/test` e instalar os navegadores.
2. **Configuração**: Criar `playwright.config.ts` configurado para rodar o servidor local (`npm run dev`) antes dos testes.
3. **Teste Realista (`auditoria_usuario_real.spec.ts`)**:
    - **Login**: Simular login programaticamente ou via interface (precisamos de um usuário de teste ou `.env.test`).
    - **Fluxo**: Acessar Dashboard -> Navegar para DFDs -> Criar Novo DFD -> Preencher -> Salvar.

## Próximos Passos

Posso configurar o ambiente para você agora:

1. Instalar dependências de desenvolvimento.
2. Criar o arquivo de configuração do Playwright.
3. Criar um teste E2E adaptado para a rota `/dfds` (exigirá credenciais de teste ou mock).
