# 🧪 Checklist de Teste em Produção

**Data**: 2026-05-26  
**URL**: https://crediclass.csrtecnologia.com.br  

---

## 📋 INSTRUÇÕES

Após o Render fazer o deploy (aguarde ~5-10 minutos):

1. Abra cada URL abaixo em um navegador
2. Marque ✅ se funcionar
3. Marque ❌ se não funcionar
4. Anote bugs/observações

---

## 🔍 TESTES

### 1. Página Principal (Listagem)
```
🔗 https://crediclass.csrtecnologia.com.br/
```

**Esperado**:
- [ ] ✅ Página carrega sem erros
- [ ] ✅ Vê título "Analytics & Relatórios" ou listagem de grupos
- [ ] ✅ Existem filtros (Administradora, Tipo de Bem)
- [ ] ✅ Vê grupos listados com colunas (Grupo, ADM, Tipo Bem)
- [ ] ✅ Paginação funciona (próxima página)
- [ ] ✅ Console sem erros (F12 → Console)

**Se vir tela preta ou código Alpine.js**:
- Significa que o Render ainda tem a versão antiga
- Aguarde mais 5 minutos e recarregue (Ctrl+Shift+Delete cache)

---

### 2. Página Analytics (Dashboard)
```
🔗 https://crediclass.csrtecnologia.com.br/analytics
```

**Esperado**:
- [ ] ✅ Título "Analytics & Relatórios" visível
- [ ] ✅ 4 cartões com estatísticas:
  - Total de Grupos
  - Administradoras
  - Tipos de Bem
  - Status (Ativo)
- [ ] ✅ Gráfico Doughnut (Administradoras) funciona
- [ ] ✅ Gráfico Bar (Tipos de Bem) funciona
- [ ] ✅ Tabela "Top Administradoras" com dados
- [ ] ✅ Tabela "Tipos de Bem" com dados

---

### 3. Formulário Criar Grupo
```
🔗 https://crediclass.csrtecnologia.com.br/grupos/novo
```

**Esperado**:
- [ ] ✅ Página carrega com form
- [ ] ✅ Form tem campos:
  - Grupo (text)
  - Administradora (select)
  - Tipo de Bem (select)
  - Maior Crédito (number)
  - Menor Crédito (number)
  - Taxa ADM (number)
  - E outros...
- [ ] ✅ Botão "Salvar" presente
- [ ] ✅ Form submete sem erros

---

### 4. Formulário Editar Grupo
```
🔗 https://crediclass.csrtecnologia.com.br/grupos/126/editar
```
(Nota: 126 é um grupo que existe no cache)

**Esperado**:
- [ ] ✅ Formulário carrega com dados do grupo 126
- [ ] ✅ Campos preenchidos com valores anteriores
- [ ] ✅ Botão "Atualizar" funciona
- [ ] ✅ Redirect volta para listagem

---

### 5. Detalhe do Grupo
```
🔗 https://crediclass.csrtecnologia.com.br/grupos/126
```

**Esperado**:
- [ ] ✅ Página mostra detalhes do grupo 126
- [ ] ✅ Todos os campos visíveis
- [ ] ✅ Link para editar presente
- [ ] ✅ Botão para deletar (se houver)

---

### 6. Página 404 (Grupo não existe)
```
🔗 https://crediclass.csrtecnologia.com.br/grupos/999999
```

**Esperado**:
- [ ] ✅ Página mostra erro amigável
- [ ] ✅ Mensagem "Grupo não encontrado"
- [ ] ✅ HTTP Status 404 (abra DevTools → Network)
- [ ] ✅ Link para voltar presente

---

### 7. Página Calculadora
```
🔗 https://crediclass.csrtecnologia.com.br/calculadora
```

**Esperado**:
- [ ] ✅ Página carrega com formulário
- [ ] ✅ Campos de entrada presentes
- [ ] ✅ Botão "Executar Cálculo" funciona
- [ ] ✅ Resultados aparecem após click

---

### 8. Página Gerenciador
```
🔗 https://crediclass.csrtecnologia.com.br/gerenciador
```

**Esperado**:
- [ ] ✅ Página carrega
- [ ] ✅ Interface de CRUD presente
- [ ] ✅ Tabela de grupos visível
- [ ] ✅ Botões de ação (editar, deletar) funcionam

---

## 🔗 Teste de API

### Verificar dados
```bash
curl https://crediclass.csrtecnologia.com.br/api/grupos-gerenciador?limit=1
```

**Esperado**:
```json
{
  "total": 342,
  "grupos": [
    {
      "adm": "AUTO-CAIXA",
      "grupo": "2125",
      "tipo_bem": "Auto",
      ...
    }
  ]
}
```

- [ ] ✅ Retorna JSON com dados
- [ ] ✅ HTTP Status 200 OK
- [ ] ✅ "total" mostra 342 (não 0)

---

## 🎯 Resumo

**Total de Testes**: 8 páginas + 1 API  
**Esperados para passar**: Todos ✅

| # | Teste | Status | Observações |
|---|-------|--------|-------------|
| 1 | Listagem | [ ] | - |
| 2 | Analytics | [ ] | - |
| 3 | Criar | [ ] | - |
| 4 | Editar | [ ] | - |
| 5 | Detalhe | [ ] | - |
| 6 | 404 | [ ] | - |
| 7 | Calculadora | [ ] | - |
| 8 | Gerenciador | [ ] | - |
| API | Dados | [ ] | - |

---

## 🐛 Se Algo Não Funcionar

### Sintomas Comuns

**Tela preta / Código Alpine.js**:
- Significado: Render ainda tem versão antiga
- Solução: Aguarde 5-10 min e recarregue com Ctrl+Shift+Delete (limpar cache)
- Verificar: Abra DevTools (F12) → Console → tem erros?

**404 em todas as páginas**:
- Significado: Render build falhou
- Solução: Verificar https://dashboard.render.com → Build logs
- Checks: COPY app/ correto no Dockerfile?

**"Internal Server Error"**:
- Significado: App iniciou mas tem erro em tempo de execução
- Solução: Ver logs do Render
- Debug: Rodar `python main.py` localmente para testar

**Gráficos não aparecem**:
- Verificar se Chart.js está carregando (F12 → Network)
- Verificar se dados estão presentes (F12 → Console → inspect)

---

## 📞 Suporte

Se houver problemas após aguardar 10 minutos:

1. Verificar logs Render: https://dashboard.render.com
2. Verificar console navegador: F12 → Console
3. Rodar localmente: `python main.py`
4. Consultar: `AVALIACAO_GIT_RENDER_2026-05-26.md`

---

**Última atualização**: 2026-05-26 20:50 UTC
**Próximo check**: Após Render deploy completar (~5-10 min)
