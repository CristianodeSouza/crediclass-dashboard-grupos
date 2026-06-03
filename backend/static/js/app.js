const GENERAL_FIELDS = [
  ["administradora", "Administradora", true],
  ["grupo", "Grupo", true],
  ["tipo_bem", "Tipo de Bem", false],
  ["primeira_assembleia", "Primeira Assembleia", false],
  ["data_termino", "Data de Termino", false],
  ["prazo_grupo", "Prazo Grupo", false],
  ["prazo_restante", "Prazo Restante", false],
  ["menor_credito", "Menor Credito", false],
  ["maior_credito", "Maior Credito", false],
  ["taxa_administracao", "Taxa Administracao", false],
  ["fundo_reserva", "Fundo Reserva", false],
  ["prestacao_integral", "Prestacao Integral", false],
  ["categoria", "Categoria", false],
  ["status", "Status", false],
];

const MONTHS = {
  2024: ["JAN-24", "FEB-24", "MAR-24", "APR-24", "MAY-24", "JUN-24", "JUL-24", "AUG-24", "SEP-24", "OCT-24", "NOV-24", "DEC-24"],
  2025: ["JAN-25", "FEB-25", "MAR-25", "APR-25", "MAY-25", "JUN-25", "JUL-25", "AUG-25", "SEP-25", "OCT-25", "NOV-25", "DEC-25"],
  2026: ["JAN-26", "FEB-26", "MAR-26", "APR-26", "MAY-26", "JUN-26", "JUL-26", "AUG-26", "SEP-26", "OCT-26", "NOV-26", "DEC-26"],
};

let groups = [];
let editingId = null;
let originalGroup = null;
const modal = new bootstrap.Modal(document.getElementById("groupModal"));

const el = (id) => document.getElementById(id);
const raw = (value) => value ?? "";
const safe = (value) => String(raw(value)).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;",
}[char]));

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "Erro na requisicao");
  }
  return response.json();
}

function setStatus(text) {
  el("statusText").textContent = text;
}

