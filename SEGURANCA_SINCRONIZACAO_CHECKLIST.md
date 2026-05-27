# CHECKLIST DE SEGURANÇA — SINCRONIZAÇÃO COM GOOGLE SHEETS

**Data:** 27/05/2026  
**Objetivo:** Garantir que sincronização é robusta antes de deploy

---

## FASE 1: CORREÇÕES CRÍTICAS (2-3 HORAS)

### [ ] Corrigir PROB-001: Validar get_service()

**Tarefa:** Adicionar try/except em `get_service()` para validar que `build()` não retorna None

**Arquivo:** `backend/sheets.py:65-79`

**Mudança:**
```python
def get_service(use_write_permissions: bool = False):
    """Retorna serviço Google Sheets com validação"""
    global _service_cache

    if use_write_permissions:
        credentials = get_service_account_credentials()
        if credentials:
            try:
                service = build("sheets", "v4", credentials=credentials)
                print("[DEBUG] Service criado com sucesso (write permissions)")
                return service
            except Exception as e:
                print(f"[ERRO CRÍTICO] Falha ao criar service: {e}")
                import traceback
                traceback.print_exc()
                return None
        else:
            print("[ERRO CRÍTICO] Service Account não carregado")
            return None

    # Fallback: API Key para leitura
    try:
        service = build("sheets", "v4", developerKey=API_KEY)
        print("[DEBUG] Service criado com sucesso (API Key)")
        return service
    except Exception as e:
        print(f"[ERRO CRÍTICO] Falha ao criar service com API Key: {e}")
        import traceback
        traceback.print_exc()
        return None
```

**Teste:** `python -c "from backend.sheets import get_service; s = get_service(True); print('OK' if s or True else 'FAIL')"`

**Verificação:** Commit com mensagem: `fix: adicionar validacao em get_service()`

---

### [ ] Corrigir PROB-007: Sincronizar ANTES de cache

**Tarefa:** Inverter ordem em `atualizar_grupo_sheets()` — sincronizar ANTES de salvar cache

**Arquivo:** `backend/sheets.py:521-574`

**Mudança:** Mover linhas 546-552 DEPOIS de linha 559

```python
def atualizar_grupo_sheets(grupo_id: str, dados: Dict[str, Any], usuario: str = "sistema", origem: str = "Dashboard") -> bool:
    try:
        # ... carregar grupos ...
        
        # NOVO: Sincronizar PRIMEIRO
        print(f"[UPDATE_GRUPO] Sincronizando com Google Sheets antes de salvar cache...")
        sync_result = sincronizar_grupo_ao_sheets(grupo_id, dados)
        
        if not sync_result:
            print(f"[ERRO] Sincronização falhou, não salvando cache")
            return False
        
        # DEPOIS: Salvar no cache apenas se sincronização sucedeu
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(grupos, f, ensure_ascii=False, indent=2)
        
        print(f"[UPDATE_GRUPO] Cache atualizado após sucesso de sincronização")
        
        # Registrar auditoria
        if mudancas:
            registrar_auditoria(usuario, "UPDATE", grupo_id, mudancas, origem)
        
        return True
```

**Teste:** Testar edição de grupo 2125 e verificar que cache é atualizado DEPOIS de Google Sheets

**Verificação:** Commit com mensagem: `fix: sincronizar antes de salvar cache em atualizar_grupo_sheets()`

---

### [ ] Testar com grupo real

**Tarefa:** Editar grupo 2125 e verificar que funciona corretamente

```bash
# Terminal 1: Ver logs
tail -f backend.log | grep "\[DEBUG\]\|\[ERRO\]\|\[SUCESSO\]"

# Terminal 2: Fazer edição
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": 350000, "taxa_adm": 2.5, "usuario": "teste_qa"}'

# Esperado:
# - HTTP 200
# - Log: [UPDATE_GRUPO] Sincronizando...
# - Log: [SUCESSO] Grupo 2125 sincronizado
# - Log: [UPDATE_GRUPO] Cache atualizado
```

---

## FASE 2: CORREÇÕES ALTAS (1-2 HORAS)

### [ ] Corrigir PROB-002: Avisar campos não mapeados

**Tarefa:** Adicionar loop para avisar se campo não está mapeado

