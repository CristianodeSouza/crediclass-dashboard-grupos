# EXEMPLO DE TESTE DE INTEGRAÇÃO

**Objetivo:** Validar fluxo completo de sincronização com Google Sheets

---

## Teste 1: Sincronização Bem-Sucedida

### Pré-requisitos
```bash
# Terminal 1: Iniciar servidor
cd backend
python main.py
# Esperado: [STARTUP] [OK] Service Account carregado
# Esperado: [STARTUP] Iniciando background sync worker...
```

### Executar Teste
```bash
# Terminal 2: Fazer edição de grupo
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{
    "maior_credito": 350000,
    "menor_credito": 100000,
    "taxa_adm": 2.5,
    "tipo_bem": "Imovel",
    "editado_em": "teste_qa_001"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

### Esperado
```
HTTP Status: 200

{
  "message": "Grupo atualizado com sucesso. Sincronização em andamento...",
  "status": "sucesso",
  "sincronizacao": "pendente"
}
```

### Validar Logs (Terminal 1)
```
[EDITAR_GRUPO] Dados extraídos de GrupoUpdate para grupo 2125: [...]
[EDITAR_GRUPO] Valores: maior_credito=350000, menor_credito=100000

[UPDATE_GRUPO] Atualizando grupo 2125. Usuario: operador, Origem: Dashboard
[UPDATE_GRUPO] Dados RECEBIDOS: maior_credito=350000, menor_credito=100000, taxa_adm=2.5

[DEBUG] Iniciando sincronizacao de grupo 2125 com Google Sheets...
[DEBUG] Dados recebidos para sincronizar: 5 campos
[DEBUG] Service obtido com sucesso. Campos a atualizar: [...]

[DEBUG] Executando 5 updates para grupo 2125 (1 linhas)...
[SUCESSO] Grupo 2125 sincronizado. 1 respostas recebidas

[SYNC QUEUE] Item adicionado: grupo 2125
```

### Validar Cache
```bash
# Verificar que cache foi atualizado
cat data/grupos.json | grep -A 10 '"grupo": "2125"'

# Esperado:
# "maior_credito": 350000
# "taxa_adm": 2.5
# "editado_em": "teste_qa_001"
```

### Validar Auditoria
```bash
# Verificar que auditoria foi registrada
tail -20 data/auditoria.json | grep -A 5 '"grupo_id": "2125"'

# Esperado:
# "acao": "UPDATE"
# "usuario": "operador"
# "maior_credito": {"antes": ..., "depois": 350000}
```

### Validar Google Sheets
```bash
# Abrir manualmente em navegador:
# https://docs.google.com/spreadsheets/d/1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM/

# Procurar linha do grupo 2125
# Verificar colunas:
# - Maior Crédito: 350000 ✓
# - Menor Crédito: 100000 ✓
# - Taxa ADM: 2.5 ✓
# - Tipo de Bem: Imovel ✓
```

---

## Teste 2: Validação de Dados Inválidos

### Executar Teste
```bash
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": -10000}'
```

### Esperado
```
HTTP Status: 400

{
  "detail": "Validation error: maior_credito must be >= 0"
}
```

### Validar Logs
```
[DEBUG] Validando dados com Pydantic schema...
[ERRO] Validação falhou: maior_credito=-10000 (deve ser >= 0)
```

---

## Teste 3: Sincronização Falha (Network timeout)

### Setup
```bash
# Terminal 1: Parar Internet ou mockar falha
# Opção A (mais fácil): Kill service Worker
# Opção B: Disconnect network

# Fazer edição
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": 400000}'
```

### Esperado
```
HTTP Status: 200 (cache foi atualizado)

[UPDATE_GRUPO] Cache atualizado
[AVISO] Cache atualizado mas Google Sheets nao foi sincronizado

[SYNC QUEUE] Item adicionado: grupo 2125
```

### Validar Comportamento Graceful
```bash
# Fila deve ter item pendente
curl http://localhost:8000/api/sync-queue/status

# Esperado:
{
  "pendentes": 1,
  "items": [
    {
      "grupo_id": "2125",
      "sincronizado": false,
      "tentativas": 0,
      "erro": null
    }
  ]
}

# Restaurar Network
# Esperar 15-30 segundos
# Fila deve processar automaticamente

curl http://localhost:8000/api/sync-queue/status
# Esperado: {"pendentes": 0, "items": []}
```

---

## Teste 4: Fila de Sincronização

### Executar Teste
```bash
# Fazer 5 edições rápidas
for i in {1..5}; do
  echo "Editando grupo 2125 - tentativa $i"
  curl -X PUT http://localhost:8000/api/grupos/2125 \
    -H "Content-Type: application/json" \
    -d "{\"maior_credito\": $((350000 + i * 1000))}" \
    -s -o /dev/null
  
  sleep 0.5
done

# Verificar fila
curl http://localhost:8000/api/sync-queue/status
```

### Esperado
```
{
  "pendentes": 1,
  "items": [
    {
      "grupo_id": "2125",
      "dados": {
        "maior_credito": 355000  ← Última versão
      },
      "sincronizado": false
    }
  ]
}

