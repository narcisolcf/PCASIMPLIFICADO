#!/bin/bash
#
# Script para executar o teste de descoberta de elementos
# Garante que o servidor está rodando antes de executar os testes
#

set -e

echo "================================================================================"
echo "🔍 WEBAPP-TESTING - Teste de Descoberta de Elementos"
echo "================================================================================"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
WEBAPP_TESTING_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}ℹ️  Diretório do projeto: $PROJECT_ROOT${NC}"
echo -e "${BLUE}ℹ️  Diretório webapp-testing: $WEBAPP_TESTING_DIR${NC}"
echo ""

# Função para verificar se o servidor está rodando
check_server() {
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Servidor já está rodando na porta 5173${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Servidor não está rodando${NC}"
        return 1
    fi
}

# Verifica se deve usar with_server ou executar diretamente
if check_server; then
    USE_WITH_SERVER=false
else
    echo -e "${BLUE}🚀 Servidor será iniciado automaticamente pelo with_server${NC}"
    USE_WITH_SERVER=true
fi

echo ""
echo "================================================================================"
echo "🧪 Executando teste de descoberta de elementos"
echo "================================================================================"
echo ""

cd "$WEBAPP_TESTING_DIR"

if [ "$USE_WITH_SERVER" = true ]; then
    # Executa com with_server (garante que o servidor está rodando)
    echo -e "${BLUE}📋 Usando with_server.py para garantir servidor ativo${NC}"
    python3 scripts/with_server.py python3 tests/test_login_discovery_simple.py
else
    # Executa diretamente
    echo -e "${BLUE}📋 Executando teste diretamente${NC}"
    python3 tests/test_login_discovery_simple.py
fi

EXIT_CODE=$?

echo ""
echo "================================================================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Teste concluído com sucesso!${NC}"
    echo ""
    echo "📄 Relatório disponível em:"
    echo "   $WEBAPP_TESTING_DIR/reports/login_page_discovery.json"
else
    echo -e "${YELLOW}⚠️  Teste finalizado com código de saída: $EXIT_CODE${NC}"
fi
echo "================================================================================"

exit $EXIT_CODE
