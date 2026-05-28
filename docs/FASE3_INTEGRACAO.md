# FASE 3: Integração Frontend + Backend FastAPI

**Data de Início:** 2026-05-28  
**Status:** 🟡 Em Progresso  

## Objetivo

Conectar o frontend Next.js criado em FASE 2 com os endpoints FastAPI existentes no Render, validar payloads e sincronização com Google Sheets.

## Descobertas de Integração

### 1. Estrutura de Grupo no Backend

**GrupoUpdate (Pydantic Model)**
```python
class GrupoUpdate(BaseModel):
    adm: Optional[str]
    grupo: Optional[str]
    tipo_bem: Optional[str]
    maior_credito: Optional[float]
    menor_credito: Optional[float]
    taxa_adm: Optional[float]
    fundo_rsv: Optional[float]
    investidor: Optional[float]
    conservador_24m: Optional[float]
    moderado_12m: Optional[float]
    status: Optional[str]
    dados_adicionais: Optional[Dict[str, Any]]
    historico: Optional[list[HistoricoData]]
```

**HistoricoData (Pydantic Model)**
```python
class HistoricoData(BaseModel):
    mes: str                    # JAN-24, FEV-24, ..., DEC-26
    maior_lance: Optional[float]
    menor_lance: Optional[float]
    qtd: Optional[int]          # Quantidade de contemplações
```

### 2. Discrepância Encontrada ✅ RESOLVIDA

**Decisão: Opção A — Simplificar frontend para maior_lance, menor_lance, qtd**

Frontend agora envia (types/index.ts):
```typescript
interface HistoricoMensal {
  mes: string;
  maior_lance?: number;
  menor_lance?: number;
  qtd?: number;
}
```

Backend espera (main.py):
```python
mes: str
maior_lance: Optional[float]
menor_lance: Optional[float]
qtd: Optional[int]
```

✅ **Frontend e backend agora estão alinhados**

### 3. Mapeamento de Campos

| Frontend | Backend | Descrição |
|----------|---------|-----------|
| saldo | ??? | Não mapeado — verificar com usuário |
| juros | ??? | Não mapeado — verificar com usuário |
| multa | ??? | Não mapeado — verificar com usuário |
| taxa_adm | ??? | Conflito: campo top-level vs histórico |
| observacoes | ??? | Não mapeado no backend |
| | maior_lance | Maior lance do mês |
| | menor_lance | Menor lance do mês |
| | qtd | Quantidade de contemplações |

### 4. Endpoint PUT /api/grupos/{grupo_id}

**URL:**
```
PUT https://crediclass.csrtecnologia.com.br/api/grupos/{grupo_id}
```

**Headers:**
```
Content-Type: application/json
```

**Query Params:**
```
usuario=operador  (opcional, padrão: "operador")
```

**Request Body (exemplo):**
```json
{
  "adm": "CNP",
  "grupo": "Grupo A",
  "tipo_bem": "Imóvel",
  "maior_credito": 500000,
  "menor_credito": 50000,
  "taxa_adm": 0.15,
  "fundo_rsv": 0.05,
  "investidor": 0.02,
  "conservador_24m": 24,
  "moderado_12m": 12,
  "status": "ativo",
  "historico": [
    {
      "mes": "JAN-24",
      "maior_lance": 100000,
      "menor_lance": 10000,
      "qtd": 5
    },
    ...
  ]
}
```

**Response (sucesso):**
```json
{
  "message": "Grupo atualizado com sucesso. Sincronização em andamento...",
  "status": "sucesso",
  "sincronizacao": "pendente"
}
```

**Response (erro):**
```json
{
  "detail": "Erro ao editar grupo: ..."
}
```

### 5. Processo de Sincronização

1. **Frontend PUT** → Backend recebe dados
2. **Backend cache** → Atualiza grupo na memória (fetch_grupos com force_refresh=True)
3. **SyncQueue** → Adiciona grupo à fila de sincronização
4. **Background job** → A cada 15 segundos processa a fila
5. **Google Sheets** → atualizar_grupo_sheets() escreve dados
6. **Response** → Retorna "sincronizacao": "pendente"

**Importante:** A sincronização é ASSÍNCRONA. O frontend não precisa esperar.

### 6. Endpoints Testados

