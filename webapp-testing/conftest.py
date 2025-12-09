"""Configuração do pytest para os testes webapp."""
import pytest


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configuração do contexto do browser."""
    return {
        **browser_context_args,
        "viewport": {
            "width": 1920,
            "height": 1080,
        },
        "locale": "pt-BR",
    }


@pytest.fixture(scope="session")
def base_url():
    """URL base da aplicação."""
    return "http://localhost:5173"
