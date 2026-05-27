# RELATÓRIO DE VALIDAÇÃO CRÍTICA — SISTEMA DE SINCRONIZAÇÃO COM GOOGLE SHEETS

**Data:** 27/05/2026  
**Projeto:** Crediclass Dashboard Grupos  
**Escopo:** Validação rigorosa de sincronização com Google Sheets  
**Status:** ANÁLISE COMPLETA COM 8 PROBLEMAS IDENTIFICADOS

---

## RESUMO EXECUTIVO

### Problemas Encontrados
- **2 CRÍTICOS** — Podem causar perda de dados ou corrupção
- **2 ALTOS** — Podem causar dados desatualizados ou perdidos
- **4 MÉDIOS** — Podem afetar performance ou casos edge

### Verdict: NÃO SEGURO PARA DEPLOY
**O sistema tem vulnerabilidades críticas que devem ser corrigidas ANTES de deploy em produção.**

---

## PROBLEMAS CRÍTICOS (2)

### PROB-001: get_service() não valida retorno de build()
**Severidade:** CRÍTICA  
**Arquivo:** `backend/sheets.py:65-79`

#### Descrição
A função `get_service()` retorna o resultado de `build()` sem verificar se é válido:

```python
# PROBLEMA: build() pode falhar silenciosamente
return build("sheets", "v4", developerKey=API_KEY)
```

Se a Google API client falha durante `build()`, um objeto inválido é retornado.

#### Impacto
- Sincronização falha posteriormente com erro confuso
- Erro não é tratado no ponto de falha
- Fila de sincronização recebe None/objeto inválido

#### Solução Recomendada
```python
def get_service(use_write_permissions: bool = False):
    """Retorna serviço Google Sheets com validação"""
    global _service_cache

    if use_write_permissions:
        credentials = get_service_account_credentials()
        if credentials:
            try:
                service = build("sheets", "v4", credentials=credentials)
                print("[OK] Service com write permissions criado")
                return service
            except Exception as e:
                print(f"[ERRO] Falha ao criar service com write: {e}")
                return None
        else:
            print("[ERRO CRÍTICO] Service Account não disponível")
            return None

    # Fallback: API Key para leitura
    try:
        service = build("sheets", "v4", developerKey=API_KEY)
        print("[OK] Service com API Key criado")
        return service
    except Exception as e:
        print(f"[ERRO] Falha ao criar service com API Key: {e}")
        return None
```

---

### PROB-007: atualizar_grupo_sheets() não valida dados antes de salvar em cache
**Severidade:** CRÍTICA  
**Arquivo:** `backend/sheets.py:521-574`

#### Descrição
A função atualiza o cache local ANTES de validar sincronização com Google Sheets:

```python
# Linha 546-552: Cache é atualizado ANTES da sincronização
grupos[grupo_idx].update(dados)
os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
with open(CACHE_FILE, "w", encoding="utf-8") as f:
    json.dump(grupos, f, ensure_ascii=False, indent=2)

# Depois tenta sincronizar (pode falhar)
sync_result = sincronizar_grupo_ao_sheets(grupo_id, dados)
```

#### Impacto
- Se sincronização falha, cache contém dados nunca validados pelo Google Sheets
- Discrepância entre dados local (cache) e remoto (Google Sheets)
- Próxima leitura retorna dados desincronizados
- Sem forma de recuperar estado anterior

#### Solução Recomendada
```python
def atualizar_grupo_sheets(grupo_id: str, dados: Dict[str, Any], usuario: str = "sistema") -> bool:
    try:
        # 1. Carregar cache
        grupos = fetch_grupos(force_refresh=True)
        
        # 2. VALIDAR dados antes de qualquer alteração
        # TODO: Adicionar schema validation com Pydantic
        
        # 3. SINCRONIZAR com Google Sheets PRIMEIRO
        sync_result = sincronizar_grupo_ao_sheets(grupo_id, dados)
        
        if not sync_result:
            print(f"[ERRO] Sincronização falhou, não salvando cache")
            return False
        
        # 4. APENAS depois de sucesso, salvar no cache
        grupo_idx = None
        for i, g in enumerate(grupos):
            if str(g.get("grupo")) == str(grupo_id):
                grupo_idx = i
                break
        
        if grupo_idx is not None:
            grupos[grupo_idx].update(dados)
            
            # Salvar cache
            os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
            with open(CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump(grupos, f, ensure_ascii=False, indent=2)
        
        # 5. Registrar auditoria
        # ...
        
        return True
```