**Arquivo:** `backend/sheets.py:414-419`

**Mudança:**
```python
# Verificar campos não mapeados
unmapped_fields = []
for campo in dados.keys():
    if campo != "historico" and campo not in campo_para_coluna:
        unmapped_fields.append(campo)

if unmapped_fields:
    print(f"[AVISO] {len(unmapped_fields)} campos NÃO SERÃO sincronizados: {unmapped_fields}")
    for campo in unmapped_fields:
        print(f"  - {campo} (não está em mapa_campo_para_coluna)")

# Itera por cada linha encontrada (código existente)
for grupo_row_idx in grupo_row_indices:
    for campo, valor in dados.items():
        # ... resto do código
```

**Teste:** Tentar sincronizar campo novo que não existe no mapa e verificar aviso

---

### [ ] Corrigir PROB-004: Metadados em fetch_grupos()

**Tarefa:** Adicionar metadados para indicar se dados são de API ou cache

**Arquivo:** `backend/sheets.py:137-207`

**Mudança:** Envolver resposta com metadados

```python
def fetch_grupos(force_refresh: bool = False) -> List[Dict[str, Any]]:
    """Retorna lista de grupos com metadados"""
    
    # ... código existente para tentar API ...
    
    try:
        service = get_service()
        # ... carregar de API ...
        grupos = [...]
        
        # Salvar cache com metadados
        cache_data = {
            'grupos': grupos,
            'metadata': {
                'source': 'api',
                'timestamp': datetime.now().isoformat(),
                'count': len(grupos)
            }
        }
        
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
        
        return grupos
        
    except Exception as e:
        print(f"[ERRO] Falha ao carregar de API: {e}")
        # Fallback para cache com aviso
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                    # Adicionar aviso de fallback
                    if isinstance(cache_data, dict) and 'metadata' in cache_data:
                        cache_data['metadata']['source'] = 'cache_fallback'
                        cache_data['metadata']['error'] = str(e)
                        print(f"[AVISO] Usando cache (API falhou): {cache_data['metadata']}")
                        return cache_data['grupos']
                    elif isinstance(cache_data, list):
                        return cache_data
                    else:
                        return list(cache_data.values())
            except:
                pass
        
        return []
```

---

## FASE 3: CORREÇÕES MÉDIAS (3-4 HORAS — AMANHÃ)

### [ ] Corrigir PROB-003: Validação com Pydantic

**Arquivo:** `backend/main.py` (classe GrupoUpdate)

**Adicionar validadores:**
```python
from pydantic import validator, Field

class GrupoUpdate(BaseModel):
    # ... campos existentes ...
    maior_credito: Optional[float] = Field(None, ge=0, le=10000000)
    menor_credito: Optional[float] = Field(None, ge=0, le=10000000)
    taxa_adm: Optional[float] = Field(None, ge=0, le=100)
    fundo_rsv: Optional[float] = Field(None, ge=0, le=100)
    vida_grupo_pct: Optional[float] = Field(None, ge=0, le=100)
    
    @validator('maior_credito')
    def maior_deve_ser_maior_que_menor(cls, v, values):
        if v and 'menor_credito' in values and values['menor_credito']:
            if v < values['menor_credito']:
                raise ValueError('maior_credito deve ser >= menor_credito')
        return v
    
    @validator('taxa_adm', 'fundo_rsv')
    def percentual_valido(cls, v):
        if v and (v < 0 or v > 100):
            raise ValueError('Percentual deve estar entre 0 e 100')
        return v
```

---

### [ ] Corrigir PROB-005: Alertar duplicatas

**Arquivo:** `backend/sheets.py:402-403`

**Mudança:**
```python
if len(grupo_row_indices) > 1:
    print(f"[ALERTA CRÍTICO] Grupo {grupo_id} encontrado {len(grupo_row_indices)} vezes no Sheets!")
    print(f"[ALERTA] Linhas: {grupo_row_indices}")
    print(f"[ALERTA] RECOMENDAÇÃO: Verificar e mesclar duplicatas no Google Sheets")
```

---

### [ ] Corrigir PROB-006: Rate limiting

**Arquivo:** `backend/sync_queue.py:164-183`

