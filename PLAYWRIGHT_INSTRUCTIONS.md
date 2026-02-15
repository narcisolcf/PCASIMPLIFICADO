# Instruções de Teste E2E com Playwright

O ambiente de testes End-to-End (E2E) foi configurado com sucesso.

## Como Executar

Para rodar os testes, utilize o comando:

```bash
npx playwright test
```

Para ver o navegador abrindo e executando os testes visualmente:

```bash
npx playwright test --headed
```

Para ver o relatório HTML após a execução:

```bash
npx playwright show-report
```

## Cenários de Teste

### 1. Criar DFD (Sem Autenticação)

Arquivo: `src/tests/e2e/criar_dfd.spec.ts`

Este teste verifica se o sistema impede corretamente a criação de um DFD quando o usuário não está logado.

- Navega até `/dfds/novo`.
- Preenche os campos obrigatórios.
- Tenta salvar.
- Espera ver o erro "Você precisa estar autenticado".

### 2. Criar DFD (Autenticado - Futuro)

O arquivo de teste contém um bloco comentado para testar o fluxo completo com login.
Para ativar este teste, você precisará:

1. Ter uma forma de login acessível (atualmente o app não possui rota `/login` visível).
2. Configurar as credenciais no arquivo `.env`:

    ```env
    E2E_USER_EMAIL=seu_email@teste.com
    E2E_USER_PASSWORD=sua_senha
    ```

3. Descomentar o bloco de teste no arquivo `src/tests/e2e/criar_dfd.spec.ts`.

## Solução de Problemas

- **Timeout**: Se o teste falhar por timeout, verifique se o servidor local (`npm run dev`) subiu corretamente na porta 5173. O Playwright tenta subir automaticamente, mas pode demorar na primeira vez.
- **Seletores**: Se houver mudanças nos textos dos labels ou placeholders, os testes precisarão ser atualizados.
