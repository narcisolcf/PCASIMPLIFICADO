#!/usr/bin/env python3
"""
Script para garantir que o servidor de desenvolvimento está rodando antes de executar testes.
Uso: python3 with_server.py [comando_de_teste]
"""

import sys
import subprocess
import time
import socket
import os
import signal
import requests
from typing import Optional

class ServerManager:
    def __init__(self, port: int = 5173, host: str = "localhost"):
        self.port = port
        self.host = host
        self.server_process: Optional[subprocess.Popen] = None
        self.started_server = False

    def is_port_open(self) -> bool:
        """Verifica se a porta está aberta e acessível."""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        try:
            result = sock.connect_ex((self.host, self.port))
            sock.close()
            return result == 0
        except:
            return False

    def is_server_ready(self) -> bool:
        """Verifica se o servidor está pronto para aceitar requisições."""
        try:
            response = requests.get(f"http://{self.host}:{self.port}", timeout=2)
            return response.status_code < 500
        except:
            return False

    def start_server(self) -> bool:
        """Inicia o servidor de desenvolvimento."""
        print(f"🚀 Iniciando servidor na porta {self.port}...")

        # Navega para o diretório raiz do projeto
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

        try:
            # Inicia o servidor Vite em background
            self.server_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=project_root,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=os.setsid  # Cria um novo grupo de processos
            )

            self.started_server = True

            # Aguarda o servidor estar pronto (até 30 segundos)
            max_attempts = 60
            for attempt in range(max_attempts):
                if self.is_server_ready():
                    print(f"✅ Servidor pronto em http://{self.host}:{self.port}")
                    return True

                # Verifica se o processo ainda está rodando
                if self.server_process.poll() is not None:
                    stdout, stderr = self.server_process.communicate()
                    print(f"❌ Servidor falhou ao iniciar:")
                    print(f"STDOUT: {stdout.decode()}")
                    print(f"STDERR: {stderr.decode()}")
                    return False

                time.sleep(0.5)
                if attempt % 4 == 0:
                    print(f"⏳ Aguardando servidor... ({attempt//2}s)")

            print(f"❌ Timeout aguardando servidor após {max_attempts//2} segundos")
            return False

        except Exception as e:
            print(f"❌ Erro ao iniciar servidor: {e}")
            return False

    def stop_server(self):
        """Para o servidor se foi iniciado por este script."""
        if self.started_server and self.server_process:
            print(f"\n🛑 Parando servidor...")
            try:
                # Mata todo o grupo de processos
                os.killpg(os.getpgid(self.server_process.pid), signal.SIGTERM)
                self.server_process.wait(timeout=5)
                print("✅ Servidor parado")
            except Exception as e:
                print(f"⚠️  Erro ao parar servidor: {e}")
                try:
                    # Força o término se necessário
                    os.killpg(os.getpgid(self.server_process.pid), signal.SIGKILL)
                except:
                    pass

    def ensure_running(self) -> bool:
        """Garante que o servidor está rodando."""
        if self.is_server_ready():
            print(f"✅ Servidor já está rodando em http://{self.host}:{self.port}")
            return True

        print(f"⚠️  Servidor não está rodando na porta {self.port}")
        return self.start_server()


def main():
    """Função principal."""
    manager = ServerManager()

    try:
        # Garante que o servidor está rodando
        if not manager.ensure_running():
            print("❌ Falha ao garantir que o servidor está rodando")
            sys.exit(1)

        # Executa o comando de teste se fornecido
        if len(sys.argv) > 1:
            test_command = sys.argv[1:]
            print(f"\n🧪 Executando testes: {' '.join(test_command)}")
            print("=" * 80)

            result = subprocess.run(test_command)
            exit_code = result.returncode
        else:
            print("\n✅ Servidor está pronto. Pressione Ctrl+C para parar.")
            try:
                # Mantém o script rodando
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n")
                exit_code = 0

        return exit_code

    finally:
        # Para o servidor se foi iniciado por este script
        manager.stop_server()


if __name__ == "__main__":
    sys.exit(main())
