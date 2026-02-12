---
name: opsx-audit
description: Executa uma auditoria completa simulando um usuário final no navegador.
---

# Auditoria End-to-End (E2E)

Este workflow executa o Playwright para validar a UI e a persistência de dados.

Execute o comando:
`npx playwright test src/tests/e2e/auditoria_usuario_real.spec.ts`

Se desejar ver o navegador, adicione a flag `--headed`.
