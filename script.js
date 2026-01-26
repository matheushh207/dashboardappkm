const API_URL = "https://script.google.com/macros/s/SEU_APP_SCRIPT_ID/exec"; // Substitua pelo seu URL

/* LISTA FIXA DE MOTORISTAS */
const TODOS_MOTORISTAS = [
  "MARIO",
  "JOEL",
  "VILSON",
  "CLAUDIOMAR",
  "BLADEMIR",
  "ALESSANDRO",
  "CARLOS"
];

let dados = { rotas: [], coletas: [] };
let abaAtual = "rotas"; // "rotas" ou "coletas"

/* =========================
   CARREGA DADOS DA API
========================= */
fetch(API_URL)
  .then(res => res.json())
  .then(json => {
    dados = json;
    carregarFiltros();
    renderizar();
  })
  .catch(err => console.error("Erro ao carregar dados:", err));

document.getElementById("motoristaFiltro").addEventListener("change", renderizar);
document.getElementById("statusFiltro").addEventListener("change", renderizar);

/* =========================
   FILTROS
========================= */
function carregarFiltros() {
  const select = document.getElementById("motoristaFiltro");
  select.innerHTML = `<option value="TODOS">Todos os motoristas</option>`;
  TODOS_MOTORISTAS.forEach(m => {
    select.innerHTML += `<option value="${m}">${m}</option>`;
  });
}

/* =========================
   TROCA DE ABA
========================= */
function trocarAba(aba) {
  abaAtual = aba;
  document.getElementById("rotasSection").style.display = aba === "rotas" ? "block" : "none";
  document.getElementById("coletasSection").style.display = aba === "coletas" ? "block" : "none";
  renderizar();
}

/* =========================
   RENDERIZA DASHBOARD
========================= */
function renderizar() {
  const motoristaSel = document.getElementById("motoristaFiltro").value;
  const statusSel = document.getElementById("statusFiltro").value;

  const registros = abaAtual === "rotas" ? dados.rotas : dados.coletas;

  const filtrado = registros.filter(d =>
    (motoristaSel === "TODOS" || d.motorista === motoristaSel) &&
    (statusSel === "TODOS" || d.status === statusSel)
  );

  if (abaAtual === "rotas") renderizarCardsRotas(filtrado);
  else renderizarCardsColetas(filtrado);

  renderizarTabela(filtrado);
}

/* =========================
   CARDS ROTAS
========================= */
function renderizarCardsRotas(filtrado) {
  let kmTotal = 0;
  let rotasAbertas = 0;
  let rotasFinalizadas = 0;
  const motoristasAtivos = new Set();

  filtrado.forEach(r => {
    motoristasAtivos.add(r.motorista);
    if (r.status === "EM ANDAMENTO") rotasAbertas++;
    if (r.status === "FINALIZADO") {
      rotasFinalizadas++;
      const kmRodado = Number(r.km_final) - Number(r.km_inicial);
      if (!isNaN(kmRodado)) kmTotal += kmRodado;
    }
  });

  document.getElementById("kmTotal").innerText = `${kmTotal.toLocaleString("pt-BR")} KM`;
  document.getElementById("rotasAbertas").innerText = rotasAbertas;
  document.getElementById("rotasFinalizadas").innerText = rotasFinalizadas;
  document.getElementById("motoristasAtivos").innerText = `${motoristasAtivos.size} / ${TODOS_MOTORISTAS.length}`;
}

/* =========================
   CARDS COLETAS
========================= */
function renderizarCardsColetas(filtrado) {
  let totalVolumes = 0;
  let coletasAtivas = 0;
  let coletasAgrupadas = 0;
  const motoristasAtivos = new Set();

  filtrado.forEach(c => {
    motoristasAtivos.add(c.motorista);
    totalVolumes += Number(c.volumes || 0);
    if (c.status === "ATIVO") coletasAtivas++;
    if (c.status === "AGRUPADO") coletasAgrupadas++;
  });

  document.getElementById("kmTotal").innerText = `${totalVolumes} Volumes`;
  document.getElementById("rotasAbertas").innerText = coletasAtivas;
  document.getElementById("rotasFinalizadas").innerText = coletasAgrupadas;
  document.getElementById("motoristasAtivos").innerText = `${motoristasAtivos.size} / ${TODOS_MOTORISTAS.length}`;
}

/* =========================
   TABELA
========================= */
function renderizarTabela(registros) {
  const tbody = document.getElementById("tabela");
  tbody.innerHTML = "";

  registros.forEach(r => {
    if (abaAtual === "rotas") {
      tbody.innerHTML += `
        <tr>
          <td>${formatarData(r.data_inicio)}</td>
          <td>${formatarData(r.data_fim)}</td>
          <td>${r.motorista}</td>
          <td>${r.placa}</td>
          <td>${r.km_inicial}</td>
          <td>${r.km_final || "-"}</td>
          <td>
            <span class="badge ${r.status === "EM ANDAMENTO" ? "andamento" : "finalizado"}">
              ${r.status}
            </span>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML += `
        <tr>
          <td>${formatarData(r.data)}</td>
          <td>${r.motorista}</td>
          <td>${r.nf}</td>
          <td>${r.cnpj_remetente}</td>
          <td>${r.cnpj_destinatario}</td>
          <td>${r.cidade_destino}</td>
          <td>${r.volumes}</td>
          <td>${r.tomador}</td>
          <td>
            <span class="badge ${r.status === "ATIVO" ? "andamento" : "finalizado"}">
              ${r.status}
            </span>
          </td>
        </tr>
      `;
    }
  });
}

/* =========================
   DATA
========================= */
function formatarData(data) {
  if (!data) return "-";
  const d = new Date(data);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/* =========================
   EXPORTAR PDF
========================= */
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("l");
  doc.setFontSize(16);
  doc.text(abaAtual === "rotas" ? "Controle de KM | Frota" : "Coletas | Frota", 14, 15);
  doc.setFontSize(10);
  doc.text(`Exportado em ${new Date().toLocaleString("pt-BR")}`, 14, 22);

  doc.autoTable({
    startY: 30,
    head: [...document.querySelectorAll("#tabela thead tr")].map(tr => [...tr.children].map(th => th.innerText)),
    body: [...document.querySelectorAll("#tabela tbody tr")].map(tr => [...tr.children].map(td => td.innerText)),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [44, 62, 80] }
  });

  doc.save((abaAtual === "rotas" ? "controle_km_frota" : "coletas_frota") + ".pdf");
}

/* =========================
   EXPORTAR CSV
========================= */
function exportarCSV() {
  let csv = [...document.querySelectorAll("#tabela thead tr")].map(tr => [...tr.children].map(th => `"${th.innerText}"`).join(",")).join("\n") + "\n";
  csv += [...document.querySelectorAll("#tabela tbody tr")].map(tr => [...tr.children].map(td => `"${td.innerText}"`).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = (abaAtual === "rotas" ? "controle_km_frota" : "coletas_frota") + ".csv";
  link.click();
}