✅ **GET /api/stats**
- Retorna: total_grupos, por_administradora, por_tipo_bem, media_lance_geral, administradoras, tipos_bem

✅ **GET /api/grupos**
- Query params: adm, tipo_bem, categoria, prazo_restante_min/max, vida_min/max, credito_min, busca

✅ **GET /api/grupos-gerenciador**
- Query params: adm, status, credito_min/max, busca, ordenar_por, ordem, pagina, por_pagina
- Retorna: Lista paginada com total

🔴 **PUT /api/grupos/{grupo_id}**
- ⚠️ DISCREPÂNCIA NOS CAMPOS DO HISTÓRICO
- Precisa correção antes de usar em produção

## Próximas Ações

### 1. ✅ Estrutura de Histórico Resolvida
- [x] Decisão: Opção A (simplificar frontend)
- [x] Atualizar types/index.ts HistoricoMensal
- [x] Atualizar HistoricoMensalForm.tsx com campos corretos
- [x] Validar GrupoEditModal compatibilidade

### 2. ✅ Frontend Alinhado com Backend

### 3. Testes de Integração
- [ ] npm install && npm run dev (frontend)
- [ ] Testar GET /api/stats (carrega header stats)
- [ ] Testar GET /api/grupos-gerenciador (lista grupos)
- [ ] Testar PUT /api/grupos/{id} (edição + histórico)
- [ ] Confirmar sincronização Google Sheets após PUT
- [ ] Verificar que dados persistem após reload

### 4. Tratamento de Erros
- [ ] Implementar toast notifications (success/error)
- [ ] Mapear status codes de erro para mensagens amigáveis
- [ ] Handling de timeout (30s no api.ts)

### 5. Documentação
- [ ] Criar PAYLOAD_EXAMPLES.md com exemplos completos
- [ ] Documentar fluxo de sincronização
- [ ] Adicionar troubleshooting

## Checklist de Bloqueadores

- [x] **CRÍTICO:** Discrepância campos histórico — ✅ RESOLVIDA (Opção A)
- [ ] CORS: Verificar se backend permite origem do frontend
- [ ] Auth: Confirmar que 401 redireciona corretamente
- [ ] Sincronização: Testar que Google Sheets atualiza em ~15s

## Status por Endpoint

| Endpoint | Método | Status | Descrição |
|----------|--------|--------|-----------|
| /api/stats | GET | ✅ | Funciona, retorna stats corretas |
| /api/grupos | GET | ✅ | Funciona com filtros |
| /api/grupos-gerenciador | GET | ✅ | Funciona com paginação |
| /api/grupos/{id} | GET | ✅ | Busca específica |
| /api/grupos/{id} | PUT | 🔴 | BLOQUEADO: discrepância campos |
| /api/grupos/{id} | DELETE | ✅ | Soft delete funciona |
| /api/grupos/{id}/status | PATCH | ✅ | Muda status |
| /api/administradoras | GET | ✅ | Lista adms |
| /api/sync-sheets | POST | ✅ | Força sincronização |
| /api/refresh | POST | ✅ | Refresh cache |
| /api/importar/preview | POST | ✅ | Preview de import |
| /api/importar/processar | POST | ✅ | Processa import |
| /api/exportar/* | GET | ✅ | Exporta em blob |
| /api/piperun/{id} | GET | ✅ | Busca oportunidade |

## Notas Técnicas

1. **SyncQueue Background Job**
   - Roda a cada 15 segundos
   - Inicia on startup (@app.on_event("startup"))
   - Processa assincronamente

2. **Force Refresh**
   - PUT força refresh: `fetch_grupos(force_refresh=True)`
   - Evita dados stale em produção no Render

3. **Timestamp Automático**
   - Backend adiciona `editado_em` automaticamente na resposta

4. **Usuario Field**
   - Query param optional: usuario=operador
   - Usado para auditoria em Google Sheets

## Status de Resolução

✅ **BLOCKER CRÍTICO RESOLVIDO**

**Decisão:** Opção A (Simplificar frontend)
- Frontend types/index.ts HistoricoMensal atualizado
- HistoricoMensalForm.tsx refatorizado para 3 campos: maior_lance, menor_lance, qtd
- Payload agora corresponde exatamente ao GrupoUpdate do backend
- Ready para integração e testes
