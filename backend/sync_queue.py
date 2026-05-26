#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fila de Sincronização com Google Sheets
Gerencia items pendentes de sincronização de forma assíncrona
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Optional
from .sheets import sincronizar_grupo_ao_sheets

SYNC_QUEUE_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "sync_queue.json")

class SyncQueue:
    """Gerencia a fila de sincronização com Google Sheets"""

    @staticmethod
    def _garantir_arquivo():
        """Cria arquivo sync_queue.json se não existir"""
        os.makedirs(os.path.dirname(SYNC_QUEUE_FILE), exist_ok=True)
        if not os.path.exists(SYNC_QUEUE_FILE):
            with open(SYNC_QUEUE_FILE, "w", encoding="utf-8") as f:
                json.dump({"items": []}, f, ensure_ascii=False, indent=2)

    @staticmethod
    def adicionar(grupo_id: str, dados: Dict, usuario: str = "sistema") -> bool:
        """Adiciona um item à fila de sincronização"""
        try:
            SyncQueue._garantir_arquivo()

            with open(SYNC_QUEUE_FILE, "r", encoding="utf-8") as f:
                fila = json.load(f)

            # Verificar se já existe
            for item in fila.get("items", []):
                if item["grupo_id"] == str(grupo_id):
                    # Atualizar item existente
                    item["dados"] = dados
                    item["usuario"] = usuario
                    item["tentativas"] = 0
                    item["ultima_tentativa"] = None
                    item["erro"] = None
                    with open(SYNC_QUEUE_FILE, "w", encoding="utf-8") as f:
                        json.dump(fila, f, ensure_ascii=False, indent=2)
                    return True

            # Adicionar novo item
            novo_item = {
                "grupo_id": str(grupo_id),
                "dados": dados,
                "usuario": usuario,
                "criado_em": datetime.now().isoformat(),
                "tentativas": 0,
                "ultima_tentativa": None,
                "erro": None,
                "sincronizado": False
            }

            fila["items"].append(novo_item)

            with open(SYNC_QUEUE_FILE, "w", encoding="utf-8") as f:
                json.dump(fila, f, ensure_ascii=False, indent=2)

            print(f"[SYNC QUEUE] Item adicionado: grupo {grupo_id}")
            return True
        except Exception as e:
            print(f"[SYNC QUEUE] Erro ao adicionar: {e}")
            return False

    @staticmethod
    def obter_pendentes() -> List[Dict]:
        """Retorna items pendentes de sincronização"""
        try:
            SyncQueue._garantir_arquivo()

            with open(SYNC_QUEUE_FILE, "r", encoding="utf-8") as f:
                fila = json.load(f)

            # Retorna items não sincronizados e com menos de 5 tentativas
            pendentes = [
                item for item in fila.get("items", [])
                if not item.get("sincronizado", False) and item.get("tentativas", 0) < 5
            ]

            return pendentes
        except Exception as e:
            print(f"[SYNC QUEUE] Erro ao obter pendentes: {e}")
            return []

    @staticmethod
    def marcar_como_sincronizado(grupo_id: str) -> bool:
        """Marca um item como sincronizado e remove da fila"""
        try:
            SyncQueue._garantir_arquivo()

            with open(SYNC_QUEUE_FILE, "r", encoding="utf-8") as f:
                fila = json.load(f)

            # Encontrar e atualizar item
            for item in fila.get("items", []):
                if item["grupo_id"] == str(grupo_id):
                    item["sincronizado"] = True
                    item["sincronizado_em"] = datetime.now().isoformat()

                    # Remover da fila após marcar
                    fila["items"] = [
                        i for i in fila["items"]
                        if not (i["grupo_id"] == str(grupo_id) and i.get("sincronizado"))
                    ]

                    with open(SYNC_QUEUE_FILE, "w", encoding="utf-8") as f:
                        json.dump(fila, f, ensure_ascii=False, indent=2)

                    print(f"[SYNC QUEUE] Sincronizado: grupo {grupo_id}")
                    return True

            return False
        except Exception as e:
            print(f"[SYNC QUEUE] Erro ao marcar sincronizado: {e}")
            return False

    @staticmethod
    def registrar_erro(grupo_id: str, erro: str) -> bool:
        """Registra erro em tentativa de sincronização"""
        try:
            SyncQueue._garantir_arquivo()

            with open(SYNC_QUEUE_FILE, "r", encoding="utf-8") as f:
                fila = json.load(f)

            for item in fila.get("items", []):
                if item["grupo_id"] == str(grupo_id):
                    item["tentativas"] = item.get("tentativas", 0) + 1
                    item["ultima_tentativa"] = datetime.now().isoformat()
                    item["erro"] = erro[:200]  # Limitar tamanho do erro

                    with open(SYNC_QUEUE_FILE, "w", encoding="utf-8") as f:
                        json.dump(fila, f, ensure_ascii=False, indent=2)

                    print(f"[SYNC QUEUE] Erro registrado (tentativa {item['tentativas']}): {erro[:100]}")
                    return True

            return False
        except Exception as e:
            print(f"[SYNC QUEUE] Erro ao registrar erro: {e}")
            return False


async def processar_fila_sincronizacao():
    """Background job que processa a fila de sincronização
    Deve ser chamado periodicamente (a cada 10-30 segundos)
    """
    try:
        pendentes = SyncQueue.obter_pendentes()

        if not pendentes:
            return {"processados": 0, "erros": 0}

        processados = 0
        erros = 0

        for item in pendentes:
            try:
                grupo_id = item["grupo_id"]
                dados = item.get("dados", {})
                usuario = item.get("usuario", "sistema")

                print(f"\n[SYNC WORKER] Processando grupo {grupo_id}...")

                # Tentar sincronizar com Google Sheets
                resultado = sincronizar_grupo_ao_sheets(grupo_id, dados)

                if resultado:
                    SyncQueue.marcar_como_sincronizado(grupo_id)
                    processados += 1
                    print(f"[SYNC WORKER] ✅ Sincronizado com sucesso: {grupo_id}")
                else:
                    erro_msg = "Falha ao sincronizar com Google Sheets"
                    SyncQueue.registrar_erro(grupo_id, erro_msg)
                    erros += 1
                    print(f"[SYNC WORKER] ❌ Erro: {erro_msg}")

            except Exception as e:
                SyncQueue.registrar_erro(item["grupo_id"], str(e))
                erros += 1
                print(f"[SYNC WORKER] ❌ Exceção: {str(e)[:100]}")

        return {
            "processados": processados,
            "erros": erros,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"[SYNC WORKER] ❌ Erro crítico ao processar fila: {e}")
        return {"processados": 0, "erros": 1, "erro_critico": str(e)}
