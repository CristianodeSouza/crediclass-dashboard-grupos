const screens = {
  mapa: {
    letter: "A) MAPA DE GRUPOS",
    title: "Mapa de Grupos",
    subtitle: "Lista e manutencao da base de grupos",
    action: "Novo Grupo",
  },
  viabilidade: {
    letter: "B) VIABILIDADE",
    title: "Viabilidade",
    subtitle: "Analise de viabilidade e selecao dos melhores grupos",
    action: "Analisar Viabilidade",
  },
  estudo: {
    letter: "C) ESTUDO FINANCEIRO",
    title: "Estudo Financeiro",
    subtitle: "Geracao do estudo financeiro detalhado",
    action: "Salvar Estudo",
  },
  historico: {
    letter: "D) HISTORICO DE ESTUDOS",
    title: "Historico de Estudos",
    subtitle: "Consulta e gestao dos estudos financeiros gerados",
    action: "Buscar Estudos",
  },
  configuracoes: {
    letter: "E) CONFIGURACOES",
    title: "Configuracoes",
    subtitle: "Configuracoes do sistema e preferencias",
    action: "Salvar Configuracoes",
  },
};

const mapState = {
  page: 1,
  pageSize: 25,
  total: 0,
  items: [],
  lastLoadAt: null,
};

function showToast(message, type = "success") {
  const region = document.getElementById("toastRegion");
  const toast = document.createElement("div");
  toast.className = `alert alert-${type} shadow-sm mb-2`;
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function activateScreen(screenName) {
  const meta = screens[screenName];
  if (!meta) return;

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.screen === screenName);
  });

  document.querySelectorAll(".screen-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `screen-${screenName}`);
  });

  document.getElementById("screenLetter").textContent = meta.letter;
  document.getElementById("screenTitle").textContent = meta.title;
  document.getElementById("screenSubtitle").textContent = meta.subtitle;
  document.getElementById("primaryAction").textContent = meta.action;
}

function formatMoney(value) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercent(value) {
  if (value === null || value === undefined) return "-";
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(value * 100)}%`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}

function parseNumberInput(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  return text.replace(/\./g, "").replace(",", ".");
}

function getMapFilters() {
  return {
    administradora: document.getElementById("filterAdministradora").value,
    tipo_bem: document.getElementById("filterTipoBem").value,
    status: document.getElementById("filterStatus").value,
    busca: document.getElementById("filterBusca").value.trim(),
    credito_minimo: parseNumberInput(document.getElementById("filterCreditoMinimo").value),
    credito_maximo: parseNumberInput(document.getElementById("filterCreditoMaximo").value),
    prazo_minimo: document.getElementById("filterPrazoMinimo").value.trim(),
    prazo_maximo: document.getElementById("filterPrazoMaximo").value.trim(),
  };
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) query.set(key, value);
  });
  query.set("page", mapState.page);
  query.set("page_size", mapState.pageSize);
  return query.toString();
}

function setMapState(state) {
  document.getElementById("groupsLoading").classList.toggle("d-none", state !== "loading");
  document.getElementById("groupsError").classList.toggle("d-none", state !== "error");
  document.getElementById("groupsEmpty").classList.toggle("d-none", state !== "empty");
  document.getElementById("groupsTableWrap").classList.toggle("d-none", state !== "ready");
}

function updateSelectOptions(id, values, defaultLabel) {
  const select = document.getElementById(id);
  const selected = select.value;
  select.innerHTML = `<option value="">${defaultLabel}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
  if (values.includes(selected)) select.value = selected;
}

function updateFilterOptions(items) {
  const administradoras = [...new Set(items.map((item) => item.administradora).filter(Boolean))].sort();
  const tipos = [...new Set(items.map((item) => item.tipo_bem).filter(Boolean))].sort();
  updateSelectOptions("filterAdministradora", administradoras, "Todas");
  updateSelectOptions("filterTipoBem", tipos, "Todos");
}

function renderSummary(items, total) {
  const administradoras = new Set(items.map((item) => item.administradora).filter(Boolean));
  const credito = items.reduce((sum, item) => sum + (item.credito_maximo || 0), 0);
  const taxas = items.map((item) => item.taxa_adm).filter((value) => value !== null && value !== undefined);
  const taxaMedia = taxas.length ? taxas.reduce((sum, value) => sum + value, 0) / taxas.length : null;

  document.getElementById("summaryTotal").textContent = total;
  document.getElementById("summaryAdministradoras").textContent = administradoras.size;
  document.getElementById("summaryCredito").textContent = formatMoney(credito);
  document.getElementById("summaryTaxa").textContent = formatPercent(taxaMedia);
  document.getElementById("summaryUpdated").textContent = mapState.lastLoadAt || "--";
}