---

## PROBLEMAS ALTOS (2)

### PROB-002: Campos não mapeados são ignorados silenciosamente
**Severidade:** ALTA  
**Arquivo:** `backend/sheets.py:416-419`

#### Descrição
Se um campo está em `dados` mas NÃO está em `mapa_campo_para_coluna()`, é ignorado sem aviso:

```python
if campo in campo_para_coluna:  # ← Se False, continua silenciosamente
    # ... atualizar
    updates.append({...})
```

#### Impacto
- Novos campos adicionados ao banco não são sincronizados
- Usuário não sabe que sincronização foi parcial
- Dados perdidos sem indicação de erro

#### Solução
```python
unmapped_fields = []
for campo, valor in dados.items():
    if campo == "historico":
        continue
    if campo not in campo_para_coluna:
        unmapped_fields.append(campo)
        print(f"[AVISO] Campo '{campo}' não está mapeado para Google Sheets")
    else:
        # ... atualizar normalmente

if unmapped_fields:
    print(f"[AVISO] {len(unmapped_fields)} campos não foram sincronizados: {unmapped_fields}")
```

---

### PROB-004: fetch_grupos() retorna cache desatualizado sem indicar erro
**Severidade:** ALTA  
**Arquivo:** `backend/sheets.py:137-207`

#### Descrição
Se Google Sheets API falha, função retorna cache antigo sem metadados de erro:

```python
except Exception as e:
    print(f"Erro ao carregar dados do Google Sheets: {e}")
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)  # ← Retorna sem indicar que é desatualizado
    return []
```

#### Impacto
- Usuário vê dados que podem ter dias de atraso
- Sem indicação visual de que API falhou
- Recomendações podem ser baseadas em dados desatualizados

#### Solução
```python
def fetch_grupos(force_refresh: bool = False) -> Dict[str, Any]:
    """Retorna {'grupos': [...], 'metadata': {'source': 'api|cache', 'age': ...}}"""
    
    if not force_refresh and os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                cache = json.load(f)
                if isinstance(cache, dict) and 'metadata' in cache:
                    return cache  # Retorna com metadados
                # Cache antigo sem metadados
                return {
                    'grupos': cache if isinstance(cache, list) else list(cache.values()),
                    'metadata': {'source': 'cache_legacy', 'warning': 'Dados podem estar desatualizados'}
                }
        except:
            pass
    
    try:
        service = get_service()
        result = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=SHEET_RANGE
        ).execute()
        
        # ... processar
        grupos = [...]
        
        # Salvar com metadados
        cache_data = {
            'grupos': grupos,
            'metadata': {
                'source': 'api',
                'timestamp': datetime.now().isoformat(),
                'age_seconds': 0
            }
        }
        
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
        
        return cache_data
        
    except Exception as e:
        print(f"[ERRO] Falha ao carregar de API: {e}")
        # Tentar carregar cache com aviso
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r") as f:
                    cached = json.load(f)
                    # Adicionar aviso de que é desatualizado
                    if isinstance(cached, dict) and 'metadata' in cached:
                        cached['metadata']['source'] = 'cache_fallback'
                        cached['metadata']['error'] = str(e)
                        return cached
            except:
                pass
        
        return {
            'grupos': [],
            'metadata': {'error': 'Não foi possível carregar dados', 'source': 'error'}
        }
```

---

## PROBLEMAS MÉDIOS (4)

### PROB-003: Validação de dados insuficiente
**Severidade:** MÉDIA  
**Arquivo:** `backend/sheets.py:362-364`

