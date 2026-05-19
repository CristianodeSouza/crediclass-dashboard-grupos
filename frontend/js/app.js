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
      lanceMaximo: 150000,
      fgtsTitular: 0,
      fgtsConjuge: 0,
      nascimentoTitular: "",
      nascimentoConjuge: "",
      rendaTitular: 3500,
      rendaConjuge: 0,
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

    // ── GERENCIADOR DE GRUPOS ──────────────────────────
    gruposGerenciador: [],
    loadingGerenciador: false,
    mostrarFiltrosMobile: false,
    paginaGerenciador: 1,
    porPaginaGerenciador: 20,
    filtroGerenciadorAdm: "",
    filtroGerenciadorStatus: "",
    filtroGerenciadorCreditoMin: "",
    filtroGerenciadorCreditoMax: "",
    filtroGerenciadorBusca: "",

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

    get totalGruposGerenciador() { return this.gruposGerenciador.length; },

    get gruposGerenciadorFiltrados() {
      let list = [...this.gruposGerenciador];
      if (this.filtroGerenciadorAdm) list = list.filter(g => g.adm === this.filtroGerenciadorAdm);
      if (this.filtroGerenciadorStatus) list = list.filter(g => (g.status || "ativo") === this.filtroGerenciadorStatus);
      if (this.filtroGerenciadorCreditoMin) list = list.filter(g => g.maior_credito && g.maior_credito >= parseFloat(this.filtroGerenciadorCreditoMin));
      if (this.filtroGerenciadorCreditoMax) list = list.filter(g => g.maior_credito && g.maior_credito <= parseFloat(this.filtroGerenciadorCreditoMax));
      if (this.filtroGerenciadorBusca) {
        const b = this.filtroGerenciadorBusca.toLowerCase();
        list = list.filter(g => String(g.grupo).toLowerCase().includes(b) || g.adm.toLowerCase().includes(b));
      }
      return list;
    },

    get totalPaginasGerenciador() { return Math.max(1, Math.ceil(this.gruposGerenciadorFiltrados.length / this.porPaginaGerenciador)); },

    get gruposGerenciadorPaginados() {
      const s = (this.paginaGerenciador - 1) * this.porPaginaGerenciador;
      return this.gruposGerenciadorFiltrados.slice(s, s + this.porPaginaGerenciador);
    },

    // ── Lifecycle ───────────────────────────────────────
    async init() {
      await Promise.all([this.loadStats(), this.loadGrupos(), this.sincronizarGrupos()]);
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
        if (f.lance_maximo_num) this.calc.lanceMaximo = f.lance_maximo_num;
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
      const totalFGTS = (c.fgtsTitular || 0) + (c.fgtsConjuge || 0);
      const totalDisponivel = c.lanceMaximo + totalFGTS;
      const rendaTotal = (c.rendaTitular || 0) + (c.rendaConjuge || 0);
      const parcelaMaximaRenda = rendaTotal * 0.30; // 30% da renda
      const parcelaDesejada = c.parcelaDesejada || 6000;

      // Cálculos por administradora (baseado nas fórmulas da planilha)
      this.calc.resultados = administradoras.map(adm => {
        // (f) CRÉDITO A SER CONTRATADO
        // Fórmula: Crédito Desejado / (1 - % Lance Embutido)
        const creditoContratar = c.creditoDesejado / (1 - adm.pctLanceEmbutido);

        // (g) LANCE MÁXIMO (em %)
        // Fórmula: (Crédito × % Lance + Lance + FGTS) / (Crédito × (1 + Taxa + Fundo))
        const numeradorG = (creditoContratar * adm.pctLanceEmbutido) + c.lanceMaximo + totalFGTS;
        const denominadorG = creditoContratar * (1 + adm.taxaAdm + adm.fundoRsv);
        const lanceMaximo = numeradorG / denominadorG;

        // (h) PRAZO MÍNIMO
        // Fórmula: (Crédito × (1 + Taxa + Fundo) - (Crédito × % Lance + Lance + FGTS)) / Parcela Desejada
        const creditoComTaxas = creditoContratar * (1 + adm.taxaAdm + adm.fundoRsv);
        const lanceComFGTS = (creditoContratar * adm.pctLanceEmbutido) + c.lanceMaximo + totalFGTS;
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
      const rendaTotal = (c.rendaTitular || 0) + (c.rendaConjuge || 0);
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
      const lanceMaxDisp = c.lanceMaximo || 0;
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
      const lanceDisp = this.calc.lanceMaximo || 0;

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

    // ── MÉTODOS GERENCIADOR DE GRUPOS ───────────────────
    async sincronizarGrupos() {
      this.loadingGerenciador = true;
      try {
        const res = await fetch("/api/grupos-gerenciador?pagina=1&por_pagina=500");
        const data = await res.json();
        this.gruposGerenciador = data.grupos || [];
        this.paginaGerenciador = 1;
      } catch (e) {
        console.error("Erro ao carregar grupos gerenciador", e);
      } finally {
        this.loadingGerenciador = false;
      }
    },

    limparFiltrosGerenciador() {
      this.filtroGerenciadorAdm = "";
      this.filtroGerenciadorStatus = "";
      this.filtroGerenciadorCreditoMin = "";
      this.filtroGerenciadorCreditoMax = "";
      this.filtroGerenciadorBusca = "";
      this.paginaGerenciador = 1;
    },

    async editarGrupo(grupo) {
      const novoAdm = prompt("Nova ADM (AUTO-CAIXA, AUTO-CAOA, AUTO-ITAÚ, CAIXA, CANOPUS, CAOA, ITAÚ, PORTO, RODOBENS):", grupo.adm);
      if (novoAdm === null) return;
      const admValidas = ["AUTO-CAIXA", "AUTO-CAOA", "AUTO-ITAÚ", "CAIXA", "CANOPUS", "CAOA", "ITAÚ", "PORTO", "RODOBENS"];
      if (!admValidas.includes(novoAdm.toUpperCase())) {
        alert("ADM inválida. Use uma das 9 opções: " + admValidas.join(", "));
        return;
      }
      try {
        const res = await fetch(`/api/grupos/${grupo.grupo}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adm: novoAdm.toUpperCase() })
        });
        if (res.ok) {
          grupo.adm = novoAdm.toUpperCase();
          alert("Grupo atualizado com sucesso!");
        } else {
          const err = await res.json();
          alert("Erro ao atualizar: " + (err.detail || "Desconhecido"));
        }
      } catch (e) {
        console.error("Erro ao editar grupo", e);
        alert("Erro ao editar grupo: " + e.message);
      }
    },

    async excluirGrupo(grupoId) {
      if (!confirm(`Tem certeza que deseja excluir o grupo ${grupoId}?`)) return;
      this.loadingGerenciador = true;
      try {
        const res = await fetch(`/api/grupos/${grupoId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
          this.gruposGerenciador = this.gruposGerenciador.filter(g => g.grupo !== grupoId);
          alert("Grupo excluído com sucesso!");
        } else {
          const err = await res.json();
          alert("Erro ao excluir: " + (err.detail || "Desconhecido"));
        }
      } catch (e) {
        console.error("Erro ao excluir grupo", e);
        alert("Erro ao excluir grupo: " + e.message);
      } finally {
        this.loadingGerenciador = false;
      }
    },

    novoGrupo() {
      const adm = prompt("ADM do novo grupo:");
      if (!adm) return;
      const grupo = prompt("ID do novo grupo:");
      if (!grupo) return;
      const novoGrupo = { grupo, adm, status: "ativo", maior_credito: 0 };
      this.gruposGerenciador.unshift(novoGrupo);
      alert("Novo grupo criado! Lembre-se de salvar as mudanças.");
    },
  };
}

// Expor funções globalmente para Alpine.js
window.dashboard = dashboard;

window.init = function() {
  // Esta função é chamada quando a página carrega (x-init="init()")
  // O contexto 'this' é o objeto retornado por dashboard()
  if (this && typeof this.loadGerenciador === 'function') {
    this.loadGerenciador();
  }
  if (this && typeof this.loadGrupos === 'function') {
    this.loadGrupos();
  }
  if (this && typeof this.loadStats === 'function') {
    this.loadStats();
  }
};

// Expose dashboard function to global scope for Alpine.js
window.dashboard = dashboard;