function renderGroupsTable(items) {
  const tbody = document.getElementById("groupsTableBody");
  tbody.innerHTML = items.map((item) => {
    const inactive = String(item.status || "").toLowerCase() === "excluido";
    return `
      <tr>
        <td>${escapeHtml(item.grupo_id)}</td>
        <td>${escapeHtml(item.administradora)}</td>
        <td>${escapeHtml(item.tipo_bem)}</td>
        <td>${formatMoney(item.credito_minimo)}</td>
        <td>${formatMoney(item.credito_maximo)}</td>
        <td>${formatPercent(item.taxa_adm)}</td>
        <td>${item.prazo_total ?? "-"}</td>
        <td>${escapeHtml(item.primeira_assembleia || "-")}</td>
        <td>${escapeHtml(item.ultima_assembleia || "-")}</td>
        <td><span class="status-badge ${inactive ? "inactive" : ""}">${escapeHtml(item.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn btn-sm btn-outline-primary" type="button" data-map-action="visualizar">Ver</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" data-map-action="editar">Editar</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" data-map-action="duplicar">Duplicar</button>
            <button class="btn btn-sm btn-outline-danger" type="button" data-map-action="excluir">Excluir</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(mapState.total / mapState.pageSize));
  document.getElementById("paginationInfo").textContent = `Pagina ${mapState.page} de ${totalPages} - ${mapState.total} grupo(s)`;
  document.getElementById("prevPageBtn").disabled = mapState.page <= 1;
  document.getElementById("nextPageBtn").disabled = mapState.page >= totalPages;
}

async function loadMapaGrupos() {
  setMapState("loading");
  try {
    const data = await apiGet(`/grupos?${buildQuery(getMapFilters())}`);
    mapState.total = data.total;
    mapState.items = data.items;
    mapState.lastLoadAt = new Date().toLocaleString("pt-BR");
    updateFilterOptions(data.items);
    renderSummary(data.items, data.total);
    renderGroupsTable(data.items);
    renderPagination();
    document.getElementById("tableSubtitle").textContent = `${data.total} grupo(s) encontrado(s)`;
    setMapState(data.items.length ? "ready" : "empty");
  } catch (error) {
    renderSummary([], 0);
    document.getElementById("tableSubtitle").textContent = "Erro ao carregar grupos";
    setMapState("error");
  }
}

async function loadHealth() {
  const health = await apiGet("/health");
  document.getElementById("environmentLabel").textContent = health.environment;
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", () => activateScreen(item.dataset.screen));
});

document.getElementById("primaryAction").addEventListener("click", () => {
  showToast("Funcionalidade sera implementada na etapa correspondente.", "info");
});

document.getElementById("groupFilters").addEventListener("submit", (event) => {
  event.preventDefault();
});

["filterAdministradora", "filterTipoBem", "filterStatus", "filterCreditoMinimo", "filterCreditoMaximo", "filterPrazoMinimo", "filterPrazoMaximo"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    mapState.page = 1;
    loadMapaGrupos();
  });
});

document.getElementById("filterBusca").addEventListener("input", () => {
  clearTimeout(window.mapSearchTimer);
  window.mapSearchTimer = setTimeout(() => {
    mapState.page = 1;
    loadMapaGrupos();
  }, 300);
});

document.getElementById("clearFiltersBtn").addEventListener("click", () => {
  document.getElementById("groupFilters").reset();
  mapState.page = 1;
  loadMapaGrupos();
});

document.getElementById("pageSizeSelect").addEventListener("change", (event) => {
  mapState.pageSize = Number(event.target.value);
  mapState.page = 1;
  loadMapaGrupos();
});

document.getElementById("prevPageBtn").addEventListener("click", () => {
  if (mapState.page > 1) {
    mapState.page -= 1;
    loadMapaGrupos();
  }
});

document.getElementById("nextPageBtn").addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(mapState.total / mapState.pageSize));
  if (mapState.page < totalPages) {
    mapState.page += 1;
    loadMapaGrupos();
  }
});

document.getElementById("groupsTableBody").addEventListener("click", (event) => {
  const button = event.target.closest("[data-map-action]");
  if (!button) return;
  showToast("Acao sera implementada nas proximas etapas.", "info");
});

loadHealth().catch(() => {
  document.getElementById("environmentLabel").textContent = "indisponivel";
});

loadMapaGrupos();