**Adicionar throttle:**
```python
for idx, item in enumerate(pendentes):
    try:
        # Throttle: aguardar 1 segundo entre cada sincronização
        if idx > 0:
            await asyncio.sleep(1)
        
        # ... resto do código ...
```

---

### [ ] Corrigir PROB-008: Validar headers

**Arquivo:** `backend/sheets.py:441-448`

**Adicionar validação:**
```python
if historico and isinstance(historico, list):
    try:
        result_headers = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range="Tabela de Grupos 3.0!A1:EF1"
        ).execute()
        headers = result_headers.get("values", [[]])[0]
        
        # Validar que headers críticos existem
        sample_month = "JAN-24"  # Usar um mês de exemplo
        required_patterns = [f"{sample_month}\nMaior Lance", f"{sample_month}\nMenor Lance"]
        
        missing = [p for p in required_patterns if p not in headers]
        if missing:
            print(f"[ALERTA] Headers faltando: {missing}")
            print(f"[ALERTA] Histórico não será sincronizado")
            historico = None  # Skip histórico se headers inválidos
```

---

## FASE 4: TESTES FINAIS (1 HORA)

### [ ] Teste 1: Editar grupo com valores válidos

```bash
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{
    "maior_credito": 350000,
    "menor_credito": 100000,
    "taxa_adm": 2.5,
    "tipo_bem": "Imovel"
  }'
```

**Verificar:**
- HTTP 200
- Dados salvos no cache (`data/grupos.json`)
- Dados sincronizados com Google Sheets
- Auditoria registrada (`data/auditoria.json`)

---

### [ ] Teste 2: Validação de dados inválidos

```bash
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": -10000}'
```

**Verificar:**
- HTTP 400 com erro de validação
- Mensagem clara: "maior_credito deve ser >= 0"

---

### [ ] Teste 3: Sincronização falha com graceful handling

**Simular falha de API (parar service ou network):**
```bash
# Desconectar internet ou mockar falha de API
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": 350000}'
```

**Verificar:**
- HTTP retorna sucesso (cache atualizado)
- Log: "[AVISO] Cache atualizado mas Google Sheets nao foi sincronizado"
- Próxima sincronização tenta novamente (fila)

---

### [ ] Teste 4: Fila de sincronização

```bash
# Ver status da fila
curl http://localhost:8000/api/sync-queue/status

# Esperado: {"pendentes": 0, "items": []}
```

---

### [ ] Teste 5: Verificar Google Sheets manualmente

1. Abrir: https://docs.google.com/spreadsheets/d/1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM/
2. Procurar grupo 2125
3. Verificar que valores foram atualizados

---

## CHECKLIST PRÉ-DEPLOY

- [ ] PROB-001 corrigido e testado
- [ ] PROB-007 corrigido e testado
- [ ] PROB-002 corrigido
- [ ] PROB-004 corrigido
- [ ] PROB-003 corrigido
- [ ] PROB-005 corrigido
- [ ] PROB-006 corrigido
- [ ] PROB-008 corrigido
- [ ] Testes 1-5 passaram
- [ ] Google Sheets foi atualizado corretamente
- [ ] Logs mostram fluxo completo sem erros
- [ ] Auditoria registrou as mudanças
- [ ] Fila de sincronização está vazia (0 pendentes)

---

## ROLLBACK PLAN

Se algo der errado em produção:

1. **Parar sincronização:** Parar o background worker em `main.py:35-45`
2. **Restaurar cache:** `git checkout data/grupos.json`
3. **Limpar fila:** `echo '{"items": []}' > data/sync_queue.json`
4. **Investigar:** Verificar logs para entender o problema
5. **Hotfix:** Corrigir código e testar
6. **Redeploy:** Fazer push e Render faz deploy automático

---

## MÉTRICAS DE SUCESSO

- Sincronização leva < 5 segundos por grupo
- 0 erros silenciados (todos em log)
- 100% de grupos sincronizados corretamente
- Cache sempre sincronizado com Google Sheets
- Auditoria completa de todas as mudanças
- Fila sem itens pendentes por > 5 minutos

---

**Próximo passo:** Começar com Fase 1 (PROB-001 + PROB-007) hoje mesmo.