**Descrição:** Não há validação de tipos/ranges antes de sincronizar.

**Solução:** Usar Pydantic SchemaValidator em `main.py:66-79`:

```python
from pydantic import BaseModel, validator, Field

class GrupoUpdateValidated(BaseModel):
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
```

---

### PROB-005: Grupo duplicado no Google Sheets
**Severidade:** MÉDIA  
**Arquivo:** `backend/sheets.py:387-403`

**Descrição:** Se grupo_id aparece múltiplas vezes, TODAS as linhas são atualizadas (ok), mas verificação é limitada.

**Solução:** Adicionar alerta se duplicatas > 1:

```python
if len(grupo_row_indices) > 1:
    print(f"[ALERTA CRÍTICO] Grupo {grupo_id} encontrado {len(grupo_row_indices)} vezes!")
    print(f"[ALERTA] Recomendação: Verificar e mesclar duplicatas no Google Sheets")
    # Poderia retornar erro ou marcar como "sob revisão"
```

---

### PROB-006: Sem tratamento de rate limiting
**Severidade:** MÉDIA  
**Arquivo:** `backend/sync_queue.py:151-198`

**Descrição:** Fila sincroniza items muito rapidamente, pode atingir rate limit da API.

**Solução:** Adicionar exponential backoff em `sync_queue.py`:

```python
async def processar_fila_sincronizacao():
    pendentes = SyncQueue.obter_pendentes()
    
    processados = 0
    erros = 0
    
    for idx, item in enumerate(pendentes):
        try:
            # Throttle: 1 segundo entre cada sincronização
            if idx > 0:
                await asyncio.sleep(1)
            
            grupo_id = item["grupo_id"]
            dados = item.get("dados", {})
            
            resultado = sincronizar_grupo_ao_sheets(grupo_id, dados)
            
            if resultado:
                SyncQueue.marcar_como_sincronizado(grupo_id)
                processados += 1
            else:
                # Exponential backoff on retry
                tentativas = item.get("tentativas", 0)
                wait_time = min(60, 2 ** tentativas)  # Max 60 segundos
                SyncQueue.registrar_erro(grupo_id, f"Retry em {wait_time}s")
                erros += 1
        
        except Exception as e:
            SyncQueue.registrar_erro(item["grupo_id"], str(e))
            erros += 1
    
    return {"processados": processados, "erros": erros}
```

---

### PROB-008: Histórico requer headers validados
**Severidade:** MÉDIA  
**Arquivo:** `backend/sheets.py:441-487`

**Descrição:** Se headers do Sheets mudam, sincronização de histórico falha.

**Solução:** Validar headers antes de processar:

```python
if historico and isinstance(historico, list):
    try:
        result_headers = service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range="Tabela de Grupos 3.0!A1:EF1"
        ).execute()
        headers = result_headers.get("values", [[]])[0]
        
        # VALIDAR que headers críticos existem
        required_headers = [
            "JAN-24\nMaior Lance", "JAN-24\nMenor Lance", "JAN-24\nQtd",
            # ... outros meses
        ]
        
        missing_headers = [h for h in required_headers if h not in headers]
        if missing_headers:
            print(f"[ALERTA] Headers faltando: {missing_headers}")
            print(f"[ALERTA] Histórico não será sincronizado")
            # Não processar histórico se headers inválidos
        else:
            # ... processar histórico normalmente
    except Exception as e:
        print(f"[ERRO] Falha ao sincronizar histórico: {e}")
        # Continuar sincronizando outros campos
```

---

## PONTOS POSITIVOS

### Implementações Corretas
- ✓ **Type hints** em todas as funções críticas (`sincronizar_grupo_ao_sheets`, `atualizar_grupo_sheets`)
- ✓ **Logging detalhado** com 20+ linhas de debug em `sincronizar_grupo_ao_sheets()`
- ✓ **Retornos explícitos** (True/False) sem retornos implícitos
- ✓ **Erros não silenciados** - todos os `except` têm `try/except Exception with logging`
- ✓ **get_service() retorna None** corretamente quando Service Account falha

