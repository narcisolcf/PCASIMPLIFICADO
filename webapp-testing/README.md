# WebApp Testing Framework

Framework de testes automatizados para o Sistema PCA.

## 🚀 Início Rápido

```bash
# Executar teste de descoberta de elementos
./webapp-testing/scripts/run_discovery.sh

# Ou usando o with_server diretamente
python3 webapp-testing/scripts/with_server.py python3 webapp-testing/tests/test_login_discovery_simple.py
```

## 📋 Estrutura

```
webapp-testing/
├── scripts/
│   └── with_server.py      # Script para garantir que o servidor está rodando
├── tests/
│   └── test_login_discovery.py  # Teste de descoberta de elementos
├── reports/                # Relatórios gerados pelos testes
│   └── screenshots/        # Screenshots capturados
├── pytest.ini             # Configuração do pytest
└── README.md              # Esta documentação
```

## 🚀 Como Usar

### Pré-requisitos

```bash
# Instalar dependências Python
pip3 install playwright pytest pytest-playwright

# Instalar browsers do Playwright
playwright install chromium
```

### Executar Testes com Servidor Automático

O script `with_server.py` garante que o servidor de desenvolvimento está rodando antes de executar os testes:

```bash
# Executar teste específico
python3 webapp-testing/scripts/with_server.py pytest webapp-testing/tests/test_login_discovery.py

# Executar todos os testes
python3 webapp-testing/scripts/with_server.py pytest webapp-testing/

# Executar com marcadores específicos
python3 webapp-testing/scripts/with_server.py pytest webapp-testing/ -m discovery
```

### Executar Testes Manualmente

Se o servidor já estiver rodando:

```bash
# Iniciar servidor (em outro terminal)
npm run dev

# Executar testes
cd webapp-testing
pytest tests/test_login_discovery.py -v
```

## 📊 Relatórios

Os testes geram relatórios em:

- **JSON**: `webapp-testing/reports/login_page_discovery.json` - Contém todos os elementos descobertos
- **Screenshots**: `webapp-testing/reports/screenshots/` - Capturas de tela da página

## 🔍 Teste de Descoberta de Elementos

O teste `test_login_discovery.py` realiza:

1. ✅ Navegação até a página de login
2. ✅ Descoberta de todos os elementos interativos:
   - Inputs (campos de entrada)
   - Buttons (botões)
   - Links (links)
   - Forms (formulários)
   - Headings (cabeçalhos h1-h6)
   - Images (imagens)
   - Elementos interativos adicionais
3. ✅ Geração de relatório JSON com detalhes dos elementos
4. ✅ Captura de screenshot da página

## 🛠️ Personalização

### Alterar a URL da Página de Login

Edite o arquivo `tests/test_login_discovery.py` e altere:

```python
# Linha atual (página principal)
login_url = f"{base_url}/"

# Alterar para página de login quando implementada
login_url = f"{base_url}/login"
```

### Adicionar Novos Testes

Crie novos arquivos de teste em `tests/` seguindo o padrão `test_*.py`:

```python
import pytest
from playwright.sync_api import Page

def test_meu_novo_teste(page: Page):
    page.goto("http://localhost:5173/minha-pagina")
    # Seu teste aqui
```

## 📝 Notas Importantes

### Limitações com Aplicações React

O Sistema PCA é uma aplicação React que renderiza todo o conteúdo dinamicamente no cliente. Isso significa que:

- **BeautifulSoup/Requests** (teste simplificado): Vê apenas o HTML inicial (shell vazio) antes da execução do JavaScript
- **Playwright com browser** (teste completo): Necessário para descobrir elementos renderizados dinamicamente

O teste `test_login_discovery_simple.py` está disponível e funcional, mas devido às limitações de rede do ambiente, não consegue baixar os browsers do Playwright.

### Para Ambiente Local

Em um ambiente local com acesso à internet, você pode:

```bash
# Instalar browsers do Playwright
python3 -m playwright install chromium

# Executar teste completo com Playwright
pytest webapp-testing/tests/test_login_discovery.py -v
```

### Configurações

- O servidor Vite deve estar acessível na porta **5173**
- Os testes usam o browser Chromium por padrão
- Todos os relatórios são salvos com timestamp para evitar sobrescrever dados anteriores
- A porta foi alterada de 8080 para 5173 no `vite.config.ts`
