# Guia de Deploy - PCASIMPLIFICADO

Este guia descreve como colocar o sistema em produção usando Vercel ou Netlify.

## Pré-requisitos

1. Conta no [GitHub](https://github.com).
2. Código fonte enviado para um repositório no GitHub.
3. Conta na [Vercel](https://vercel.com) ou [Netlify](https://netlify.com).
4. Projeto criado no [Supabase](https://supabase.com).

## Variáveis de Ambiente

Você precisará das seguintes variáveis do seu projeto Supabase:

- `VITE_SUPABASE_URL`: URL do seu projeto (ex: `https://xyz.supabase.co`).
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Chave pública (`anon` key).

## Opção 1: Deploy na Vercel (Recomendado)

1. Acesse o dashboard da Vercel e clique em **"Add New..."** -> **"Project"**.
2. Importe seu repositório do GitHub.
3. Nas configurações de **Environment Variables**:
    - Adicione `VITE_SUPABASE_URL` com o valor do Supabase.
    - Adicione `VITE_SUPABASE_PUBLISHABLE_KEY` com o valor do Supabase.
4. Mantenha as configurações de build padrão (`npm run build`, Output directory: `dist`).
5. Clique em **Deploy**.

*Nota: O arquivo `vercel.json` incluído no projeto já configura o roteamento correto para aplicações React.*

## Opção 2: Deploy no Netlify

1. Acesse o Netlify e clique em **"Add new site"** -> **"Import an existing project"**.
2. Conecte ao GitHub e selecione o repositório.
3. Em **Build settings**:
    - Build command: `npm run build`
    - Publish directory: `dist`
4. Clique em **"Show advanced"** -> **"New Variable"** e adicione as variáveis de ambiente (`VITE_SUPABASE_URL` e `KEY`).
5. Clique em **Deploy site**.

*Nota: O arquivo `netlify.toml` incluído no projeto garante que as rotas funcionem corretamente.*

## Pós-Deploy (Checklist)

1. **URL de Redirecionamento (Supabase)**:
    - Vá no painel do Supabase -> Authentication -> URL Configuration.
    - Adicione a URL do seu site em produção (ex: `https://seu-projeto.vercel.app`) em **Site URL** e **Redirect URLs**.
2. **Testar Fluxos**:
    - Entrar no sistema.
    - Criar um DFD.
    - Testar download de modelos.
    - Verificar Dashboard.
