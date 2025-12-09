"""
Teste de Descoberta de Elementos - Página de Login (Versão Simplificada)
Este teste explora a página de Login e documenta todos os elementos encontrados.
Versão que não requer browsers - usa BeautifulSoup.
"""

import json
import os
import sys
from datetime import datetime
import requests
from bs4 import BeautifulSoup


class SimpleElementDiscovery:
    """Classe para descoberta e documentação de elementos usando BeautifulSoup."""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.soup = None
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
            },
            "statistics": {}
        }

    def fetch_page(self, url: str):
        """Busca a página HTML."""
        print(f"\n🌐 Buscando página: {url}")
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            self.soup = BeautifulSoup(response.text, 'lxml')
            self.discovered_elements["url"] = url
            print(f"✅ Página carregada com sucesso ({len(response.text)} bytes)")
            return True
        except Exception as e:
            print(f"❌ Erro ao buscar página: {e}")
            return False

    def discover_inputs(self):
        """Descobre todos os campos de input."""
        print("\n🔍 Descobrindo campos de input...")
        inputs = self.soup.find_all("input")

        for idx, input_elem in enumerate(inputs):
            element_info = {
                "index": idx,
                "type": input_elem.get("type", "text"),
                "name": input_elem.get("name", ""),
                "id": input_elem.get("id", ""),
                "placeholder": input_elem.get("placeholder", ""),
                "class": input_elem.get("class", []),
                "required": input_elem.has_attr("required"),
                "value": input_elem.get("value", ""),
                "aria-label": input_elem.get("aria-label", ""),
            }
            self.discovered_elements["elements"]["inputs"].append(element_info)
            print(f"  ✓ Input {idx}: type='{element_info['type']}', id='{element_info['id']}', placeholder='{element_info['placeholder']}'")

        return len(inputs)

    def discover_buttons(self):
        """Descobre todos os botões."""
        print("\n🔍 Descobrindo botões...")
        buttons = self.soup.find_all("button")

        for idx, button in enumerate(buttons):
            element_info = {
                "index": idx,
                "text": button.get_text(strip=True),
                "type": button.get("type", ""),
                "id": button.get("id", ""),
                "class": button.get("class", []),
                "disabled": button.has_attr("disabled"),
                "aria-label": button.get("aria-label", ""),
                "data-testid": button.get("data-testid", ""),
            }
            self.discovered_elements["elements"]["buttons"].append(element_info)
            print(f"  ✓ Button {idx}: text='{element_info['text'][:50]}', type='{element_info['type']}', id='{element_info['id']}'")

        return len(buttons)

    def discover_links(self):
        """Descobre todos os links."""
        print("\n🔍 Descobrindo links...")
        links = self.soup.find_all("a")

        for idx, link in enumerate(links):
            element_info = {
                "index": idx,
                "text": link.get_text(strip=True),
                "href": link.get("href", ""),
                "id": link.get("id", ""),
                "class": link.get("class", []),
                "aria-label": link.get("aria-label", ""),
                "target": link.get("target", ""),
            }
            self.discovered_elements["elements"]["links"].append(element_info)
            if element_info['text']:  # Apenas mostrar links com texto
                print(f"  ✓ Link {idx}: text='{element_info['text'][:50]}', href='{element_info['href'][:50]}'")

        return len(links)

    def discover_forms(self):
        """Descobre todos os formulários."""
        print("\n🔍 Descobrindo formulários...")
        forms = self.soup.find_all("form")

        for idx, form in enumerate(forms):
            element_info = {
                "index": idx,
                "action": form.get("action", ""),
                "method": form.get("method", ""),
                "id": form.get("id", ""),
                "class": form.get("class", []),
                "name": form.get("name", ""),
            }
            self.discovered_elements["elements"]["forms"].append(element_info)
            print(f"  ✓ Form {idx}: action='{element_info['action']}', method='{element_info['method']}', id='{element_info['id']}'")

        return len(forms)

    def discover_headings(self):
        """Descobre todos os headings (h1-h6)."""
        print("\n🔍 Descobrindo headings...")
        count = 0
        for level in range(1, 7):
            headings = self.soup.find_all(f"h{level}")
            for idx, heading in enumerate(headings):
                element_info = {
                    "level": level,
                    "index": idx,
                    "text": heading.get_text(strip=True),
                    "id": heading.get("id", ""),
                    "class": heading.get("class", []),
                }
                self.discovered_elements["elements"]["headings"].append(element_info)
                print(f"  ✓ H{level} {idx}: text='{element_info['text'][:80]}'")
                count += 1

        return count

    def discover_images(self):
        """Descobre todas as imagens."""
        print("\n🔍 Descobrindo imagens...")
        images = self.soup.find_all("img")

        for idx, img in enumerate(images):
            element_info = {
                "index": idx,
                "src": img.get("src", ""),
                "alt": img.get("alt", ""),
                "id": img.get("id", ""),
                "class": img.get("class", []),
                "width": img.get("width", ""),
                "height": img.get("height", ""),
            }
            self.discovered_elements["elements"]["images"].append(element_info)
            print(f"  ✓ Image {idx}: alt='{element_info['alt']}', src='{element_info['src'][:60]}'")

        return len(images)

    def discover_interactive(self):
        """Descobre elementos interativos adicionais."""
        print("\n🔍 Descobrindo elementos interativos...")
        count = 0

        # Selects
        selects = self.soup.find_all("select")
        for idx, elem in enumerate(selects):
            options = [opt.get_text(strip=True) for opt in elem.find_all("option")]
            element_info = {
                "type": "select",
                "index": idx,
                "id": elem.get("id", ""),
                "name": elem.get("name", ""),
                "class": elem.get("class", []),
                "options_count": len(options),
                "options": options[:10],  # Limita a 10 para não sobrecarregar
            }
            self.discovered_elements["elements"]["interactive"].append(element_info)
            print(f"  ✓ Select {idx}: id='{element_info['id']}', options={len(options)}")
            count += 1

        # Textareas
        textareas = self.soup.find_all("textarea")
        for idx, elem in enumerate(textareas):
            element_info = {
                "type": "textarea",
                "index": idx,
                "id": elem.get("id", ""),
                "name": elem.get("name", ""),
                "class": elem.get("class", []),
                "placeholder": elem.get("placeholder", ""),
            }
            self.discovered_elements["elements"]["interactive"].append(element_info)
            print(f"  ✓ Textarea {idx}: id='{element_info['id']}'")
            count += 1

        # Elementos com role
        role_elements = self.soup.find_all(attrs={"role": True})
        for idx, elem in enumerate(role_elements):
            element_info = {
                "type": "role_element",
                "index": idx,
                "tag": elem.name,
                "role": elem.get("role", ""),
                "id": elem.get("id", ""),
                "class": elem.get("class", []),
                "aria-label": elem.get("aria-label", ""),
            }
            self.discovered_elements["elements"]["interactive"].append(element_info)
            print(f"  ✓ Role element {idx}: tag='{elem.name}', role='{elem.get('role')}'")
            count += 1

        return count

    def discover_all(self, url: str):
        """Executa todas as descobertas."""
        print(f"\n{'=' * 80}")
        print(f"🔍 TESTE DE DESCOBERTA DE ELEMENTOS")
        print(f"{'=' * 80}")
        print(f"URL: {url}")
        print(f"Timestamp: {self.discovered_elements['timestamp']}")
        print(f"{'=' * 80}")

        if not self.fetch_page(url):
            return None

        # Executa todas as descobertas
        stats = {}
        stats['inputs'] = self.discover_inputs()
        stats['buttons'] = self.discover_buttons()
        stats['links'] = self.discover_links()
        stats['forms'] = self.discover_forms()
        stats['headings'] = self.discover_headings()
        stats['images'] = self.discover_images()
        stats['interactive'] = self.discover_interactive()

        self.discovered_elements['statistics'] = stats

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
        stats = self.discovered_elements.get('statistics', {})
        print(f"\n{'=' * 80}")
        print(f"📊 RESUMO DA DESCOBERTA")
        print(f"{'=' * 80}")
        print(f"  Inputs encontrados:     {stats.get('inputs', 0)}")
        print(f"  Buttons encontrados:    {stats.get('buttons', 0)}")
        print(f"  Links encontrados:      {stats.get('links', 0)}")
        print(f"  Forms encontrados:      {stats.get('forms', 0)}")
        print(f"  Headings encontrados:   {stats.get('headings', 0)}")
        print(f"  Images encontradas:     {stats.get('images', 0)}")
        print(f"  Interativos encontrados: {stats.get('interactive', 0)}")
        print(f"\n  TOTAL DE ELEMENTOS:     {sum(stats.values())}")
        print(f"{'=' * 80}\n")


def main():
    """Função principal para executar o teste."""
    # Configura a URL base
    base_url = "http://localhost:5173"

    # TODO: Alterar para "/login" quando a página de login for implementada
    login_url = f"{base_url}/"

    # Cria o descobridor
    discovery = SimpleElementDiscovery(base_url)

    # Executa a descoberta
    result = discovery.discover_all(login_url)

    if result:
        # Imprime resumo
        discovery.print_summary()

        # Salva relatório
        report_path = discovery.save_report("login_page_discovery.json")

        print(f"\n✅ Teste de descoberta concluído com sucesso!")
        print(f"📄 Relatório disponível em: {report_path}\n")
        return 0
    else:
        print("\n❌ Falha na descoberta de elementos")
        return 1


if __name__ == "__main__":
    sys.exit(main())
