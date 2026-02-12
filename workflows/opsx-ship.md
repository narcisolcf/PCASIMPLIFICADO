---
name: opsx-ship
description: Refatora, valida, comita e prepara o deploy de uma etapa do projeto após alterações significativas.
---

# Passo 1: Refatoração e Padronização

Primeiro, analise as alterações recentes no contexto atual.
Execute o skill `openspec-apply-change` para garantir que o código segue os padrões de arquitetura (Clean Architecture/SOLID) definidos no projeto.

- Certifique-se de que não há dados hardcoded.
- Verifique se a tipagem está estrita (TypeScript).

# Passo 2: Verificação de Segurança (Testes)

Antes de prosseguir, é imperativo validar se a refatoração manteve a integridade do sistema.
Execute o skill `openspec-verify-change` (ou rode os testes unitários afetados).

- Se houver erro: Pare o workflow e peça correção ao usuário.
- Se passar: Prossiga para o próximo passo.

# Passo 3: Arquivamento (Commit)

Agora que o código está limpo e validado, faça o commit das alterações.
Execute o skill `openspec-archive-change`.

- Use uma mensagem de commit seguindo o padrão Conventional Commits (ex: "feat(scope): ...", "refactor(ui): ...").

# Passo 4: Sincronização e Deploy

Finalmente, envie as alterações para o repositório remoto.
Execute o skill `openspec-sync-specs` (ou o comando git push equivalente configurado no projeto).

- Nota: O deploy real será acionado automaticamente pelo CI/CD do GitHub ao detectar este push na branch principal.
