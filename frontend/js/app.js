// ══════════════════════════════════════════════════════════════════════════════
// CRITICAL 1: UTILITY FUNCTIONS (Debounce, Error Handling, Validation)
// ══════════════════════════════════════════════════════════════════════════════

const Debounce = {
  timers: {},
  debounce(fn, delay = 300) {
    return function(...args) {
      const key = fn.name || 'anonymous';
      clearTimeout(this.timers[key]);
      this.timers[key] = setTimeout(() => fn.apply(this, args), delay);
    };
  }
};

// CRITICAL 3: Global Error Handler
const fetchAPI = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      let message = data.detail || `Erro HTTP ${res.status}`;
      if (res.status === 500) message = 'Erro no servidor. Tente novamente mais tarde.';
      if (res.status === 404) message = 'Recurso não encontrado';
      if (res.status === 401) message = 'Sessão expirada. Faça login novamente.';
      throw new Error(message);
    }

    return { ok: true, data };
  } catch (error) {
    console.error(`[fetchAPI ERROR] ${url}:`, error);
    return { ok: false, error: error.message };
  }
};

// CRITICAL 2: Validators Object
const Validators = {
  creditoDesejado: (valor) => {
    if (!valor || valor <= 0) return 'Crédito desejado deve ser > 0';
    if (valor > 10000000) return 'Crédito não pode exceder R$ 10M';
    return null;
  },

  prazoDesejado: (valor) => {
    if (!valor) return 'Prazo é obrigatório';
    return null;
  },

  rendaTitular: (valor) => {
    if (valor && valor < 0) return 'Renda não pode ser negativa';
    return null;
  },

  dataNascimento: (valor) => {
    if (valor) {
      const date = new Date(valor);
      const age = new Date().getFullYear() - date.getFullYear();
      if (age < 18) return 'Deve ter no mínimo 18 anos';
      if (age > 120) return 'Data de nascimento inválida';
    }
    return null;
  },

  parcelaDesejada: (valor) => {
    if (valor && valor <= 0) return 'Parcela deve ser > 0';
    return null;
  },

  campoNumerico: (valor, min = null, max = null) => {
    if (valor && isNaN(valor)) return 'Deve ser um número';
    if (min !== null && valor < min) return `Deve ser >= ${min}`;
    if (max !== null && valor > max) return `Deve ser <= ${max}`;
    return null;
  },

  percentual: (valor) => {
    if (valor !== null && valor !== undefined && valor !== '') {
      const num = parseFloat(valor);
      if (isNaN(num)) return 'Deve ser um número';
      if (num < 0 || num > 100) return 'Deve estar entre 0-100%';
    }
    return null;
  },

  campoObrigatorio: (valor, nomeCampo) => {
    if (!valor || String(valor).trim() === '') return `${nomeCampo} é obrigatório`;
    return null;
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD STATE
// ══════════════════════════════════════════════════════════════════════════════

function dashboard() {
  return {
    // ── SECTION 1: REACTIVE DATA ────────────────────────────────────────────
    abaAtiva: "mapa",
    grupos: [],
    stats: {},
    loading: false,
    dataHoje: new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),

    // Piperun
    piperunId: "",
    piperunLoading: false,
    piperunError: null,
    oportunidade: null,

    // ── SECTION 2: CALCULADORA IMÓVEL ───────────────────────────────────────
    calc: {
      creditoDesejado: 450000,
      prazoDesejado: "1a3",
      conceitoLance: "agressivo",
      lancemaximo: 150000,
      fgtsTitular: 0,
      fgtsCunjuge: 0,
      nascimentoTitular: "",
      nascimentoCunjuge: "",
      rendaTitular: 3500,
      rendaCunjuge: 0,
      parcelaDesejada: 6000,
      resultados: [],
      errosValidacao: {} // CRITICAL 2: Erros por campo
    },

    admSelecionada: null,
    gruposAdmFiltrados: [],
    grupoSelecionado: null,
    simulacoesEstudo: [],
    erroSimulacao: "",
    avisoViabilidade: null,
    scoreViabilidade: 100,

    previewEstudo: {
      isOpen: false,
      editMode: false,
      dadosCliente: {},
      dadosGrupo: {},
      simulacoes: [],
      historico: [],
      errosPreview: {} // CRITICAL 2: Erros no preview
    },

    // ── SECTION 3: FILTERS & PAGINATION ─────────────────────────────────────
    filtros: { busca: "", adm: "", tipo_bem: "", prazo_min: "", prazo_max: "", credito_min: "" },
    filtrarCompativeis: false,
    sortCol: "maior_credito",
    sortDir: "desc",
    pagina: 1,
    porPagina: 50,
    selecionados: [],

    // ── SECTION 4: MODALS ───────────────────────────────────────────────────
    grupoDetalhe: null,
    historicoChart: null,
    historicoChartGerenciador: null,

    // ── SECTION 5: GERENCIADOR ──────────────────────────────────────────────
    gerenciador: {
      grupos: [],
      gruposFiltrados: [],
      paginaAtual: 1,
      porPagina: 500,
      totalGrupos: 0,
      adms: [],
      filtros: { adm: "", status: "", credito_min: "", credito_max: "", busca: "", statusMulti: [] },
      buscaTemporal: "",
      timeoutBusca: null,
      ordenarPor: "adm",
      ordenarDir: "asc",
      formulario: { adm: "", grupo: "", tipo_bem: "", maior_credito: "", menor_credito: "", taxa_adm: "", fundo_rsv: "", investidor: "", conservador_24m: "", moderado_12m: "", dados_adicionais: "" },
      erros: {},
      camposComErro: [],
      modals: { criarGrupo: false, editarGrupo: false, duplicarGrupo: false, deletarGrupo: false, auditoria: false, detalhe: false },
      grupoSelecionado: null,
      tipoDelete: "soft",
      sincronizando: false,
      salvando: false,
      auditoria: [],
      ultimaSincronizacao: null,
      abaEditarGrupo: 1,
      abaHistoricoAno: 2024,
      estatisticas: { media_lance: 0, maior_lance: 0, menor_lance: 0, ultimos_meses: [] }
    },

    // ── SECTION 6: IMPORTAÇÃO/EXPORTAÇÃO ────────────────────────────────────
    importacao: {
      arquivo: null,
      nomeArquivo: "",
      dragOver: false,
      modo: "insert_update",
      carregando: false,
      preview: { preview: [], total: 0, colunas: [], limite_preview: 10, tem_mais: false },
      mostrarPreview: false,
      errosValidacao: [],
      resultado: null
    },

    exportacao: {
      carregando: false,
      tipo: "",
      adm: "",
      grupoId: ""
    },

    sincronizacao: {
      carregando: false,
      ultimaSinc: "",
      mensagem: "",
      erro: false
    },

    // ── SECTION 7: ANALYTICS ────────────────────────────────────────────────
    analytics: {
      carregando: false,
      erro: null,
      dados: { summary: null, comparativo: null, tendencias: null, distribuicao: null, estatisticas: null },
      charts: { distribuicaoAdm: null, comparativoAdm: null, tendencias: null, distribuicaoFaixa: null }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 8: COMPUTED PROPERTIES
    // ══════════════════════════════════════════════════════════════════════════

    get formulario() { return this.oportunidade?.formulario || {}; },

    get gruposFiltrados() {
      let list = [...this.grupos];
      const f = this.filtros;

      if (f.busca) {
        const b = f.busca.toLowerCase();
        list = list.filter(g =>
          String(g.grupo).toLowerCase().includes(b) ||
          g.adm.toLowerCase().includes(b) ||
          (g.tipo_bem || "").toLowerCase().includes(b)
        );
      }
      if (f.adm) list = list.filter(g => g.adm === f.adm);
      if (f.tipo_bem) list = list.filter(g => g.tipo_bem === f.tipo_bem);
      if (f.prazo_min) list = list.filter(g => g.prazo_restante && g.prazo_restante >= parseInt(f.prazo_min));
      if (f.prazo_max) list = list.filter(g => g.prazo_restante && g.prazo_restante <= parseInt(f.prazo_max));
      if (f.credito_min) list = list.filter(g => g.maior_credito && g.maior_credito >= parseFloat(f.credito_min));

      if (this.filtrarCompativeis && this.oportunidade) {
        const v = this.formulario.valor_imovel_num || 0;
        const m = this.formulario.mensalidade_maxima_num || 0;
        if (v > 0) list = list.filter(g => g.maior_credito && g.maior_credito >= v * 0.9);
        if (m > 0) list = list.filter(g => !g.parcela_inicial || g.parcela_inicial <= m * 1.1);
      }

      const dir = this.sortDir === "asc" ? 1 : -1;
      list.sort((a, b) => {
        const va = a[this.sortCol] ?? "";
        const vb = b[this.sortCol] ?? "";
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });

      return list;
    },

    get totalFiltrado() { return this.gruposFiltrados.length; },
    get totalPaginas() { return Math.max(1, Math.ceil(this.gruposFiltrados.length / this.porPagina)); },

    get gruposPaginados() {
      const s = (this.pagina - 1) * this.porPagina;
      return this.gruposFiltrados.slice(s, s + this.porPagina);
    },

    get gruposCompativeis() {
      if (!this.oportunidade) return [];
      const v = this.formulario.valor_imovel_num || 0;
      const m = this.formulario.mensalidade_maxima_num || 0;
      return this.grupos.filter(g => {
        const ok1 = !v || (g.maior_credito && g.maior_credito >= v * 0.9);
        const ok2 = !m || !g.parcela_inicial || g.parcela_inicial <= m * 1.1;
        return ok1 && ok2;
      });
    },

    get gruposGerenciadorFiltrados() {
      let list = [...this.gerenciador.grupos];
      const f = this.gerenciador.filtros;

      if (f.adm) list = list.filter(g => g.adm === f.adm);
      if (f.status) list = list.filter(g => (g.status || "ativo") === f.status);
      if (f.credito_min) list = list.filter(g => g.maior_credito && g.maior_credito >= parseFloat(f.credito_min));
      if (f.credito_max) list = list.filter(g => g.maior_credito && g.maior_credito <= parseFloat(f.credito_max));
      if (f.busca) {
        const b = f.busca.toLowerCase();
        list = list.filter(g =>
          String(g.grupo).toLowerCase().includes(b) ||
          g.adm.toLowerCase().includes(b) ||
          (g.tipo_bem || "").toLowerCase().includes(b)
        );
      }

      const dir = this.gerenciador.ordenarDir === "asc" ? 1 : -1;
      list.sort((a, b) => {
        let va = a[this.gerenciador.ordenarPor] ?? "";
        let vb = b[this.gerenciador.ordenarPor] ?? "";
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });

      return list;
    },

    get gruposGerenciadorPaginados() {
      const s = (this.gerenciador.paginaAtual - 1) * this.gerenciador.porPagina;
      return this.gruposGerenciadorFiltrados.slice(s, s + this.gerenciador.porPagina);
    },

    get totalGerenciadorFiltrado() { return this.gruposGerenciadorFiltrados.length; },
    get totalGerenciadorPaginas() { return Math.max(1, Math.ceil(this.gruposGerenciadorFiltrados.length / this.gerenciador.porPagina)); },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 9: LIFECYCLE & INITIALIZATION
    // ══════════════════════════════════════════════════════════════════════════

    async init() {
      await Promise.all([this.loadStats(), this.loadGrupos()]);
    },

    mudarAba(aba) {
      this.abaAtiva = aba;
      if (aba === 'gerenciador' && this.gerenciador.grupos.length === 0) {
        this.fetchGruposGerenciador();
      }
      if (aba === 'analytics' && !this.analytics.dados.summary) {
        this.carregarAnalytics();
      }
    },

    async loadStats() {
      try {
        const res = await fetch("/api/stats");
        this.stats = await res.json();
      } catch {}
    },

    async loadGrupos() {
      this.loading = true;
      try {
        const res = await fetch("/api/grupos");
        const data = await res.json();
        this.grupos = data.grupos || [];
      } catch (e) {
        console.error("Erro ao carregar grupos", e);
        this.mostrarToast("Erro ao carregar grupos", "erro");
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      this.loading = true;
      try {
        await fetch("/api/refresh", { method: "POST" });
        await Promise.all([this.loadStats(), this.loadGrupos()]);
      } finally {
        this.loading = false;
      }
    },

    logout() {
      localStorage.removeItem('crediclass_usuario');
      localStorage.removeItem('crediclass_user_type');
      localStorage.removeItem('crediclass_saved_user');
      window.location.href = '/login';
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 10: PIPERUN INTEGRATION
    // ══════════════════════════════════════════════════════════════════════════

    async buscarPiperun() {
      const id = this.piperunId.trim();
      if (!id) {
        this.mostrarToast("Digite o ID da oportunidade", "aviso");
        return;
      }
      this.piperunLoading = true;
      this.piperunError = null;
      this.oportunidade = null;
      try {
        const res = await fetch(`/api/piperun/${id}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Erro ao buscar oportunidade");
        }
        this.oportunidade = await res.json();
        if (this.oportunidade.aviso) {
          this.piperunError = this.oportunidade.aviso;
        }
        if (this.oportunidade.formulario?.valor_imovel_num) {
          this.filtrarCompativeis = true;
          this.pagina = 1;
        }
      } catch (e) {
        this.piperunError = e.message;
        this.oportunidade = null;
        this.mostrarToast(e.message, "erro");
      } finally {
        this.piperunLoading = false;
      }
    },

    compatibilidade(g) {
      if (!this.oportunidade) return null;
      const f = this.formulario;
      let score = 0;
      const v = f.valor_imovel_num || 0;
      const m = f.mensalidade_maxima_num || 0;
      const l = f.pct_lance_disponivel || 0;
      if (v > 0 && g.maior_credito && g.maior_credito >= v * 0.9) score++;
      if (m > 0 && g.parcela_inicial && g.parcela_inicial <= m * 1.1) score++;
      if (l > 0) {
        const melhorPerfil = [g.investidor, g.conservador_24m, g.moderado_12m].find(p => p !== null && p !== undefined);
        if (melhorPerfil !== undefined && l >= melhorPerfil) score++;
      }
      return score;
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 11: SORTING & FILTERING
    // ══════════════════════════════════════════════════════════════════════════

    ordenar(col) {
      if (this.sortCol === col) {
        this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
      } else {
        this.sortCol = col;
        this.sortDir = col === "maior_credito" || col === "media_lance" ? "desc" : "asc";
      }
      this.pagina = 1;
    },

    sortIcon(col) {
      if (this.sortCol !== col) return "";
      return this.sortDir === "asc" ? " ↑" : " ↓";
    },

    toggleSelecao(g) {
      const idx = this.selecionados.findIndex(s => s.grupo === g.grupo && s.adm === g.adm);
      if (idx === -1) {
        if (this.selecionados.length >= 5) return;
        this.selecionados.push(g);
      } else {
        this.selecionados.splice(idx, 1);
      }
    },

    isSelecionado(g) {
      return this.selecionados.some(s => s.grupo === g.grupo && s.adm === g.adm);
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 12: MODAL MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════════

    abrirDetalhe(g) {
      if (this.historicoChart) {
        try {
          this.historicoChart.destroy();
        } catch (e) {
          console.warn("[abrirDetalhe] Erro ao destruir chart:", e);
        }
        this.historicoChart = null;
      }

      this.grupoDetalhe = g;
      this.$nextTick(() => {
        if (g.historico?.length) {
          this.renderChart(g.historico);
        }
      });
    },

    fecharModal() {
      this.grupoDetalhe = null;
      if (this.historicoChart) {
        this.historicoChart.destroy();
        this.historicoChart = null;
      }
    },

    renderChart(historico) {
      const canvas = document.getElementById("historicoChart");
      if (!canvas) return;

      if (this.historicoChart) {
        try {
          this.historicoChart.destroy();
        } catch (e) {
          console.warn("[renderChart] Erro ao destruir chart:", e);
        }
        this.historicoChart = null;
      }

      this.historicoChart = new Chart(canvas, {
        type: "line",
        data: {
          labels: historico.map(h => h.mes),
          datasets: [
            {
              label: "Maior Lance",
              data: historico.map(h => h.maior_lance || h.maior),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.08)",
              tension: 0.3,
              fill: true,
              pointRadius: 2,
              borderWidth: 2,
            },
            {
              label: "Menor Lance",
              data: historico.map(h => h.menor_lance || h.menor),
              borderColor: "#10b981",
              backgroundColor: "transparent",
              tension: 0.3,
              fill: false,
              pointRadius: 2,
              borderWidth: 1.5,
              borderDash: [4, 2],
            },
          ],
        },
        options: {
          responsive: true,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { labels: { color: "#94a3b8", font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1) ?? "—"}%`,
              },
            },
          },
          scales: {
            x: {
              ticks: { color: "#64748b", maxRotation: 45, font: { size: 10 } },
              grid: { color: "#1e293b" },
            },
            y: {
              ticks: { color: "#64748b", callback: v => v + "%", font: { size: 10 } },
              grid: { color: "#1e293b" },
            },
          },
        },
      });
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 13: FORMATTERS
    // ══════════════════════════════════════════════════════════════════════════

    formatCurrency(v) {
      if (!v && v !== 0) return "—";
      return "R$ " + v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    formatPct(v) {
      if (v === null || v === undefined) return "—";
      return v.toFixed(1) + "%";
    },

    lanceClass(v) {
      if (!v) return "text-slate-500";
      if (v >= 70) return "text-red-400";
      if (v >= 55) return "text-yellow-400";
      return "text-emerald-400";
    },

    vidaClass(v) {
      if (!v) return "text-slate-500";
      if (v >= 75) return "text-red-400";
      if (v >= 50) return "text-yellow-400";
      return "text-emerald-400";
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 14: CALCULADORA IMÓVEL
    // ══════════════════════════════════════════════════════════════════════════

    async buscarOportunidade() {
      if (!this.piperunId) {
        this.mostrarToast("Digite o ID da oportunidade", "aviso");
        return;
      }

      this.piperunLoading = true;
      this.piperunError = null;
      try {
        const resp = await fetch(`/api/piperun/${this.piperunId}`);
        if (!resp.ok) throw new Error(`Erro ${resp.status}`);
        const data = await resp.json();
        const f = data.formulario;
        this.oportunidade = data;

        if (f.valor_imovel_num) this.calc.creditoDesejado = f.valor_imovel_num;
        if (f.lance_maximo_num) this.calc.lancemaximo = f.lance_maximo_num;
        if (f.mensalidade_maxima_num) this.calc.parcelaDesejada = f.mensalidade_maxima_num;
        if (f.renda_mensal_num) this.calc.rendaTitular = f.renda_mensal_num;

        if (f.nascimento) {
          const [dia, mes, ano] = f.nascimento.split('/');
          this.calc.nascimentoTitular = `${ano}-${mes}-${dia}`;
        }

        this.mostrarToast(`✓ ${f.nome || 'Cliente'} carregado com sucesso`, "sucesso");
      } catch (err) {
        this.piperunError = `Erro: ${err.message}`;
        this.mostrarToast(err.message, "erro");
      } finally {
        this.piperunLoading = false;
      }
    },

    // CRITICAL 2: Validar calculadora antes de executar
    validarCalculadora() {
      const c = this.calc;
      this.calc.errosValidacao = {};

      const erroCredito = Validators.creditoDesejado(c.creditoDesejado);
      if (erroCredito) this.calc.errosValidacao.creditoDesejado = erroCredito;

      const erroParcela = Validators.parcelaDesejada(c.parcelaDesejada);
      if (erroParcela) this.calc.errosValidacao.parcelaDesejada = erroParcela;

      const erroRenda = Validators.rendaTitular(c.rendaTitular);
      if (erroRenda) this.calc.errosValidacao.rendaTitular = erroRenda;

      return Object.keys(this.calc.errosValidacao).length === 0;
    },

    executarCalculo() {
      if (!this.validarCalculadora()) {
        this.mostrarToast("Corrija os erros indicados", "aviso");
        return;
      }

      const c = this.calc;
      const administradoras = [
        { nome: "CNP", taxaAdm: 0.15, fundoRsv: 0.05, pctLanceEmbutido: 0.5, temFuro: 0.15 },
        { nome: "ITAÚ", taxaAdm: 0.2, fundoRsv: 0.03, pctLanceEmbutido: 0.3, temFuro: 0.2 },
        { nome: "CAOA", taxaAdm: 0.2, fundoRsv: 0.01, pctLanceEmbutido: 0.3, temFuro: 0.15 },
        { nome: "PORTO", taxaAdm: 0.15, fundoRsv: 0.005, pctLanceEmbutido: 0.3, temFuro: 0.15 },
        { nome: "EMBRACON", taxaAdm: 0.15, fundoRsv: 0.02, pctLanceEmbutido: 0.25, temFuro: 0.2 },
        { nome: "RODOBENS", taxaAdm: 0.18, fundoRsv: 0.05, pctLanceEmbutido: 0.3, temFuro: 0.15 },
      ];

      const totalFGTS = (c.fgtsTitular || 0) + (c.fgtsCunjuge || 0);
      const totalDisponivel = c.lancemaximo + totalFGTS;
      const rendaTotal = (c.rendaTitular || 0) + (c.rendaCunjuge || 0);
      const parcelaMaximaRenda = rendaTotal * 0.30;
      const parcelaDesejada = c.parcelaDesejada || 6000;

      this.calc.resultados = administradoras.map(adm => {
        const creditoContratar = c.creditoDesejado / (1 - adm.pctLanceEmbutido);
        const numeradorG = (creditoContratar * adm.pctLanceEmbutido) + c.lancemaximo + totalFGTS;
        const denominadorG = creditoContratar * (1 + adm.taxaAdm + adm.fundoRsv);
        const lanceMaximo = numeradorG / denominadorG;
        const creditoComTaxas = creditoContratar * (1 + adm.taxaAdm + adm.fundoRsv);
        const lanceComFGTS = (creditoContratar * adm.pctLanceEmbutido) + c.lancemaximo + totalFGTS;
        const prazoMinimo = (creditoComTaxas - lanceComFGTS) / parcelaDesejada;

        return {
          nome: adm.nome,
          taxaAdm: adm.taxaAdm,
          fundoRsv: adm.fundoRsv,
          pctLanceEmbutido: adm.pctLanceEmbutido,
          creditoContratar: Math.max(0, creditoContratar),
          lanceMaximo: Math.max(0, Math.min(lanceMaximo, 1)),
          prazoMinimo: Math.max(0, prazoMinimo),
        };
      });

      this.validarViabilidade();
      this.mostrarToast("✓ Cálculo executado com sucesso", "sucesso");
    },

    validarViabilidade() {
      const c = this.calc;
      const parcelaDesejada = c.parcelaDesejada || 6000;
      const rendaTotal = (c.rendaTitular || 0) + (c.rendaCunjuge || 0);
      const parcelaMaximaRenda = rendaTotal * 0.30;

      const avisos = [];
      let score = 100;

      if (rendaTotal > 0 && parcelaDesejada > parcelaMaximaRenda) {
        avisos.push(`⚠️ Parcela > 30% da renda`);
        score -= 30;
      }

      const prazosAltos = c.resultados.filter(r => r.prazoMinimo > 180);
      if (prazosAltos.length >= 3) {
        avisos.push(`⚠️ ${prazosAltos.length} ADMs com prazo > 180 meses`);
        score -= 25;
      }

      const lanceMaxDisp = c.lancemaximo || 0;
      const creditoDesejado = c.creditoDesejado || 0;
      if (creditoDesejado > 0 && lanceMaxDisp / creditoDesejado > 0.8) {
        avisos.push("⚠️ Lance muito agressivo (> 80%)");
        score -= 15;
      }

      this.avisoViabilidade = avisos.length > 0 ? avisos : null;
      this.scoreViabilidade = Math.max(0, score);
    },

    selecionarAdm(adm) {
      this.admSelecionada = adm.nome;
      const v = this.oportunidade?.formulario?.valor_imovel_num || this.calc.creditoDesejado;
      const lanceDisp = this.calc.lancemaximo || 0;

      this.gruposAdmFiltrados = this.grupos.filter(g => {
        if (g.adm !== adm.nome) return false;
        return g.maior_credito >= v * 0.70 ||
               (g.maior_credito + lanceDisp) >= v * 0.95;
      });

      this.grupoSelecionado = null;
      this.simulacoesEstudo = [];
    },

    selecionarGrupo(grupo) {
      this.grupoSelecionado = grupo;
      this.gerarSimulacoes(grupo);
    },

    gerarSimulacoes(grupo) {
      const c = this.calc;
      const v = this.oportunidade?.formulario?.valor_imovel_num || c.creditoDesejado;
      const m = this.oportunidade?.formulario?.mensalidade_maxima_num || c.parcelaDesejada;

      const admResult = this.calc.resultados.find(a => a.nome === this.admSelecionada);
      if (!admResult) {
        this.erroSimulacao = "Calcule primeiro selecionando a ADM";
        return;
      }

      this.simulacoesEstudo = [
        {
          tipo: "Sorteio Geral",
          descricao: "Sem lance, participa apenas do sorteio",
          lancePercentual: 0,
          lanceTotalR$: 0,
          pagtoCarta: grupo.maior_credito,
          pegtoRecProprio: 0,
          creditoDisponivel: grupo.maior_credito,
          parcelasMeses: grupo.maior_credito ? (m * 12) / grupo.maior_credito : 0,
        },
        {
          tipo: "Lance Fixo 40%",
          descricao: "Lance fixo de 40%, menor recurso próprio",
          lancePercentual: 40,
          lanceTotalR$: grupo.maior_credito * 0.40,
          pagtoCarta: grupo.maior_credito * 0.60,
          pegtoRecProprio: grupo.maior_credito * 0.40,
          creditoDisponivel: grupo.maior_credito * 0.60,
          parcelasMeses: (grupo.maior_credito * 0.60) / (m || 1),
        },
        {
          tipo: "Lance Conservador",
          descricao: "Lance conservador (1 das últimas 17 assembleias)",
          lancePercentual: grupo.conservador_24m || 20,
          lanceTotalR$: grupo.maior_credito * (grupo.conservador_24m || 0.20) / 100,
          pagtoCarta: grupo.maior_credito * (100 - (grupo.conservador_24m || 20)) / 100,
          pegtoRecProprio: grupo.maior_credito * (grupo.conservador_24m || 20) / 100,
          creditoDisponivel: grupo.maior_credito * (100 - (grupo.conservador_24m || 20)) / 100,
          parcelasMeses: (grupo.maior_credito * (100 - (grupo.conservador_24m || 20)) / 100) / (m || 1),
        },
        {
          tipo: "Lance Moderado",
          descricao: "Lance moderado (3 das últimas 17 assembleias)",
          lancePercentual: grupo.moderado_12m || 35,
          lanceTotalR$: grupo.maior_credito * (grupo.moderado_12m || 0.35) / 100,
          pagtoCarta: grupo.maior_credito * (100 - (grupo.moderado_12m || 35)) / 100,
          pegtoRecProprio: grupo.maior_credito * (grupo.moderado_12m || 35) / 100,
          creditoDisponivel: grupo.maior_credito * (100 - (grupo.moderado_12m || 35)) / 100,
          parcelasMeses: (grupo.maior_credito * (100 - (grupo.moderado_12m || 35)) / 100) / (m || 1),
        },
      ];
      this.erroSimulacao = "";
    },

    // HIGH 4: Modal Validation + Before/After Preview
    abrirPreviewEstudo() {
      if (!this.grupoSelecionado || !this.admSelecionada) {
        this.mostrarToast("Selecione um grupo e uma ADM", "aviso");
        return;
      }

      // CRITICAL 2: Validar dados antes de abrir
      this.previewEstudo.errosPreview = {};
      const cliente = this.oportunidade?.formulario || {};

      if (!cliente.nome_cliente) {
        this.previewEstudo.errosPreview.cliente = "Nome do cliente não preenchido";
      }

      if (Object.keys(this.previewEstudo.errosPreview).length > 0) {
        this.mostrarToast("Corrija os dados do cliente antes de continuar", "aviso");
        return;
      }

      const grupo = this.grupoSelecionado;
      const admData = this.calc.resultados.find(a => a.nome === this.admSelecionada);

      // Preparar dados com preview
      this.previewEstudo.dadosCliente = {
        nome: cliente.nome_cliente || "Não preenchido",
        cpf: cliente.cpf_cliente || "Não preenchido",
        email: cliente.email_cliente || "Não preenchido",
        renda: cliente.renda_mensal_num || 0
      };

      this.previewEstudo.dadosGrupo = {
        adm: this.admSelecionada,
        grupo: grupo.grupo,
        tipo_bem: grupo.tipo_bem || "N/A",
        menor_credito: grupo.menor_credito || 0,
        maior_credito: grupo.maior_credito || 0,
        parcela_inicial: grupo.parcela_inicial || 0,
        taxa_adm: (admData?.taxaAdm * 100 || 0).toFixed(2),
        fundo_rsv: (admData?.fundoRsv * 100 || 0).toFixed(2),
        prazo_restante: grupo.prazo_restante || 222
      };

      this.previewEstudo.simulacoes = JSON.parse(JSON.stringify(this.simulacoesEstudo));
      this.previewEstudo.historico = this.gerarHistoricoMeses();
      this.previewEstudo = { ...this.previewEstudo, isOpen: true, editMode: false };
      this.mostrarToast("✓ Preview carregado", "sucesso");
    },

    selecionarEAbrirPreview() {
      if (this.selecionados.length === 0) {
        this.mostrarToast("Selecione pelo menos um grupo", "aviso");
        return;
      }

      this.grupoSelecionado = this.selecionados[0];
      this.admSelecionada = this.selecionados[0].adm;
      this.abrirPreviewEstudo();
    },

    fecharPreviewEstudo() {
      this.previewEstudo = { ...this.previewEstudo, isOpen: false, editMode: false };
    },

    toggleModoEdicaoEstudo() {
      this.previewEstudo = { ...this.previewEstudo, editMode: !this.previewEstudo.editMode };
    },

    gerarHistoricoMeses() {
      const meses = [];
      const today = new Date();
      for (let i = 11; i >= 0; i--) {
        const data = new Date(today);
        data.setMonth(data.getMonth() - i);
        const mesNome = data.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase();
        meses.push({
          mes: mesNome,
          maiorLance: (50 + Math.random() * 30).toFixed(2),
          qtdContemplacoes: Math.floor(Math.random() * 50),
          menorLance: (40 + Math.random() * 35).toFixed(2)
        });
      }
      return meses;
    },

    gerarPDFDaPreview() {
      if (!this.grupoSelecionado || !this.admSelecionada) {
        this.mostrarToast("Selecione um grupo e uma ADM", "aviso");
        return;
      }

      const admData = this.calc.resultados.find(a => a.nome === this.admSelecionada);
      const grupo = this.grupoSelecionado;
      const cliente = this.previewEstudo.dadosCliente;

      const today = new Date();
      const dataFormatada = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      document.getElementById("efData").textContent = dataFormatada;
      document.getElementById("efCartaCredito").textContent = this.formatCurrency(grupo.maior_credito);
      document.getElementById("efParcelaReduzida").textContent = this.formatCurrency(grupo.maior_credito * 0.30);
      document.getElementById("efLanceEmbutido").textContent = this.formatCurrency(admData?.creditoContratar || 0);
      document.getElementById("efPrazo").textContent = `${grupo.prazo_restante || 222} meses`;
      document.getElementById("efTaxaAdm").textContent = `${(admData?.taxaAdm * 100 || 0).toFixed(2)}%`;
      document.getElementById("efFundoReserva").textContent = `${(admData?.fundoRsv * 100 || 0).toFixed(2)}%`;

      let simHtml = "";
      this.simulacoesEstudo.forEach((sim, idx) => {
        simHtml += `<tr><td>${sim.tipo}</td><td>${sim.lancePercentual.toFixed(2)}%</td></tr>`;
      });
      document.getElementById("efSimulacoes").innerHTML = simHtml;

      setTimeout(() => {
        const element = document.getElementById('estudoFinanceiroPDF');
        const opt = {
          margin: [5, 5, 5, 5],
          filename: `Estudo_${this.admSelecionada}_G${grupo.grupo}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };
        html2pdf().set(opt).from(element).save();
        this.fecharPreviewEstudo();
      }, 100);
    },

    adicionarDias(data, dias) {
      const result = new Date(data);
      result.setDate(result.getDate() + dias);
      return result;
    },

    formatarDataBR(data) {
      return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 15: GERENCIADOR
    // ══════════════════════════════════════════════════════════════════════════

    async fetchGruposGerenciador() {
      const p = new URLSearchParams();
      if (this.gerenciador.filtros.adm && this.gerenciador.filtros.adm.trim())
        p.append("adm", this.gerenciador.filtros.adm.trim());

      if (this.gerenciador.filtros.statusMulti && this.gerenciador.filtros.statusMulti.length > 0) {
        this.gerenciador.filtros.statusMulti.forEach(s => p.append("status", s));
      } else if (this.gerenciador.filtros.status && this.gerenciador.filtros.status.trim()) {
        p.append("status", this.gerenciador.filtros.status.trim());
      }

      if (this.gerenciador.filtros.credito_min && String(this.gerenciador.filtros.credito_min).trim())
        p.append("credito_min", this.gerenciador.filtros.credito_min);
      if (this.gerenciador.filtros.credito_max && String(this.gerenciador.filtros.credito_max).trim())
        p.append("credito_max", this.gerenciador.filtros.credito_max);
      if (this.gerenciador.filtros.busca && this.gerenciador.filtros.busca.trim())
        p.append("busca", this.gerenciador.filtros.busca.trim());
      p.append("ordenar_por", this.gerenciador.ordenarPor || "adm");
      p.append("ordem", this.gerenciador.ordenarDir || "asc");
      p.append("pagina", this.gerenciador.paginaAtual);
      p.append("por_pagina", this.gerenciador.porPagina);

      try {
        const res = await fetch(`/api/grupos-gerenciador?${p}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }
        const data = await res.json();
        this.gerenciador.grupos = data.grupos || [];
        this.gerenciador.totalGrupos = data.total || 0;
        this.gerenciador.paginaAtual = data.pagina || 1;
        this.gerenciador.totalPaginas = data.total_paginas || 0;

        const admsRes = await fetch("/api/administradoras");
        if (admsRes.ok) {
          const admsData = await admsRes.json();
          this.gerenciador.adms = admsData.administradoras || [];
        }

        this.mostrarToast(`${data.total} grupos carregados`, "sucesso");
      } catch (e) {
        console.error("Erro ao carregar grupos", e);
        this.mostrarToast("Erro ao carregar grupos: " + e.message, "erro");
      }
    },

    abrirModalCriarGrupo() {
      this.gerenciador.grupoSelecionado = null;
      this.gerenciador.formulario = {
        adm: "", grupo: "", tipo_bem: "", maior_credito: "", menor_credito: "",
        taxa_adm: "", fundo_rsv: "", investidor: "", conservador_24m: "",
        moderado_12m: "", dados_adicionais: ""
      };
      this.gerenciador.modals.criarGrupo = true;
    },

    abrirModalEditarGrupo(grupo) {
      this.gerenciador.grupoSelecionado = grupo;
      this.gerenciador.formulario = { ...grupo };
      this.gerenciador.modals.editarGrupo = true;
    },

    abrirModalDuplicarGrupo(grupo) {
      this.gerenciador.grupoSelecionado = grupo;
      this.gerenciador.modals.duplicarGrupo = true;
    },

    abrirModalDeletarGrupo(grupo, tipo = "soft") {
      this.gerenciador.grupoSelecionado = grupo;
      this.gerenciador.tipoDelete = tipo;
      this.gerenciador.modals.deletarGrupo = true;
    },

    abrirModalAuditoria(grupo) {
      this.gerenciador.grupoSelecionado = grupo;
      this.gerenciador.auditoria = [];
      this.gerenciador.modals.auditoria = true;
      this.obterAuditoria(grupo.grupo);
    },

    abrirModalDetalheGerenciador(grupo) {
      this.gerenciador.grupoSelecionado = grupo;
      this.gerenciador.modals.detalhe = true;
      this.calcularEstatisticasGerenciador(grupo);

      this.$nextTick(() => {
        this.inicializarGraficoHistoricoGerenciador();
      });
    },

    calcularEstatisticasGerenciador(grupo) {
      if (!grupo.historico || grupo.historico.length === 0) {
        this.gerenciador.estatisticas = { media_lance: 0, maior_lance: 0, menor_lance: 0, ultimos_meses: [] };
        return;
      }
      const historico = grupo.historico;
      const lances_maiores = historico.filter(h => h.maior_lance).map(h => h.maior_lance);
      const lances_menores = historico.filter(h => h.menor_lance).map(h => h.menor_lance);
      const media_maior = lances_maiores.length > 0 ? lances_maiores.reduce((a, b) => a + b, 0) / lances_maiores.length : 0;
      const maior = lances_maiores.length > 0 ? Math.max(...lances_maiores) : 0;
      const menor = lances_menores.length > 0 ? Math.min(...lances_menores) : 0;
      const ultimos = historico.slice(-3).reverse();
      this.gerenciador.estatisticas = {
        media_lance: parseFloat(media_maior.toFixed(2)),
        maior_lance: maior,
        menor_lance: menor,
        ultimos_meses: ultimos
      };
    },

    inicializarGraficoHistoricoGerenciador() {
      const grupo = this.gerenciador.grupoSelecionado;
      if (!grupo || !grupo.historico || grupo.historico.length === 0) {
        return;
      }
      const ctx = document.getElementById("historicoChartGerenciador");
      if (!ctx) return;

      if (this.historicoChartGerenciador) {
        try {
          this.historicoChartGerenciador.destroy();
        } catch (e) {
          console.warn("Erro ao destruir chart:", e);
        }
      }

      const labels = grupo.historico.map(h => {
        const [ano, mes] = h.mes.split("-");
        const nomeMes = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"][parseInt(mes) - 1];
        return `${nomeMes}/${ano.slice(-2)}`;
      });

      this.historicoChartGerenciador = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Maior Lance (%)",
              data: grupo.historico.map(h => h.maior_lance || null),
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
            },
            {
              label: "Menor Lance (%)",
              data: grupo.historico.map(h => h.menor_lance || null),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { labels: { color: "#cbd5e1", font: { size: 12 } } }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: { color: "#94a3b8", font: { size: 11 } },
              grid: { color: "rgba(15, 23, 42, 0.3)" }
            },
            x: {
              ticks: { color: "#94a3b8", font: { size: 11 } },
              grid: { color: "rgba(15, 23, 42, 0.3)" }
            }
          }
        }
      });
    },

    fecharModalGerenciador() {
      this.gerenciador.modals.criarGrupo = false;
      this.gerenciador.modals.editarGrupo = false;
      this.gerenciador.modals.duplicarGrupo = false;
      this.gerenciador.modals.deletarGrupo = false;
      this.gerenciador.modals.auditoria = false;
      this.gerenciador.modals.detalhe = false;
      this.gerenciador.grupoSelecionado = null;
      this.gerenciador.auditoria = [];
      if (this.historicoChartGerenciador) {
        this.historicoChartGerenciador.destroy();
        this.historicoChartGerenciador = null;
      }
    },

    // Funções para gerenciar histórico mensal de lances
    getMesesAno(ano) {
      const meses = [];
      const anos = [2024, 2025, 2026];
      for (const a of anos) {
        if (a === ano) {
          for (let i = 1; i <= 12; i++) {
            const mes = String(i).padStart(2, '0');
            const mesFormatado = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][i - 1];
            meses.push(`${mesFormatado}-${String(a).slice(-2)}`);
          }
        }
      }
      return meses;
    },

    getHistoricoField(mes, field) {
      if (!this.gerenciador.formulario.historico) return null;
      const registro = this.gerenciador.formulario.historico.find(h => h.mes === mes);
      if (!registro) return null;
      if (field === 'maior') return registro.maior_lance;
      if (field === 'menor') return registro.menor_lance;
      if (field === 'qtd') return registro.qtd;
      return null;
    },

    setHistoricoField(mes, field, value) {
      if (!this.gerenciador.formulario.historico) {
        this.gerenciador.formulario.historico = [];
      }
      let registro = this.gerenciador.formulario.historico.find(h => h.mes === mes);
      if (!registro) {
        registro = { mes, maior_lance: null, menor_lance: null, qtd: null };
        this.gerenciador.formulario.historico.push(registro);
      }
      const numValue = value ? parseFloat(value) : null;
      if (field === 'maior') registro.maior_lance = numValue;
      if (field === 'menor') registro.menor_lance = numValue;
      if (field === 'qtd') registro.qtd = numValue ? parseInt(value) : null;
    },

    obterMesPendente(mes) {
      const [mesAno, ano] = mes.split('-');
      const mesNum = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].indexOf(mesAno) + 1;
      const anoFull = 2000 + parseInt(ano);
      const hoje = new Date();
      const mesFim = new Date(anoFull, mesNum, 0);
      return mesFim < hoje;
    },

    // CRITICAL 2: Validar formulário antes de salvar
    async salvarGrupo() {
      if (!this.validarFormulario()) {
        this.mostrarToast("Corrija os erros indicados", "aviso");
        return;
      }

      this.gerenciador.salvando = true;
      try {
        const url = this.gerenciador.grupoSelecionado
          ? `/api/grupos/${this.gerenciador.grupoSelecionado.grupo}`
          : "/api/grupos";

        const method = this.gerenciador.grupoSelecionado ? "PUT" : "POST";
        const result = await fetchAPI(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.gerenciador.formulario)
        });

        if (result.ok) {
          const tipo = this.gerenciador.grupoSelecionado ? "atualizado" : "criado";
          this.mostrarToast(`✓ Grupo ${tipo} com sucesso!`, "sucesso");
          this.limparErros();
          this.fecharModalGerenciador();
          await this.fetchGruposGerenciador();
        } else {
          this.mostrarToast(result.error, "erro");
        }
      } finally {
        this.gerenciador.salvando = false;
      }
    },

    async deletarGrupo() {
      if (!this.gerenciador.grupoSelecionado) return;

      this.gerenciador.salvando = true;
      try {
        const url = `/api/grupos/${this.gerenciador.grupoSelecionado.grupo}?soft=${this.gerenciador.tipoDelete === "soft"}`;
        const result = await fetchAPI(url, { method: "DELETE" });

        if (result.ok) {
          const tipo = this.gerenciador.tipoDelete === "soft" ? "desativado" : "deletado";
          this.mostrarToast(`✓ Grupo ${tipo} com sucesso!`, "sucesso");
          this.fecharModalGerenciador();
          await this.fetchGruposGerenciador();
        } else {
          this.mostrarToast(result.error, "erro");
        }
      } finally {
        this.gerenciador.salvando = false;
      }
    },

    async duplicarGrupo() {
      if (!this.gerenciador.grupoSelecionado) return;

      this.gerenciador.salvando = true;
      try {
        const url = `/api/grupos/${this.gerenciador.grupoSelecionado.grupo}/duplicar`;
        const result = await fetchAPI(url, { method: "POST" });

        if (result.ok) {
          this.mostrarToast(`✓ Grupo duplicado com sucesso!`, "sucesso");
          this.fecharModalGerenciador();
          await this.fetchGruposGerenciador();
        } else {
          this.mostrarToast(result.error, "erro");
        }
      } finally {
        this.gerenciador.salvando = false;
      }
    },

    async sincronizarComSheets() {
      this.gerenciador.sincronizando = true;
      this.gerenciador.ultimaSincronizacao = null;

      try {
        const inicioSync = Date.now();
        const result = await fetchAPI("/api/sync-sheets", { method: "POST" });

        if (result.ok) {
          const tempoTotal = ((Date.now() - inicioSync) / 1000).toFixed(1);
          this.gerenciador.ultimaSincronizacao = {
            timestamp: result.data.timestamp,
            data_formatada: result.data.data_formatada,
            total_grupos: result.data.total_grupos,
            tempo_segundos: tempoTotal
          };
          this.mostrarToast(`✅ ${result.data.total_grupos} grupos em ${tempoTotal}s`, "sucesso");
          await this.fetchGruposGerenciador();
        } else {
          throw new Error(result.error);
        }
      } catch (e) {
        console.error("Erro ao sincronizar", e);
        this.mostrarToast(`❌ Erro: ${e.message}`, "erro");
      } finally {
        this.gerenciador.sincronizando = false;
      }
    },

    async obterAuditoria(grupoId) {
      try {
        const res = await fetch(`/api/grupos/${grupoId}/auditoria`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.historico && Array.isArray(data.historico)) {
          this.gerenciador.auditoria = data.historico.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
          );
        } else {
          this.gerenciador.auditoria = [];
        }
      } catch (e) {
        console.error("Erro ao obter auditoria", e);
        this.mostrarToast("Erro ao carregar histórico", "erro");
      }
    },

    ordenarGerenciador(coluna) {
      if (this.gerenciador.ordenarPor === coluna) {
        this.gerenciador.ordenarDir = this.gerenciador.ordenarDir === "asc" ? "desc" : "asc";
      } else {
        this.gerenciador.ordenarPor = coluna;
        this.gerenciador.ordenarDir = "asc";
      }
      this.gerenciador.paginaAtual = 1;
    },

    // HIGH 3: Debounce para busca
    atualizarBuscaGerenciador: function() {
      if (this.gerenciador.timeoutBusca) {
        clearTimeout(this.gerenciador.timeoutBusca);
      }
      this.gerenciador.timeoutBusca = setTimeout(() => {
        this.gerenciador.filtros.busca = this.gerenciador.buscaTemporal;
        this.gerenciador.paginaAtual = 1;
        this.fetchGruposGerenciador();
      }, 300);
    },

    limparFiltrosGerenciador() {
      this.gerenciador.filtros = { adm: "", status: "", credito_min: "", credito_max: "", busca: "", statusMulti: [] };
      this.gerenciador.buscaTemporal = "";
      if (this.gerenciador.timeoutBusca) {
        clearTimeout(this.gerenciador.timeoutBusca);
      }
      this.gerenciador.paginaAtual = 1;
      this.fetchGruposGerenciador();
    },

    mudarPaginaGerenciador(direcao) {
      const maxPaginas = this.totalGerenciadorPaginas;
      if (direcao === "anterior" && this.gerenciador.paginaAtual > 1) {
        this.gerenciador.paginaAtual--;
      } else if (direcao === "proxima" && this.gerenciador.paginaAtual < maxPaginas) {
        this.gerenciador.paginaAtual++;
      }
    },

    togglearStatusFiltro(status) {
      if (!this.gerenciador.filtros.statusMulti) {
        this.gerenciador.filtros.statusMulti = [];
      }
      const idx = this.gerenciador.filtros.statusMulti.indexOf(status);
      if (idx > -1) {
        this.gerenciador.filtros.statusMulti.splice(idx, 1);
      } else {
        this.gerenciador.filtros.statusMulti.push(status);
      }
      this.gerenciador.paginaAtual = 1;
      this.fetchGruposGerenciador();
    },

    limparStatusFiltros() {
      this.gerenciador.filtros.statusMulti = [];
      this.gerenciador.paginaAtual = 1;
      this.fetchGruposGerenciador();
    },

    async mudarStatusGrupo(grupo, novoStatus) {
      if (!grupo || !novoStatus) return;

      this.gerenciador.salvando = true;
      try {
        const result = await fetchAPI(`/api/grupos/${grupo.grupo}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ novo_status: novoStatus })
        });

        if (result.ok) {
          this.mostrarToast(`✓ Status alterado para ${novoStatus}`, "sucesso");
          await this.fetchGruposGerenciador();
          if (this.gerenciador.grupoSelecionado && this.gerenciador.grupoSelecionado.grupo === grupo.grupo) {
            this.gerenciador.grupoSelecionado.status = novoStatus;
          }
        } else {
          this.mostrarToast(result.error, "erro");
        }
      } finally {
        this.gerenciador.salvando = false;
      }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 16: VALIDAÇÃO
    // ══════════════════════════════════════════════════════════════════════════

    validarCampo(campo, valor) {
      const erros = {};

      if (['adm', 'grupo', 'tipo_bem'].includes(campo)) {
        if (!valor || String(valor).trim() === '') {
          erros[campo] = `${this.obterLabelCampo(campo)} é obrigatório`;
        }
      }

      if (campo === 'menor_credito') {
        if (valor && isNaN(valor)) erros[campo] = 'Deve ser um número';
        else if (valor && parseFloat(valor) < 0) erros[campo] = 'Deve ser positivo';
      }
      if (campo === 'maior_credito') {
        if (valor && isNaN(valor)) erros[campo] = 'Deve ser um número';
        else if (valor && parseFloat(valor) < 0) erros[campo] = 'Deve ser positivo';
        else if (valor && this.gerenciador.formulario.menor_credito) {
          const menor = parseFloat(this.gerenciador.formulario.menor_credito);
          const maior = parseFloat(valor);
          if (maior < menor) erros[campo] = 'Deve ser >= Menor Crédito';
        }
      }

      const camposPercentual = ['taxa_adm', 'fundo_rsv', 'investidor', 'conservador_24m', 'moderado_12m'];
      if (camposPercentual.includes(campo)) {
        if (valor && isNaN(valor)) erros[campo] = 'Deve ser um número';
        else if (valor && (parseFloat(valor) < 0 || parseFloat(valor) > 100)) {
          erros[campo] = 'Deve estar entre 0-100%';
        }
      }

      return erros;
    },

    obterLabelCampo(campo) {
      const labels = {
        'adm': 'Administradora',
        'grupo': 'Grupo ID',
        'tipo_bem': 'Tipo de Bem',
        'maior_credito': 'Maior Crédito',
        'menor_credito': 'Menor Crédito',
        'taxa_adm': 'Taxa de Administração',
        'fundo_rsv': 'Fundo de Reserva',
      };
      return labels[campo] || campo;
    },

    validarFormulario() {
      this.gerenciador.erros = {};
      this.gerenciador.camposComErro = [];

      const obrigatorios = ['adm', 'grupo', 'tipo_bem'];
      obrigatorios.forEach(campo => {
        const val = this.gerenciador.formulario[campo];
        if (!val || String(val).trim() === '') {
          this.gerenciador.erros[campo] = `${this.obterLabelCampo(campo)} é obrigatório`;
          this.gerenciador.camposComErro.push(campo);
        }
      });

      if (this.gerenciador.formulario.menor_credito) {
        const menor = parseFloat(this.gerenciador.formulario.menor_credito);
        if (isNaN(menor) || menor < 0) {
          this.gerenciador.erros.menor_credito = 'Deve ser um número positivo';
          this.gerenciador.camposComErro.push('menor_credito');
        }
      }

      if (this.gerenciador.formulario.maior_credito) {
        const maior = parseFloat(this.gerenciador.formulario.maior_credito);
        if (isNaN(maior) || maior < 0) {
          this.gerenciador.erros.maior_credito = 'Deve ser um número positivo';
          this.gerenciador.camposComErro.push('maior_credito');
        } else if (this.gerenciador.formulario.menor_credito) {
          const menor = parseFloat(this.gerenciador.formulario.menor_credito);
          if (maior < menor) {
            this.gerenciador.erros.maior_credito = 'Deve ser >= Menor Crédito';
            this.gerenciador.camposComErro.push('maior_credito');
          }
        }
      }

      const camposPercentual = ['taxa_adm', 'fundo_rsv', 'investidor', 'conservador_24m', 'moderado_12m'];
      camposPercentual.forEach(campo => {
        const val = this.gerenciador.formulario[campo];
        if (val && !isNaN(val)) {
          const num = parseFloat(val);
          if (num < 0 || num > 100) {
            this.gerenciador.erros[campo] = `Deve estar entre 0-100%`;
            this.gerenciador.camposComErro.push(campo);
          }
        }
      });

      return this.gerenciador.camposComErro.length === 0;
    },

    limparErros() {
      this.gerenciador.erros = {};
      this.gerenciador.camposComErro = [];
    },

    temErro(campo) {
      return !!this.gerenciador.erros[campo];
    },

    obterErro(campo) {
      return this.gerenciador.erros[campo] || '';
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 17: IMPORTAÇÃO/EXPORTAÇÃO
    // ══════════════════════════════════════════════════════════════════════════

    soltarArquivo(event) {
      this.importacao.dragOver = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.importacao.arquivo = files[0];
        this.importacao.nomeArquivo = files[0].name;
        this.importacao.errosValidacao = [];
      }
    },

    selecionarArquivo(event) {
      const files = event.target.files;
      if (files.length > 0) {
        this.importacao.arquivo = files[0];
        this.importacao.nomeArquivo = files[0].name;
        this.importacao.errosValidacao = [];
      }
    },

    async previewImportacao() {
      if (!this.importacao.arquivo) {
        this.mostrarToast("Selecione um arquivo", "erro");
        return;
      }

      this.importacao.carregando = true;
      const formData = new FormData();
      formData.append("arquivo", this.importacao.arquivo);

      try {
        const res = await fetch("/api/importar/preview", {
          method: "POST",
          body: formData
        });
        const data = await res.json();

        if (res.ok) {
          this.importacao.preview = data.preview;
          this.importacao.errosValidacao = data.erros || [];
          this.importacao.mostrarPreview = true;
          if (data.erros && data.erros.length > 0) {
            this.mostrarToast(`${data.erros.length} erros encontrados`, "aviso");
          } else {
            this.mostrarToast(`✓ Preview: ${data.preview.total} linhas`, "sucesso");
          }
        } else {
          this.importacao.errosValidacao = [data.detail || "Erro ao processar"];
          this.mostrarToast("Erro no preview", "erro");
        }
      } catch (e) {
        console.error("Erro ao fazer preview", e);
        this.mostrarToast("Erro: " + e.message, "erro");
      } finally {
        this.importacao.carregando = false;
      }
    },

    async processarImportacao() {
      if (!this.importacao.arquivo || this.importacao.errosValidacao.length > 0) {
        this.mostrarToast("Corrija os erros antes de importar", "erro");
        return;
      }

      this.importacao.carregando = true;
      const formData = new FormData();
      formData.append("arquivo", this.importacao.arquivo);
      formData.append("modo", this.importacao.modo);

      try {
        const res = await fetch("/api/importar/processar", {
          method: "POST",
          body: formData
        });
        const data = await res.json();

        if (res.ok) {
          this.importacao.resultado = data;
          this.mostrarToast(
            `✓ Importação concluída!\nInseridos: ${data.inseridos} | Atualizados: ${data.atualizados}`,
            "sucesso"
          );
          await this.fetchGruposGerenciador();
        } else {
          this.mostrarToast("Erro na importação", "erro");
        }
      } catch (e) {
        console.error("Erro ao processar", e);
        this.mostrarToast("Erro: " + e.message, "erro");
      } finally {
        this.importacao.carregando = false;
      }
    },

    limparArquivoImportacao() {
      this.importacao.arquivo = null;
      this.importacao.nomeArquivo = "";
      this.importacao.preview = { preview: [], total: 0, colunas: [], limite_preview: 10, tem_mais: false };
      this.importacao.mostrarPreview = false;
      this.importacao.errosValidacao = [];
      this.importacao.resultado = null;
    },

    async exportarTudo() {
      this.exportacao.carregando = true;
      try {
        const res = await fetch("/api/exportar/completo");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `grupos_completo_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.mostrarToast("✓ Arquivo exportado", "sucesso");
      } catch (e) {
        this.mostrarToast("Erro ao exportar: " + e.message, "erro");
      } finally {
        this.exportacao.carregando = false;
      }
    },

    async exportarPorAdm() {
      if (!this.exportacao.adm) {
        this.mostrarToast("Selecione uma administradora", "erro");
        return;
      }

      this.exportacao.carregando = true;
      try {
        const res = await fetch(`/api/exportar/por-adm/${this.exportacao.adm}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `grupos_${this.exportacao.adm}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.mostrarToast(`✓ ${this.exportacao.adm} exportado`, "sucesso");
      } catch (e) {
        this.mostrarToast("Erro: " + e.message, "erro");
      } finally {
        this.exportacao.carregando = false;
      }
    },

    async exportarRelatorioAdms() {
      this.exportacao.carregando = true;
      try {
        const res = await fetch("/api/exportar/relatorio-adms");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio_adms_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.mostrarToast("✓ Relatório exportado", "sucesso");
      } catch (e) {
        this.mostrarToast("Erro: " + e.message, "erro");
      } finally {
        this.exportacao.carregando = false;
      }
    },

    async exportarGrupo() {
      if (!this.exportacao.grupoId) {
        this.mostrarToast("Digite o ID do grupo", "erro");
        return;
      }

      this.exportacao.carregando = true;
      try {
        const res = await fetch(`/api/exportar/grupo/${this.exportacao.grupoId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || `HTTP ${res.status}`);
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `grupo_${this.exportacao.grupoId}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        this.mostrarToast("✓ Grupo exportado", "sucesso");
      } catch (e) {
        this.mostrarToast("Erro: " + e.message, "erro");
      } finally {
        this.exportacao.carregando = false;
        this.exportacao.grupoId = "";
      }
    },

    async sincronizarAgora() {
      this.sincronizacao.carregando = true;
      this.sincronizacao.mensagem = "";
      this.sincronizacao.erro = false;

      try {
        const inicioSync = Date.now();
        const res = await fetch("/api/sync-sheets", { method: "POST" });
        const data = await res.json();

        if (res.ok && data.status === "sucesso") {
          const tempoTotal = ((Date.now() - inicioSync) / 1000).toFixed(1);
          const now = new Date();
          this.sincronizacao.ultimaSinc = now.toLocaleString("pt-BR");
          this.sincronizacao.mensagem = `✓ ${data.total_grupos} grupos em ${tempoTotal}s`;
          this.mostrarToast(this.sincronizacao.mensagem, "sucesso");
          await this.fetchGruposGerenciador();
        } else {
          throw new Error(data.detail || "Falha na sincronização");
        }
      } catch (e) {
        console.error("Erro ao sincronizar", e);
        this.sincronizacao.mensagem = `✗ Erro: ${e.message}`;
        this.sincronizacao.erro = true;
        this.mostrarToast("Erro: " + e.message, "erro");
      } finally {
        this.sincronizacao.carregando = false;
      }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 18: ANALYTICS
    // ══════════════════════════════════════════════════════════════════════════

    async carregarAnalytics() {
      this.analytics.carregando = true;
      this.analytics.erro = null;

      try {
        const [sumRes, admRes, tendRes, distRes, statRes] = await Promise.all([
          fetch("/api/analytics/summary"),
          fetch("/api/analytics/adm-comparison"),
          fetch("/api/analytics/trends"),
          fetch("/api/analytics/distribution"),
          fetch("/api/analytics/statistics")
        ]);

        if (!sumRes.ok || !admRes.ok || !tendRes.ok || !distRes.ok || !statRes.ok) {
          throw new Error("Falha ao carregar dados analíticos");
        }

        const [sum, adm, tend, dist, stat] = await Promise.all([
          sumRes.json(),
          admRes.json(),
          tendRes.json(),
          distRes.json(),
          statRes.json()
        ]);

        this.analytics.dados.summary = sum.dados;
        this.analytics.dados.comparativo = adm.dados.comparativo;
        this.analytics.dados.tendencias = tend.dados;
        this.analytics.dados.distribuicao = dist.dados;
        this.analytics.dados.estatisticas = stat.dados;

        await this.$nextTick?.() || new Promise(r => setTimeout(r, 100));
        this.inicializarGraficos();
      } catch (e) {
        console.error("Erro ao carregar analytics", e);
        this.analytics.erro = e.message;
        this.mostrarToast("Erro ao carregar analytics: " + e.message, "erro");
      } finally {
        this.analytics.carregando = false;
      }
    },

    inicializarGraficos() {
      Object.values(this.analytics.charts).forEach(chart => {
        if (chart && chart.destroy) chart.destroy();
      });
      this.analytics.charts = {};

      const ctxAdm = document.getElementById("chartDistribuicaoAdm");
      if (ctxAdm && this.analytics.dados.summary?.principais_adms) {
        const principais = this.analytics.dados.summary.principais_adms.slice(0, 6);
        this.analytics.charts.distribuicaoAdm = new Chart(ctxAdm, {
          type: "doughnut",
          data: {
            labels: principais.map(a => a.adm),
            datasets: [{
              data: principais.map(a => a.total),
              backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
              borderColor: "#0f172a",
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom", labels: { color: "#cbd5e1" } },
            }
          }
        });
      }

      const ctxComp = document.getElementById("chartComparativoAdm");
      if (ctxComp && this.analytics.dados.comparativo) {
        this.analytics.charts.comparativoAdm = new Chart(ctxComp, {
          type: "bar",
          data: {
            labels: this.analytics.dados.comparativo.map(a => a.administradora),
            datasets: [{
              label: "Quantidade de Grupos",
              data: this.analytics.dados.comparativo.map(a => a.total_grupos),
              backgroundColor: "#3b82f6",
              borderColor: "#1e40af",
              borderWidth: 1
            }]
          },
          options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#cbd5e1" } } },
            scales: {
              x: { ticks: { color: "#cbd5e1" }, grid: { color: "#334155" } },
              y: { ticks: { color: "#cbd5e1" }, grid: { color: "#334155" } }
            }
          }
        });
      }

      const ctxTend = document.getElementById("chartTendencias");
      if (ctxTend && this.analytics.dados.tendencias?.meses) {
        this.analytics.charts.tendencias = new Chart(ctxTend, {
          type: "line",
          data: {
            labels: this.analytics.dados.tendencias.meses,
            datasets: [
              {
                label: "Maior Lance Médio (%)",
                data: this.analytics.dados.tendencias.maior_lance_media,
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                tension: 0.3,
                borderWidth: 2,
              },
              {
                label: "Menor Lance Médio (%)",
                data: this.analytics.dados.tendencias.menor_lance_media,
                borderColor: "#f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                tension: 0.3,
                borderWidth: 2,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#cbd5e1" } } },
            scales: {
              x: { ticks: { color: "#cbd5e1" }, grid: { color: "#334155" } },
              y: {
                ticks: { color: "#cbd5e1" },
                grid: { color: "#334155" },
                min: 0,
                max: 100
              }
            }
          }
        });
      }

      const ctxFaixa = document.getElementById("chartDistribuicaoFaixa");
      if (ctxFaixa && this.analytics.dados.distribuicao?.faixas) {
        this.analytics.charts.distribuicaoFaixa = new Chart(ctxFaixa, {
          type: "bar",
          data: {
            labels: this.analytics.dados.distribuicao.faixas,
            datasets: [
              {
                label: "Quantidade",
                data: this.analytics.dados.distribuicao.contagem,
                backgroundColor: "#8b5cf6",
              },
              {
                label: "Percentual (%)",
                data: this.analytics.dados.distribuicao.percentual,
                backgroundColor: "#ec4899",
                yAxisID: "y1"
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: "#cbd5e1" } } },
            scales: {
              x: { ticks: { color: "#cbd5e1" }, grid: { color: "#334155" } },
              y: {
                type: "linear",
                display: true,
                position: "left",
                ticks: { color: "#cbd5e1" },
                grid: { color: "#334155" }
              },
              y1: {
                type: "linear",
                display: true,
                position: "right",
                ticks: { color: "#cbd5e1" },
                grid: { color: "#334155" },
                max: 100
              }
            }
          }
        });
      }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // SECTION 19: TOAST & UTILS
    // ══════════════════════════════════════════════════════════════════════════

    mostrarToast(mensagem, tipo = "info") {
      console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
      // TODO: Implementar toast UI melhorado com Tailwind
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ALPINE INITIALIZATION
// ══════════════════════════════════════════════════════════════════════════════

if (typeof dashboard === 'function') {
  window.dashboard = dashboard;
  console.log('[Alpine Init] ✓ window.dashboard disponível');
}

if (typeof Alpine !== 'undefined' && typeof dashboard === 'function') {
  Alpine.data('dashboard', dashboard);
  console.log('[Alpine Init] ✓ dashboard() registrada com Alpine');
}

// ══════════════════════════════════════════════════════════════════════════════
// GLOBAL INIT FUNCTION — CALLED BY ALPINE.JS VIA x-init="init()"
// ══════════════════════════════════════════════════════════════════════════════

function init() {
  console.log('[init] Alpine.js inicializando...');

  // Carrega grupos na inicialização
  this.loadGrupos();

  console.log('[init] ✓ Inicialização completa');
}

// Registra init globalmente para Alpine.js acessar
window.init = init;

// Função global para obter resumo de meses com dados de histórico
function obterResumoMesesCompletos() {
  const grupoAtual = window.grupoEmEdicao;
  if (!grupoAtual || !grupoAtual.historico) {
    return 'Sem dados de histórico';
  }

  const mesesComDados = grupoAtual.historico.filter(h =>
    h.maior_lance || h.menor_lance || h.qtd
  ).length;

  return `${mesesComDados} meses com dados registrados`;
}

window.obterResumoMesesCompletos = obterResumoMesesCompletos;

console.log('[Alpine Init] dashboard() pronto');
