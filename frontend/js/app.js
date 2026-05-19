function dashboard() {
  return {
    // ── State ──────────────────────────────────────────
    abaAtiva: "mapa", // "mapa" ou "calculadora"

    grupos: [],
    stats: {},
    loading: false,
    dataHoje: new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),

    // Piperun
    piperunId: "",
    piperunLoading: false,
    piperunError: null,
    oportunidade: null,

    // ── CALCULADORA IMÓVEL ──────────────────────────
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
      resultados: [], // Array com resultados dos cálculos por ADM
    },

    // Fluxo Calculadora
    admSelecionada: null,
    gruposAdmFiltrados: [],
    grupoSelecionado: null,
    simulacoesEstudo: [],
    erroSimulacao: "",
    avisoViabilidade: null,
    scoreViabilidade: 100,

    // Filtros
    filtros: { busca: "", adm: "", tipo_bem: "", prazo_min: "", prazo_max: "", credito_min: "" },
    filtrarCompativeis: false,

    // Sorting
    sortCol: "maior_credito",
    sortDir: "desc",

    // Paginação
    pagina: 1,
    porPagina: 50,

    // Seleção
    selecionados: [],

    // Modal
    grupoDetalhe: null,
    historicoChart: null,

    // ── GERENCIADOR ─────────────────────────────────────
    gerenciador: {
      grupos: [],
      gruposFiltrados: [],
      paginaAtual: 1,
      porPagina: 500,
      totalGrupos: 0,
      adms: [],
      filtros: { adm: "", status: "", credito_min: "", credito_max: "", busca: "", statusMulti: [] },
      buscaTemporal: "", // Para debounce
      timeoutBusca: null, // ID do timeout
      ordenarPor: "adm",
      ordenarDir: "asc",
      formulario: { adm: "", grupo: "", tipo_bem: "", maior_credito: "", menor_credito: "", taxa_adm: "", fundo_rsv: "", investidor: "", conservador_24m: "", moderado_12m: "", dados_adicionais: "" },
      erros: {}, // { campo: "mensagem de erro" }
      camposComErro: [], // Array de campos com erro
      modals: {
        criarGrupo: false,
        editarGrupo: false,
        duplicarGrupo: false,
        deletarGrupo: false,
        auditoria: false,
        detalhe: false
      },
      grupoSelecionado: null,
      tipoDelete: "soft", // "soft" ou "hard"
      sincronizando: false,
      salvando: false,
      auditoria: [],
      ultimaSincronizacao: null, // { timestamp, data_formatada, total_grupos, tempo_segundos }
      abaEditarGrupo: 1, // Tab ativa (1-5)
      abaHistoricoAno: 2024, // Ano ativo no histórico mensal
      estatisticas: {
        media_lance: 0,
        maior_lance: 0,
        menor_lance: 0,
        ultimos_meses: []
      }
    },

    // ── Computed ────────────────────────────────────────
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

      // Sort
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

      // Sort
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

    // ── Lifecycle ───────────────────────────────────────
    async init() {
      await Promise.all([this.loadStats(), this.loadGrupos()]);
    },

    mudarAba(aba) {
      this.abaAtiva = aba;
      if (aba === 'gerenciador' && this.gerenciador.grupos.length === 0) {
        this.fetchGruposGerenciador();
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

    // ── Piperun ─────────────────────────────────────────
    async buscarPiperun() {
      const id = this.piperunId.trim();
      if (!id) return;
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
        // Auto-ativa filtro compatível se houver dados de valor
        if (this.oportunidade.formulario?.valor_imovel_num) {
          this.filtrarCompativeis = true;
          this.pagina = 1;
        }
      } catch (e) {
        this.piperunError = e.message;
        this.oportunidade = null;
      } finally {
        this.piperunLoading = false;
      }
    },

    // ── Compatibilidade ──────────────────────────────────
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

    // ── Sorting ─────────────────────────────────────────
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

    // ── Seleção ─────────────────────────────────────────
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

    // ── Modal ────────────────────────────────────────────
    abrirDetalhe(g) {
      if (this.historicoChart) {
        this.historicoChart.destroy();
        this.historicoChart = null;
      }
      this.grupoDetalhe = g;
      this.$nextTick(() => {
        if (g.historico?.length) this.renderChart(g.historico);
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

      this.historicoChart = new Chart(canvas, {
        type: "line",
        data: {
          labels: historico.map(h => h.mes),
          datasets: [
            {
              label: "Maior Lance",
              data: historico.map(h => h.maior),
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59,130,246,0.08)",
              tension: 0.3,
              fill: true,
              pointRadius: 2,
              borderWidth: 2,
            },
            {
              label: "Menor Lance",
              data: historico.map(h => h.menor),
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

    // ── Formatadores ─────────────────────────────────────
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

    // ── CALCULADORA IMÓVEL ──────────────────────────────
    async buscarOportunidade() {
      if (!this.piperunId) {
        alert("Digite o ID da oportunidade");
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

        // Auto-preencher campos com dados do Piperun
        if (f.valor_imovel_num) this.calc.creditoDesejado = f.valor_imovel_num;
        if (f.lance_maximo_num) this.calc.lancemaximo = f.lance_maximo_num;
        if (f.mensalidade_maxima_num) this.calc.parcelaDesejada = f.mensalidade_maxima_num;
        if (f.renda_mensal_num) this.calc.rendaTitular = f.renda_mensal_num;

        // Converter nascimento (formato DD/MM/YYYY → YYYY-MM-DD para input date)
        if (f.nascimento) {
          const [dia, mes, ano] = f.nascimento.split('/');
          this.calc.nascimentoTitular = `${ano}-${mes}-${dia}`;
        }

        // Mostrar mensagem com dados carregados
        let msg = `✓ ${f.nome || 'Cliente'} carregado`;
        if (f.email) msg += ` (${f.email})`;
        msg += ` - ⚠️ Complete dados do cônjuge se houver`;

        this.piperunError = msg;
        setTimeout(() => this.piperunError = null, 8000);
      } catch (err) {
        this.piperunError = `Erro ao buscar: ${err.message}`;
      } finally {
        this.piperunLoading = false;
      }
    },

    executarCalculo() {
      const c = this.calc;

      // Validações básicas
      if (!c.creditoDesejado || c.creditoDesejado <= 0) {
        alert("Preencha o crédito desejado");
        return;
      }

      // Dados das administradoras (com parâmetros reais da planilha)
      const administradoras = [
        { nome: "CNP", taxaAdm: 0.15, fundoRsv: 0.05, pctLanceEmbutido: 0.5, temFuro: 0.15 },
        { nome: "ITAÚ", taxaAdm: 0.2, fundoRsv: 0.03, pctLanceEmbutido: 0.3, temFuro: 0.2 },
        { nome: "CAOA", taxaAdm: 0.2, fundoRsv: 0.01, pctLanceEmbutido: 0.3, temFuro: 0.15 },
        { nome: "PORTO", taxaAdm: 0.15, fundoRsv: 0.005, pctLanceEmbutido: 0.3, temFuro: 0.15 },
        { nome: "EMBRACON", taxaAdm: 0.15, fundoRsv: 0.02, pctLanceEmbutido: 0.25, temFuro: 0.2 },
        { nome: "RODOBENS", taxaAdm: 0.18, fundoRsv: 0.05, pctLanceEmbutido: 0.3, temFuro: 0.15 },
      ];

      // Calcula valores auxiliares
      const totalFGTS = (c.fgtsTitular || 0) + (c.fgtsCunjuge || 0);
      const totalDisponivel = c.lancemaximo + totalFGTS;
      const rendaTotal = (c.rendaTitular || 0) + (c.rendaCunjuge || 0);
      const parcelaMaximaRenda = rendaTotal * 0.30; // 30% da renda
      const parcelaDesejada = c.parcelaDesejada || 6000;

      // Cálculos por administradora (baseado nas fórmulas da planilha)
      this.calc.resultados = administradoras.map(adm => {
        // (f) CRÉDITO A SER CONTRATADO
        // Fórmula: Crédito Desejado / (1 - % Lance Embutido)
        const creditoContratar = c.creditoDesejado / (1 - adm.pctLanceEmbutido);

        // (g) LANCE MÁXIMO (em %)
        // Fórmula: (Crédito × % Lance + Lance + FGTS) / (Crédito × (1 + Taxa + Fundo))
        const numeradorG = (creditoContratar * adm.pctLanceEmbutido) + c.lancemaximo + totalFGTS;
        const denominadorG = creditoContratar * (1 + adm.taxaAdm + adm.fundoRsv);
        const lanceMaximo = numeradorG / denominadorG;

        // (h) PRAZO MÍNIMO
        // Fórmula: (Crédito × (1 + Taxa + Fundo) - (Crédito × % Lance + Lance + FGTS)) / Parcela Desejada
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

      console.log("✓ Cálculo executado:", this.calc.resultados);

      // Validações de viabilidade
      this.validarViabilidade();
    },

    validarViabilidade() {
      const c = this.calc;
      const parcelaDesejada = c.parcelaDesejada || 6000;
      const rendaTotal = (c.rendaTitular || 0) + (c.rendaCunjuge || 0);
      const parcelaMaximaRenda = rendaTotal * 0.30;

      const avisos = [];
      let score = 100;

      // Validação 1: Parcela vs Renda
      if (rendaTotal > 0 && parcelaDesejada > parcelaMaximaRenda) {
        avisos.push(`⚠️ Parcela (R$ ${parcelaDesejada.toLocaleString("pt-BR")}) > 30% da renda (R$ ${parcelaMaximaRenda.toLocaleString("pt-BR", {maximumFractionDigits: 0})})`);
        score -= 30;
      }

      // Validação 2: Prazos muito altos
      const prazosAltos = c.resultados.filter(r => r.prazoMinimo > 180);
      if (prazosAltos.length >= 3) {
        avisos.push(`⚠️ ${prazosAltos.length} ADMs com prazo > 180 meses (fora do limite)`);
        score -= 25;
      }

      // Lance muito agressivo
      const lanceMaxDisp = c.lancemaximo || 0;
      const creditoDesejado = c.creditoDesejado || 0;
      if (creditoDesejado > 0 && lanceMaxDisp / creditoDesejado > 0.8) {
        avisos.push("⚠️ Lance muito agressivo (> 80% do imóvel) - reduz chance de contemplação");
        score -= 15;
      }

      this.avisoViabilidade = avisos.length > 0 ? avisos : null;
      this.scoreViabilidade = Math.max(0, score);
    },

    selecionarAdm(adm) {
      this.admSelecionada = adm.nome;
      // Filtrar grupos compatíveis desta ADM
      const v = this.oportunidade?.formulario?.valor_imovel_num || this.calc.creditoDesejado;
      const lanceDisp = this.calc.lancemaximo || 0;

      this.gruposAdmFiltrados = this.grupos.filter(g => {
        if (g.adm !== adm.nome) return false;
        // Compatibilidade: crédito cobre 70% OU (crédito + lance) cobre 95%
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

      // Encontrar ADM nos resultados
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

    gerarEstudoFinal() {
      if (!this.grupoSelecionado || !this.admSelecionada) {
        alert("Selecione um grupo e uma ADM");
        return;
      }

      // Preencher dados do estudo financeiro
      const admData = this.calc.resultados.find(a => a.nome === this.admSelecionada);
      const grupo = this.grupoSelecionado;
      const cliente = this.oportunidade?.formulario || {};

      // Data de hoje
      const today = new Date();
      const dataFormatada = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      // Datas limites (exemplos - na prática viriam do grupo)
      const limiteReserva = this.adicionarDias(today, 3);
      const limiteAssembleia = this.adicionarDias(today, 5);
      const vencimento1Parcela = this.adicionarDias(today, 30);
      const proximaAssembleia = this.adicionarDias(today, 10);

      // Preencher elementos do template
      document.getElementById("efData").textContent = dataFormatada;
      document.getElementById("efCartaCredito").textContent = this.formatCurrency(grupo.maior_credito);
      document.getElementById("efParcelaReduzida").textContent = this.formatCurrency(grupo.maior_credito * 0.30);
      document.getElementById("efLanceEmbutido").textContent = this.formatCurrency(admData?.creditoContratar || 0);
      document.getElementById("efPrazo").textContent = `${grupo.prazo_restante || 222} meses`;
      document.getElementById("efTaxaAdm").textContent = `${(admData?.taxaAdm * 100 || 0).toFixed(2)}% (${(admData?.taxaAdm * 100 || 0).toFixed(2)}% ao ano)`;
      document.getElementById("efFundoReserva").textContent = `${(admData?.fundoRsv * 100 || 0).toFixed(2)}% (Total)`;

      // Preencher simulações
      let simHtml = "";
      this.simulacoesEstudo.forEach((sim, idx) => {
        simHtml += `
          <tr style="border-bottom: 1px solid #ddd; ${idx % 2 === 0 ? 'background: #fafafa;' : ''}">
            <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">${idx + 1}</td>
            <td style="padding: 6px; border-right: 1px solid #ddd;">
              <div style="font-weight: bold; color: #1a202c;">${sim.tipo}</div>
              <div style="font-size: 9px; color: #666;">${sim.descricao}</div>
            </td>
            <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd;">
              <div style="font-weight: bold;">${sim.lancePercentual.toFixed(2)}%</div>
              <div style="font-size: 9px; color: #666;">${this.formatCurrency(sim.lanceTotalR$)}</div>
            </td>
            <td style="padding: 6px; text-align: right; border-right: 1px solid #ddd; font-weight: bold;">${this.formatCurrency(sim.creditoDisponivel)}</td>
            <td style="padding: 6px; text-align: right; border-right: 1px solid #ddd; font-weight: bold;">${this.formatCurrency(sim.parcelasMeses)}</td>
            <td style="padding: 6px; text-align: right;">${Math.ceil(grupo.prazo_restante || 222)} meses</td>
          </tr>
        `;
      });
      document.getElementById("efSimulacoes").innerHTML = simHtml;

      // Histórico de lances (exemplo com 12 meses)
      let historico = "<tr style='border-bottom: 1px solid #ddd;'>";
      for (let i = 0; i < 12; i++) {
        const mes = new Date();
        mes.setMonth(mes.getMonth() - (11 - i));
        const mesStr = mes.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).toLowerCase();
        historico += `
          <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd; font-size: 10px;">${mesStr}</td>
          <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd; font-size: 10px;">${(50 + Math.random() * 30).toFixed(2)}%</td>
          <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd; font-size: 10px;">${Math.floor(Math.random() * 50)}</td>
          <td style="padding: 6px; text-align: center; border-right: 1px solid #ddd; font-size: 10px;">${(40 + Math.random() * 35).toFixed(2)}%</td>
          <td style="padding: 6px; text-align: center; ${i < 11 ? 'border-right: 1px solid #ddd;' : ''} font-size: 10px;">${Math.floor(Math.random() * 30)}</td>
        `;
      }
      historico += "</tr>";
      document.getElementById("efHistoricoLances").innerHTML = historico;

      // Datas limites
      document.getElementById("efLimiteReserva").textContent = this.formatarDataBR(limiteReserva);
      document.getElementById("efLimiteAssembleia").textContent = this.formatarDataBR(limiteAssembleia);
      document.getElementById("efVencimento1Parcela").textContent = this.formatarDataBR(vencimento1Parcela);
      document.getElementById("efProximaAssembleia").textContent = this.formatarDataBR(proximaAssembleia);

      // Gerar PDF
      setTimeout(() => {
        const element = document.getElementById('estudoFinanceiroPDF');
        const opt = {
          margin: [5, 5, 5, 5],
          filename: `Estudo_Financeiro_${this.admSelecionada}_Grupo_${grupo.grupo}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        };
        html2pdf().set(opt).from(element).save();
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

    // ── GERENCIADOR MÉTODOS ────────────────────────────

    async fetchGruposGerenciador() {
      const p = new URLSearchParams();

      // Adicionar apenas parâmetros não-vazios (string vazia é falsy)
      if (this.gerenciador.filtros.adm && this.gerenciador.filtros.adm.trim())
        p.append("adm", this.gerenciador.filtros.adm.trim());

      // Suportar statusMulti (array) ou status (string legado)
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

        // Carregar todas as administradoras do dataset completo
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
      if (!grupo || !grupo.historico || grupo.historico.length === 0) return;
      const ctx = document.getElementById("historicoChartGerenciador");
      if (!ctx) return;
      if (this.historicoChartGerenciador) this.historicoChartGerenciador.destroy();
      const labels = grupo.historico.map(h => {
        const [ano, mes] = h.mes.split("-");
        const nomeMes = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"][parseInt(mes) - 1];
        return `${nomeMes}/${ano.slice(-2)}`;
      });
      const maiores = grupo.historico.map(h => h.maior_lance || null);
      const menores = grupo.historico.map(h => h.menor_lance || null);
      this.historicoChartGerenciador = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Maior Lance (%)",
              data: maiores,
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointBackgroundColor: "#ef4444",
              pointBorderColor: "#fff",
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: "Menor Lance (%)",
              data: menores,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              borderWidth: 2,
              pointBackgroundColor: "#3b82f6",
              pointBorderColor: "#fff",
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              labels: { color: "#cbd5e1", font: { size: 12 } }
            }
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

    async salvarGrupo() {
      // Validar antes de salvar (P1.3)
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
        const body = JSON.stringify(this.gerenciador.formulario);

        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
        const data = await res.json();

        if (res.ok && data.status === "sucesso") {
          const tipo = this.gerenciador.grupoSelecionado ? "atualizado" : "criado";
          this.mostrarToast(`Grupo ${tipo} com sucesso!`, "sucesso");
          this.limparErros();
          this.fecharModalGerenciador();
          await this.fetchGruposGerenciador();
        } else {
          this.mostrarToast(data.detail || "Erro ao salvar grupo", "erro");
        }
      } catch (e) {
        console.error("Erro ao salvar", e);
        this.mostrarToast("Erro ao salvar grupo", "erro");
      } finally {
        this.gerenciador.salvando = false;
      }
    },

    async deletarGrupo() {
      if (!this.gerenciador.grupoSelecionado) return;

      this.gerenciador.salvando = true;
      try {
        const url = `/api/grupos/${this.gerenciador.grupoSelecionado.grupo}?soft=${this.gerenciador.tipoDelete === "soft"}`;
        const res = await fetch(url, { method: "DELETE" });
        const data = await res.json();

        if (res.ok && data.status === "sucesso") {
          const tipo = this.gerenciador.tipoDelete === "soft" ? "desativado" : "deletado";
          this.mostrarToast(`Grupo ${tipo} com sucesso!`, "sucesso");
          this.fecharModalGerenciador();
          await this.fetchGruposGerenciador();
        } else {
          this.mostrarToast(data.detail || "Erro ao deletar grupo", "erro");
        }
      } catch (e) {
        console.error("Erro ao deletar", e);
        this.mostrarToast("Erro ao deletar grupo", "erro");
      } finally {
        this.gerenciador.salvando = false;
      }
    },

    async duplicarGrupo() {
      if (!this.gerenciador.grupoSelecionado) return;

      this.gerenciador.salvando = true;
      try {
        const url = `/api/grupos/${this.gerenciador.grupoSelecionado.grupo}/duplicar`;
        const res = await fetch(url, { method: "POST" });
        const data = await res.json();

        if (res.ok && data.status === "sucesso") {
          this.mostrarToast(`Grupo duplicado com sucesso! ID: ${data.novo_grupo_id}`, "sucesso");
          this.fecharModalGerenciador();
          await this.fetchGruposGerenciador();
        } else {
          this.mostrarToast(data.detail || "Erro ao duplicar grupo", "erro");
        }
      } catch (e) {
        console.error("Erro ao duplicar", e);
        this.mostrarToast("Erro ao duplicar grupo", "erro");
      } finally {
        this.gerenciador.salvando = false;
      }
    },

    async sincronizarComSheets() {
      this.gerenciador.sincronizando = true;
      this.gerenciador.ultimaSincronizacao = null;

      try {
        const inicioSync = Date.now();
        const res = await fetch("/api/sync-sheets", { method: "POST" });
        const data = await res.json();

        if (res.ok && data.status === "sucesso") {
          const tempoTotal = ((Date.now() - inicioSync) / 1000).toFixed(1);
          this.gerenciador.ultimaSincronizacao = {
            timestamp: data.timestamp,
            data_formatada: data.data_formatada,
            total_grupos: data.total_grupos,
            tempo_segundos: tempoTotal
          };
          this.mostrarToast(
            `✅ Sincronização concluída!\n${data.total_grupos} grupos em ${tempoTotal}s`,
            "sucesso"
          );
          await this.fetchGruposGerenciador();
        } else {
          throw new Error(data.detail || "Falha na sincronização");
        }
      } catch (e) {
        console.error("Erro ao sincronizar", e);
        this.gerenciador.ultimaSincronizacao = null;
        this.mostrarToast(
          `❌ Erro ao sincronizar: ${e.message}\nTente novamente em alguns instantes.`,
          "erro"
        );
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
        this.gerenciador.auditoria = [];
        this.mostrarToast("Erro ao carregar histórico de alterações", "erro");
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

    // P2.4 — Status Avançado de Grupos
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
        const res = await fetch(`/api/grupos/${grupo.grupo}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ novo_status: novoStatus })
        });
        const data = await res.json();

        if (res.ok && data.status === "sucesso") {
          this.mostrarToast(`Status alterado para ${novoStatus}`, "sucesso");
          await this.fetchGruposGerenciador();
          if (this.gerenciador.grupoSelecionado && this.gerenciador.grupoSelecionado.grupo === grupo.grupo) {
            this.gerenciador.grupoSelecionado.status = novoStatus;
          }
        } else {
          this.mostrarToast(data.detail || "Erro ao alterar status", "erro");
        }
      } catch (e) {
        console.error("Erro ao mudar status", e);
        this.mostrarToast("Erro ao alterar status: " + e.message, "erro");
      } finally {
        this.gerenciador.salvando = false;
      }
    },

    atualizarBuscaGerenciador() {
      if (this.gerenciador.timeoutBusca) {
        clearTimeout(this.gerenciador.timeoutBusca);
      }
      this.gerenciador.timeoutBusca = setTimeout(() => {
        this.gerenciador.filtros.busca = this.gerenciador.buscaTemporal;
        this.gerenciador.paginaAtual = 1;
      }, 300);
    },

    // ── HISTÓRICO MENSAL HELPERS (P1.2.2, P1.2.3, P1.2.4) ─
    getMesesAno(ano) {
      const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      const anoSufixo = ano.toString().slice(-2);
      return meses.map(m => `${m}-${anoSufixo}`);
    },

    getHistoricoField(mes, campo) {
      const grupo = this.gerenciador.grupoSelecionado;
      if (!grupo) return null;

      if (!grupo.historico) {
        grupo.historico = [];
      }

      let registro = grupo.historico.find(h => h.mes === mes);
      if (!registro) {
        registro = { mes: mes, maior: null, menor: null, qtd: null };
        grupo.historico.push(registro);
      }

      if (campo === 'maior') return registro.maior;
      if (campo === 'menor') return registro.menor;
      if (campo === 'qtd') return registro.qtd;
      return null;
    },

    setHistoricoField(mes, campo, valor) {
      const grupo = this.gerenciador.grupoSelecionado;
      if (!grupo) return;

      if (!grupo.historico) {
        grupo.historico = [];
      }

      let registro = grupo.historico.find(h => h.mes === mes);
      if (!registro) {
        registro = { mes: mes, maior: null, menor: null, qtd: null };
        grupo.historico.push(registro);
      }

      if (campo === 'maior') {
        registro.maior = valor ? parseFloat(valor) : null;
      } else if (campo === 'menor') {
        registro.menor = valor ? parseFloat(valor) : null;
      } else if (campo === 'qtd') {
        registro.qtd = valor ? parseInt(valor) : null;
      }
    },

    // ── VALIDAÇÕES DE CAMPOS (P1.3) ─
    validarCampo(campo, valor) {
      const erros = {};

      // Campos obrigatórios
      if (['adm', 'grupo', 'tipo_bem'].includes(campo)) {
        if (!valor || String(valor).trim() === '') {
          erros[campo] = `${this.obterLabelCampo(campo)} é obrigatório`;
        }
      }

      // Crédito
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

      // Percentuais (0-100%)
      const camposPercentual = ['taxa_adm', 'fundo_rsv', 'investidor', 'conservador_24m', 'moderado_12m', 'agressivo_6m', 'super_agressivo_3m'];
      if (camposPercentual.includes(campo)) {
        if (valor && isNaN(valor)) erros[campo] = 'Deve ser um número';
        else if (valor && (parseFloat(valor) < 0 || parseFloat(valor) > 100)) {
          erros[campo] = 'Deve estar entre 0-100%';
        }
      }

      // Histórico mensal - apenas se houver valor
      if (campo.startsWith('historico_')) {
        const [_, mes, tipo] = campo.split('_');
        if (valor && isNaN(valor)) {
          erros[campo] = 'Deve ser um número';
        } else if (tipo !== 'qtd' && valor && (parseFloat(valor) < 0 || parseFloat(valor) > 100)) {
          erros[campo] = 'Lance deve estar entre 0-100%';
        } else if (tipo === 'qtd' && valor && parseFloat(valor) < 0) {
          erros[campo] = 'Quantidade não pode ser negativa';
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

      // Validações obrigatórias
      const obrigatorios = ['adm', 'grupo', 'tipo_bem'];
      obrigatorios.forEach(campo => {
        const val = this.gerenciador.formulario[campo];
        if (!val || String(val).trim() === '') {
          this.gerenciador.erros[campo] = `${this.obterLabelCampo(campo)} é obrigatório`;
          this.gerenciador.camposComErro.push(campo);
        }
      });

      // Validações de crédito
      if (this.gerenciador.formulario.menor_credito) {
        const menor = parseFloat(this.gerenciador.formulario.menor_credito);
        if (isNaN(menor) || menor < 0) {
          this.gerenciador.erros.menor_credito = 'Menor Crédito deve ser um número positivo';
          this.gerenciador.camposComErro.push('menor_credito');
        }
      }

      if (this.gerenciador.formulario.maior_credito) {
        const maior = parseFloat(this.gerenciador.formulario.maior_credito);
        if (isNaN(maior) || maior < 0) {
          this.gerenciador.erros.maior_credito = 'Maior Crédito deve ser um número positivo';
          this.gerenciador.camposComErro.push('maior_credito');
        } else if (this.gerenciador.formulario.menor_credito) {
          const menor = parseFloat(this.gerenciador.formulario.menor_credito);
          if (maior < menor) {
            this.gerenciador.erros.maior_credito = 'Maior Crédito deve ser >= Menor Crédito';
            this.gerenciador.camposComErro.push('maior_credito');
          }
        }
      }

      // Validações de percentual
      const camposPercentual = ['taxa_adm', 'fundo_rsv', 'investidor', 'conservador_24m', 'moderado_12m', 'agressivo_6m', 'super_agressivo_3m'];
      camposPercentual.forEach(campo => {
        const val = this.gerenciador.formulario[campo];
        if (val && !isNaN(val)) {
          const num = parseFloat(val);
          if (num < 0 || num > 100) {
            this.gerenciador.erros[campo] = `${this.obterLabelCampo(campo)} deve estar entre 0-100%`;
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

    // ── INDICADOR DE MESES PENDENTES (P1.5) ─
    obterMesPendente(mes) {
      const historico = this.gerenciador.formulario.historico || [];
      const registro = historico.find(h => h.mes === mes);
      if (!registro) return true; // Mês sem registro é pendente
      // Mês é pendente se faltam TODOS os campos (maior, menor e qtd)
      return !registro.maior && !registro.menor && !registro.qtd;
    },

    obterResumoMesesCompletos() {
      const historico = this.gerenciador.formulario.historico || [];
      let completos = 0;
      const mesesEsperados = 36; // JAN-24 até DEC-26

      // Conta quantos meses têm TODOS os campos preenchidos
      historico.forEach(reg => {
        if (reg.maior !== null && reg.maior !== undefined &&
            reg.menor !== null && reg.menor !== undefined &&
            reg.qtd !== null && reg.qtd !== undefined) {
          completos++;
        }
      });

      return `${completos}/${mesesEsperados} meses completos`;
    },

    mostrarToast(mensagem, tipo = "info") {
      // Toast simples usando alert por enquanto
      // TODO: Implementar toast UI melhorado
      console.log(`[${tipo.toUpperCase()}] ${mensagem}`);
    },
  };
}
