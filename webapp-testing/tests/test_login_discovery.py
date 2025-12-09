"""
Teste de Descoberta de Elementos - Página de Login
Este teste explora a página de Login e documenta todos os elementos encontrados.
"""

import pytest
import json
import os
from datetime import datetime
from playwright.sync_api import Page, expect


class ElementDiscovery:
    """Classe para descoberta e documentação de elementos."""

    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url
        self.discovered_elements = {
            "timestamp": datetime.now().isoformat(),
            "url": "",
            "elements": {
                "inputs": [],
                "buttons": [],
                "links": [],
                "forms": [],
                "headings": [],
                "images": [],
                "interactive": []
            }
        }

    def discover_inputs(self):
        """Descobre todos os campos de input."""
        print("\n🔍 Descobrindo campos de input...")
        inputs = self.page.locator("input").all()

        for idx, input_elem in enumerate(inputs):
            try:
                element_info = {
                    "index": idx,
                    "type": input_elem.get_attribute("type") or "text",
                    "name": input_elem.get_attribute("name") or "",
                    "id": input_elem.get_attribute("id") or "",
                    "placeholder": input_elem.get_attribute("placeholder") or "",
                    "class": input_elem.get_attribute("class") or "",
                    "required": input_elem.get_attribute("required") is not None,
                    "visible": input_elem.is_visible(),
                }
                self.discovered_elements["elements"]["inputs"].append(element_info)
                print(f"  ✓ Input {idx}: type='{element_info['type']}', id='{element_info['id']}', placeholder='{element_info['placeholder']}'")
            except Exception as e:
                print(f"  ⚠️  Erro ao processar input {idx}: {e}")

    def discover_buttons(self):
        """Descobre todos os botões."""
        print("\n🔍 Descobrindo botões...")
        buttons = self.page.locator("button").all()

        for idx, button in enumerate(buttons):
            try:
                element_info = {
                    "index": idx,
                    "text": button.inner_text() or "",
                    "type": button.get_attribute("type") or "",
                    "id": button.get_attribute("id") or "",
                    "class": button.get_attribute("class") or "",
                    "disabled": button.get_attribute("disabled") is not None,
                    "visible": button.is_visible(),
                }
                self.discovered_elements["elements"]["buttons"].append(element_info)
                print(f"  ✓ Button {idx}: text='{element_info['text']}', type='{element_info['type']}', id='{element_info['id']}'")
            except Exception as e:
                print(f"  ⚠️  Erro ao processar button {idx}: {e}")

    def discover_links(self):
        """Descobre todos os links."""
        print("\n🔍 Descobrindo links...")
        links = self.page.locator("a").all()

        for idx, link in enumerate(links):
            try:
                element_info = {
                    "index": idx,
                    "text": link.inner_text() or "",
                    "href": link.get_attribute("href") or "",
                    "id": link.get_attribute("id") or "",
                    "class": link.get_attribute("class") or "",
                    "visible": link.is_visible(),
                }
                self.discovered_elements["elements"]["links"].append(element_info)
                print(f"  ✓ Link {idx}: text='{element_info['text']}', href='{element_info['href']}'")
            except Exception as e:
                print(f"  ⚠️  Erro ao processar link {idx}: {e}")

    def discover_forms(self):
        """Descobre todos os formulários."""
        print("\n🔍 Descobrindo formulários...")
        forms = self.page.locator("form").all()

        for idx, form in enumerate(forms):
            try:
                element_info = {
                    "index": idx,
                    "action": form.get_attribute("action") or "",
                    "method": form.get_attribute("method") or "",
                    "id": form.get_attribute("id") or "",
                    "class": form.get_attribute("class") or "",
                }
                self.discovered_elements["elements"]["forms"].append(element_info)
                print(f"  ✓ Form {idx}: action='{element_info['action']}', method='{element_info['method']}', id='{element_info['id']}'")
            except Exception as e:
                print(f"  ⚠️  Erro ao processar form {idx}: {e}")

    def discover_headings(self):
        """Descobre todos os headings (h1-h6)."""
        print("\n🔍 Descobrindo headings...")
        for level in range(1, 7):
            headings = self.page.locator(f"h{level}").all()
            for idx, heading in enumerate(headings):
                try:
                    element_info = {
                        "level": level,
                        "index": idx,
                        "text": heading.inner_text() or "",
                        "id": heading.get_attribute("id") or "",
                        "class": heading.get_attribute("class") or "",
                        "visible": heading.is_visible(),
                    }
                    self.discovered_elements["elements"]["headings"].append(element_info)
                    print(f"  ✓ H{level} {idx}: text='{element_info['text']}'")
                except Exception as e:
                    print(f"  ⚠️  Erro ao processar h{level} {idx}: {e}")

    def discover_images(self):
        """Descobre todas as imagens."""
        print("\n🔍 Descobrindo imagens...")
        images = self.page.locator("img").all()

        for idx, img in enumerate(images):
            try:
                element_info = {
                    "index": idx,
                    "src": img.get_attribute("src") or "",
                    "alt": img.get_attribute("alt") or "",
                    "id": img.get_attribute("id") or "",
                    "class": img.get_attribute("class") or "",
                    "visible": img.is_visible(),
                }
                self.discovered_elements["elements"]["images"].append(element_info)
                print(f"  ✓ Image {idx}: alt='{element_info['alt']}', src='{element_info['src'][:50]}...'")
            except Exception as e:
                print(f"  ⚠️  Erro ao processar image {idx}: {e}")

    def discover_interactive(self):
        """Descobre elementos interativos adicionais."""
        print("\n🔍 Descobrindo elementos interativos...")
        selectors = ["select", "textarea", "[role='button']", "[onclick]", "[data-testid]"]

        for selector in selectors:
            elements = self.page.locator(selector).all()
            for idx, elem in enumerate(elements):
                try:
                    element_info = {
                        "selector": selector,
                        "index": idx,
                        "tag": elem.evaluate("el => el.tagName.toLowerCase()"),
                        "text": elem.inner_text() or "",
                        "id": elem.get_attribute("id") or "",
                        "class": elem.get_attribute("class") or "",
                        "data-testid": elem.get_attribute("data-testid") or "",
                        "visible": elem.is_visible(),
                    }
                    self.discovered_elements["elements"]["interactive"].append(element_info)
                    print(f"  ✓ {selector} {idx}: tag='{element_info['tag']}', id='{element_info['id']}'")
                except Exception as e:
                    print(f"  ⚠️  Erro ao processar {selector} {idx}: {e}")

    def discover_all(self, url: str):
        """Executa todas as descobertas."""
        print(f"\n{'=' * 80}")
        print(f"🔍 TESTE DE DESCOBERTA DE ELEMENTOS")
        print(f"{'=' * 80}")
        print(f"URL: {url}")
        print(f"Timestamp: {self.discovered_elements['timestamp']}")
        print(f"{'=' * 80}")

        self.discovered_elements["url"] = url
        self.page.goto(url)
        self.page.wait_for_load_state("networkidle")

        # Executa todas as descobertas
        self.discover_inputs()
        self.discover_buttons()
        self.discover_links()
        self.discover_forms()
        self.discover_headings()
        self.discover_images()
        self.discover_interactive()

        return self.discovered_elements

    def save_report(self, filename: str = None):
        """Salva o relatório de descoberta em JSON."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"element_discovery_{timestamp}.json"

        reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports")
        os.makedirs(reports_dir, exist_ok=True)

        filepath = os.path.join(reports_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.discovered_elements, f, indent=2, ensure_ascii=False)

        print(f"\n{'=' * 80}")
        print(f"📄 Relatório salvo em: {filepath}")
        print(f"{'=' * 80}")

        return filepath

    def print_summary(self):
        """Imprime um resumo da descoberta."""
        print(f"\n{'=' * 80}")
        print(f"📊 RESUMO DA DESCOBERTA")
        print(f"{'=' * 80}")
        print(f"  Inputs encontrados:     {len(self.discovered_elements['elements']['inputs'])}")
        print(f"  Buttons encontrados:    {len(self.discovered_elements['elements']['buttons'])}")
        print(f"  Links encontrados:      {len(self.discovered_elements['elements']['links'])}")
        print(f"  Forms encontrados:      {len(self.discovered_elements['elements']['forms'])}")
        print(f"  Headings encontrados:   {len(self.discovered_elements['elements']['headings'])}")
        print(f"  Images encontradas:     {len(self.discovered_elements['elements']['images'])}")
        print(f"  Interativos encontrados: {len(self.discovered_elements['elements']['interactive'])}")
        print(f"{'=' * 80}\n")


@pytest.fixture(scope="session")
def base_url():
    """URL base para os testes."""
    return "http://localhost:5173"


def test_login_page_element_discovery(page: Page, base_url: str):
    """
    Teste de descoberta de elementos na página de Login.

    Este teste:
    1. Navega até a página de login
    2. Descobre e documenta todos os elementos interativos
    3. Gera um relatório JSON com os elementos encontrados
    """
    # Cria o descobridor de elementos
    discovery = ElementDiscovery(page, base_url)

    # Executa a descoberta (página principal por enquanto, adaptar para /login quando existir)
    # TODO: Alterar para "/login" quando a página de login for implementada
    login_url = f"{base_url}/"

    discovered = discovery.discover_all(login_url)

    # Imprime resumo
    discovery.print_summary()

    # Salva relatório
    report_path = discovery.save_report("login_page_discovery.json")

    # Verificações básicas
    assert discovered is not None, "Descoberta deve retornar dados"
    assert discovered["url"] == login_url, "URL deve estar registrada"

    print(f"\n✅ Teste de descoberta concluído com sucesso!")
    print(f"📄 Relatório disponível em: {report_path}")


def test_login_page_screenshot(page: Page, base_url: str):
    """Captura screenshot da página de login para referência visual."""
    login_url = f"{base_url}/"

    print(f"\n📸 Capturando screenshot da página...")
    page.goto(login_url)
    page.wait_for_load_state("networkidle")

    screenshots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "screenshots")
    os.makedirs(screenshots_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_path = os.path.join(screenshots_dir, f"login_page_{timestamp}.png")

    page.screenshot(path=screenshot_path, full_page=True)

    print(f"✅ Screenshot salvo em: {screenshot_path}")
    assert os.path.exists(screenshot_path), "Screenshot deve ser criado"


if __name__ == "__main__":
    # Permite executar o teste diretamente
    pytest.main([__file__, "-v", "-s"])