function renderTable() {
  const tbody = el("groupsTable");
  tbody.innerHTML = "";

  if (!groups.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center text-secondary py-4">Nenhum grupo encontrado</td></tr>`;
    return;
  }

  for (const group of groups) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${safe(group.administradora)}</td>
      <td>${safe(group.grupo)}</td>
      <td>${safe(group.tipo_bem)}</td>
      <td>${safe(group.menor_credito)}</td>
      <td>${safe(group.maior_credito)}</td>
      <td>${safe(group.prazo_restante || group.prazo_grupo)}</td>
      <td>${safe(group.prestacao_integral)}</td>
      <td>${safe(group.taxa_administracao)}</td>
      <td>${safe(group.status)}</td>
      <td class="text-end action-cell">
        <button class="btn btn-sm btn-outline-primary me-1" type="button" data-action="edit" data-id="${group.grupo_id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-id="${group.grupo_id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function updateAdministradoras() {
  const select = el("admFilter");
  const current = select.value;
  const names = [...new Set(groups.map((g) => g.administradora).filter(Boolean))].sort();
  select.innerHTML = `<option value="">Todas</option>${names.map((name) => `<option value="${safe(name)}">${safe(name)}</option>`).join("")}`;
  select.value = names.includes(current) ? current : "";
}

async function loadGroups() {
  const params = new URLSearchParams();
  if (el("admFilter").value) params.set("administradora", el("admFilter").value);
  if (el("searchInput").value) params.set("busca", el("searchInput").value);

  setStatus("Carregando dados...");
  const data = await api(`/api/grupos?${params.toString()}`);
  groups = data.grupos;
  updateAdministradoras();
  renderTable();
  setStatus(`${data.total} grupo(s) carregado(s)`);
}

function renderGeneralFields(group = {}) {
  el("generalFields").innerHTML = GENERAL_FIELDS.map(([field, label, required]) => `
    <div class="col-12 col-md-6 col-lg-4">
      <label class="form-label" for="field-${field}">${label}</label>
      <input id="field-${field}" class="form-control" name="${field}" value="${safe(group[field])}" ${required ? "required" : ""}>
    </div>
  `).join("");
}

function renderHistory(year, items = []) {
  const values = new Map(items.map((item) => [item.mes, item]));
  const container = document.querySelector(`[data-history-year="${year}"]`);
  container.innerHTML = `
    <table class="table table-sm history-table">
      <thead><tr><th>Mes</th><th>Maior Lance</th><th>Menor Lance</th><th>Qtd Contemplacoes</th></tr></thead>
      <tbody>
        ${MONTHS[year].map((month) => {
          const item = values.get(month) || {};
          return `
            <tr>
              <td class="fw-semibold">${month}</td>
              <td><input class="form-control form-control-sm" data-year="${year}" data-month="${month}" data-key="maior_lance" value="${safe(item.maior_lance)}"></td>
              <td><input class="form-control form-control-sm" data-year="${year}" data-month="${month}" data-key="menor_lance" value="${safe(item.menor_lance)}"></td>
              <td><input class="form-control form-control-sm" data-year="${year}" data-month="${month}" data-key="qtd_contemplacoes" value="${safe(item.qtd_contemplacoes)}"></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

async function openEditor(grupoId = null) {
  editingId = grupoId;
  const group = grupoId ? await api(`/api/grupos/${encodeURIComponent(grupoId)}`) : { historico: {} };
  originalGroup = structuredClone(group);

  el("modalTitle").textContent = grupoId ? `Editar Grupo ${raw(group.grupo)}` : "Novo Grupo";
  renderGeneralFields(group);
  renderHistory("2024", group.historico?.["2024"] || []);
  renderHistory("2025", group.historico?.["2025"] || []);
  renderHistory("2026", group.historico?.["2026"] || []);
  modal.show();
}

function collectPayload() {
  const dados_gerais = {};
  for (const [field] of GENERAL_FIELDS) {
    dados_gerais[field] = document.querySelector(`[name="${field}"]`).value;
  }

  const historico = { 2024: [], 2025: [], 2026: [] };
  for (const year of Object.keys(MONTHS)) {
    for (const month of MONTHS[year]) {
      const item = { mes: month };
      for (const key of ["maior_lance", "menor_lance", "qtd_contemplacoes"]) {
        item[key] = document.querySelector(`[data-year="${year}"][data-month="${month}"][data-key="${key}"]`).value;
      }
      historico[year].push(item);
    }
  }

  return { dados_gerais, historico };
}

function historyByMonth(group, year) {
  return new Map((group?.historico?.[year] || []).map((item) => [item.mes, item]));
}

function collectChangedPayload() {
  const current = collectPayload();
  if (!editingId || !originalGroup) return current;

  const dados_gerais = {};
  for (const [field] of GENERAL_FIELDS) {
    const before = raw(originalGroup[field]);
    const after = raw(current.dados_gerais[field]);
    if (String(before) !== String(after)) {
      dados_gerais[field] = after;
    }
  }

  const historico = {};
  for (const year of Object.keys(MONTHS)) {
    const beforeByMonth = historyByMonth(originalGroup, year);
    for (const item of current.historico[year]) {
      const before = beforeByMonth.get(item.mes) || {};
      const changed = { mes: item.mes };
      for (const key of ["maior_lance", "menor_lance", "qtd_contemplacoes"]) {
        if (String(raw(before[key])) !== String(raw(item[key]))) {
          changed[key] = item[key];
        }
      }
      if (Object.keys(changed).length > 1) {
        if (!historico[year]) historico[year] = [];
        historico[year].push(changed);
      }
    }
  }

  return { dados_gerais, historico };
}

async function saveGroup(event) {
  event.preventDefault();
  el("saveBtn").disabled = true;
  try {
    const payload = collectChangedPayload();
    if (editingId) {
      await api(`/api/grupos/${encodeURIComponent(editingId)}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await api("/api/grupos", { method: "POST", body: JSON.stringify(payload) });
    }
    modal.hide();
    await loadGroups();
  } finally {
    el("saveBtn").disabled = false;
  }
}

async function deleteGroup(grupoId) {
  if (!confirm("Excluir este grupo da planilha?")) return;
  await api(`/api/grupos/${encodeURIComponent(grupoId)}`, { method: "DELETE" });
  await loadGroups();
}

el("newBtn").addEventListener("click", () => openEditor());
el("reloadBtn").addEventListener("click", async () => {
  await api("/api/reload", { method: "POST" });
  await loadGroups();
});
el("admFilter").addEventListener("change", loadGroups);
el("searchInput").addEventListener("input", () => {
  clearTimeout(window.searchTimer);
  window.searchTimer = setTimeout(loadGroups, 250);
});
el("groupForm").addEventListener("submit", saveGroup);
el("groupsTable").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action === "edit") openEditor(button.dataset.id);
  if (button.dataset.action === "delete") deleteGroup(button.dataset.id);
});

loadGroups().catch((error) => setStatus(error.message));