# Nota: Fila deduplicates — apenas 1 item para grupo 2125
# com os dados MAIS RECENTES
```

### Validar Sincronização Automática
```bash
# Esperar 15 segundos (intervalo de processamento)
sleep 15

# Fila deve estar vazia
curl http://localhost:8000/api/sync-queue/status
# Esperado: {"pendentes": 0, "items": []}
```

---

## Teste 5: Detectar Campos Não Mapeados

### Executar Teste
```bash
# Adicionar campo novo que não existe no mapa
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{
    "maior_credito": 350000,
    "campo_novo_nao_mapeado": "teste"
  }'
```

### Esperado (APÓS CORRIGIR PROB-002)
```
Logs devem conter:
[AVISO] 1 campos NAO SERAO sincronizados: ['campo_novo_nao_mapeado']
[AVISO] campo_novo_nao_mapeado (nao esta em mapa_campo_para_coluna)
```

---

## Teste 6: Grupo Duplicado (PROB-005)

### Setup
```bash
# Encontrar grupo com duplicata no Sheets
# Ou criar uma manualmente para teste

grep '"grupo": "2125"' data/grupos.json | head -2
# Se houver 2, há duplicata
```

### Executar Teste
```bash
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": 350000}'
```

### Esperado (APÓS CORRIGIR PROB-005)
```
Logs devem conter:
[ALERTA CRÍTICO] Grupo 2125 encontrado 2 vezes!
[ALERTA] Linhas: [15, 245]
[ALERTA] RECOMENDAÇÃO: Verificar e mesclar duplicatas
```

---

## Teste 7: Performance da Fila

### Executar Teste
```bash
# Fazer 100 edições diferentes
for group_id in {2120..2220}; do
  curl -X PUT http://localhost:8000/api/grupos/$group_id \
    -H "Content-Type: application/json" \
    -d "{\"maior_credito\": $((300000 + RANDOM))}" \
    -s -o /dev/null &
done

wait

# Verificar fila
curl http://localhost:8000/api/sync-queue/status
```

### Esperado
```
{
  "pendentes": 100,  ← Todos em fila
  "items": [...]
}

# Após 60-90 segundos (100 * 1s throttle):
# Fila deve estar processando ou vazia
curl http://localhost:8000/api/sync-queue/status
# Esperado: {"pendentes": 0, "items": []}
```

---

## Teste 8: Rollback (Recuperação de Falha)

### Setup
```bash
# Simular sincronização com sucesso
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": 350000}'

# Esperar que sincronize
sleep 5

# Guardar estado atual
cp data/grupos.json data/grupos.json.backup
```

### Simular Falha
```bash
# Editar grupo
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": 999999}'

# "Falha" de sincronização (kill server ou disconnect)
# Pressionar Ctrl+C em Terminal 1

# Verificar cache foi atualizado
cat data/grupos.json | grep -A 1 "maior_credito" | head -2
# Mostra: 999999 ✓
```

### Rollback
```bash
# Restaurar backup
cp data/grupos.json.backup data/grupos.json

# Limpar fila
echo '{"items": []}' > data/sync_queue.json

# Reiniciar servidor
python main.py
```

### Validar
```bash
# Grupo deve voltar ao valor anterior
curl http://localhost:8000/api/grupos/2125 | grep maior_credito
# Esperado: 350000 (valor antes da falha)

# Fila deve estar vazia
curl http://localhost:8000/api/sync-queue/status
# Esperado: {"pendentes": 0, "items": []}
```

---

## Checklist de Testes

- [ ] Teste 1: Sincronização bem-sucedida ✓
- [ ] Teste 2: Validação de dados inválidos ✓
- [ ] Teste 3: Falha com graceful handling ✓
- [ ] Teste 4: Fila de sincronização ✓
- [ ] Teste 5: Campos não mapeados (APÓS PROB-002) ✓
- [ ] Teste 6: Grupo duplicado (APÓS PROB-005) ✓
- [ ] Teste 7: Performance com 100 grupos ✓
- [ ] Teste 8: Rollback e recuperação ✓

Se todos os testes passarem, sistema está pronto para produção.

---

## Comandos Úteis

```bash
# Ver últimas operações
tail -50 data/auditoria.json

# Limpar fila (se travada)
echo '{"items": []}' > data/sync_queue.json

# Reset completo
rm data/grupos.json data/sync_queue.json data/auditoria.json
python main.py
# Vai recarregar tudo do Google Sheets

# Monitorar logs em tempo real
# Terminal dedicado:
tail -f /tmp/crediclass.log | grep "\[DEBUG\]\|\[ERRO\]\|\[SUCESSO\]"

# Buscar erros
grep "\[ERRO" data/auditoria.json
grep "\[ERRO CRÍTICO\]" production.log
```

---

**Próximo passo:** Executar Teste 1 após corrigir PROB-001 e PROB-007.
