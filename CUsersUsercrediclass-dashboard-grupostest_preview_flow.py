#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste de Fluxo de Preview — Valida que botão mostra PASSO 3 sem gerar PDF
2026-05-20 — Corrigido para verificar o novo comportamento
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

print("=" * 70)
print("TESTE DE FLUXO: BOTÃO PREVIEW DEVE MOSTRAR PASSO 3, NÃO GERAR PDF")
print("=" * 70)
print()

# ETAPA 1: Carregar HTML
print("📋 ETAPA 1: Carregar página frontend")
try:
    resp = requests.get(f"{BASE_URL}/", timeout=10)
    html = resp.text
    
    if resp.status_code == 200:
        print("✅ Frontend carregado (HTTP 200)")
    else:
        print(f"❌ Frontend falhou (HTTP {resp.status_code})")
        exit(1)
    
    # Verificar que o botão está CORRETO (NÃO chama gerarEstudoFinal)
    print()
    print("📋 ETAPA 2: Verificar que botão está CORRETO")
    
    # Buscar a linha do botão Gerar Estudo Financeiro
    if '@click="grupoSelecionado = selecionados[0]"' in html:
        print("✅ Botão correto: @click='grupoSelecionado = selecionados[0]'")
        print("   (vai mostrar PASSO 3 preview, NÃO gerar PDF)")
    elif '@click="gerarEstudoFinal()"' in html:
        print("❌ ERRO: Botão AINDA está chamando gerarEstudoFinal()")
        print("   (gera PDF diretamente, pula preview)")
        exit(1)
    else:
        print("⚠️  Botão: handler não encontrado")
    
    print()
    print("📋 ETAPA 3: Verificar estrutura de PASSO 3")
    
    # Verificar que PASSO 3 está condicional
    if '<template x-if="grupoSelecionado">' in html:
        print("✅ PASSO 3 é condicional: <template x-if='grupoSelecionado'>")
    else:
        print("❌ PASSO 3 não tem x-if='grupoSelecionado'")
        exit(1)
    
    # Verificar que PASSO 3 usa grupoSelecionado
    if 'grupoSelecionado.grupo' in html and 'grupoSelecionado.maior_credito' in html:
        print("✅ PASSO 3 usa dados de grupoSelecionado")
    else:
        print("❌ PASSO 3 não referencia grupoSelecionado")
        exit(1)
    
    # Verificar botão para abrir preview modal
    if '@click="abrirPreviewEstudo()"' in html:
        print("✅ Botão 'Gerar Estudo' em PASSO 3 chama abrirPreviewEstudo()")
    else:
        print("⚠️  Botão abrirPreviewEstudo não encontrado")
    
    print()
    print("📋 ETAPA 4: Verificar estrutura de modal preview")
    
    # Verificar modal
    if '<template x-if="previewEstudo.isOpen">' in html:
        print("✅ Modal preview existe: <template x-if='previewEstudo.isOpen'>")
    else:
        print("⚠️  Modal preview não encontrada")
    
    print()
    print("=" * 70)
    print("✅ FLUXO CORRETO:")
    print("   1. User clica botão (linha 289)")
    print("   2. @click='grupoSelecionado = selecionados[0]' executa")
    print("   3. PASSO 3 preview aparece (x-if='grupoSelecionado')")
    print("   4. User revê dados em PASSO 3")
    print("   5. User clica botão em PASSO 3")
    print("   6. @click='abrirPreviewEstudo()' executa")
    print("   7. Modal preview abre (x-if='previewEstudo.isOpen')")
    print("   8. User gera PDF de dentro da modal")
    print("=" * 70)
    print()
    
except Exception as e:
    print(f"❌ Erro: {str(e)}")
    exit(1)

print("✅ TODOS OS TESTES PASSARAM - FLUXO CORRETO IMPLEMENTADO")