---

## CHECKLIST PRÉ-DEPLOY

### Antes de fazer deploy em PRODUÇÃO, execute:

- [ ] **CRÍTICO** - Implementar validação em `get_service()` (PROB-001)
- [ ] **CRÍTICO** - Inverter ordem de cache/sincronização em `atualizar_grupo_sheets()` (PROB-007)
- [ ] **ALTO** - Adicionar aviso para campos não mapeados (PROB-002)
- [ ] **ALTO** - Retornar metadados com `fetch_grupos()` (PROB-004)
- [ ] **MÉDIO** - Adicionar validação com Pydantic (PROB-003)
- [ ] **MÉDIO** - Alertar quando grupo duplicado (PROB-005)
- [ ] **MÉDIO** - Adicionar rate limiting na fila (PROB-006)
- [ ] **MÉDIO** - Validar headers antes de sincronizar histórico (PROB-008)

---

## ROTEIRO DE CORREÇÃO (Por Ordem de Prioridade)

### Fase 1 (HOJE — Crítica) — 2-3 horas
1. Corrigir PROB-001: `get_service()` com try/except
2. Corrigir PROB-007: Inverter ordem cache/sync em `atualizar_grupo_sheets()`
3. Testar com grupo real (grupo 2125)

### Fase 2 (HOJE — Alta) — 1-2 horas
4. Corrigir PROB-002: Avisos para campos não mapeados
5. Corrigir PROB-004: Metadados em `fetch_grupos()`

### Fase 3 (AMANHÃ — Média) — 3-4 horas
6. Corrigir PROB-003: Validação Pydantic
7. Corrigir PROB-005: Alerta de duplicatas
8. Corrigir PROB-006: Rate limiting
9. Corrigir PROB-008: Validação de headers

### Fase 4 (VERIFICAÇÃO) — 1 hora
10. Testes completos com múltiplos grupos
11. Testes com fila de sincronização
12. Deploy em staging

---

## TESTES RECOMENDADOS

### Teste 1: Editar grupo com valores válidos
```bash
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": 350000, "taxa_adm": 2.5}'
```
**Esperado:** HTTP 200, grupo atualizado em cache E Google Sheets

### Teste 2: Editar grupo com valores inválidos
```bash
curl -X PUT http://localhost:8000/api/grupos/2125 \
  -H "Content-Type: application/json" \
  -d '{"maior_credito": -10000}'
```
**Esperado:** HTTP 400 com mensagem de validação

### Teste 3: Verificar fila de sincronização
```bash
curl http://localhost:8000/api/sync-queue/status
```
**Esperado:** `{"pendentes": 0, "items": []}`

### Teste 4: Verificar logs de sincronização
```bash
# Procurar em logs por [SUCESSO] ou [ERRO CRÍTICO]
tail -f /var/log/crediclass.log | grep "\[SYNC\]"
```

### Teste 5: Verificar Google Sheets
```bash
# Verificar que valores foram atualizados
# https://docs.google.com/spreadsheets/d/1DlaihGVraM8tmE3_y35Wldr6K2hhFlHTGq6-yYs9SGM/
```

---

## CONCLUSÃO

### Status Atual
- ✓ Logging está bom
- ✓ Type hints estão presentes
- ✗ Validações críticas faltam
- ✗ Tratamento de erro incompleto
- ✗ Ordem de operações incorreta (cache ANTES de sync)

### Verdict: NÃO SEGURO PARA DEPLOY

**Recomendação:** Corrigir PROB-001 e PROB-007 (críticas) e testar antes de qualquer deploy em produção.

**Tempo estimado:** 2-3 horas para corrigir os críticos + 1 hora de testes = 3-4 horas total.

**Próximo passo:** Executar Fase 1 do roteiro de correção.

---

**Gerado por:** QA Validation Suite  
**Data:** 2026-05-27  
**Próxima revisão:** Após implementação de Fase 1
