const API_URL = "https://script.google.com/macros/s/AKfycbwtYMoYHzn5fspPBsRezrUrRqsnl9b-Fq8E5-BvCWpxlnShBzIYXo6W6o5cyoCAg9sEtw/exec";

/* LISTA FIXA DE MOTORISTAS (ABA MOTORISTAS) */
const TODOS_MOTORISTAS = [
  "MARIO",
  "JOEL",
  "VILSON",
  "CLAUDIOMAR",
  "BLADEMIR",
  "ALESSANDRO",
  "CARLOS"
];

let dados = [];

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
   RENDERIZA DASHBOARD
========================= */
function renderizar() {
  const motoristaSel = document.getElementById("motoristaFiltro").value;
  const statusSel = document.getElementById("statusFiltro").value;

  const filtrado = dados.filter(d =>
    (motoristaSel === "TODOS" || d.motorista === motoristaSel) &&
    (statusSel === "TODOS" || d.status === statusSel)
  );

  let kmTotal = 0;
  let abertas = 0;
  let finalizadas = 0;
  const motoristasAtivos = new Set();

  dados.forEach(r => {
    if (r.status === "EM ANDAMENTO") {
      abertas++;
      motoristasAtivos.add(r.motorista);
    }

    if (r.status === "FINALIZADO") {
      finalizadas++;
      const kmRodado = Number(r.km_final) - Number(r.km_inicial);
      if (!isNaN(kmRodado)) kmTotal += kmRodado;
    }
  });

  document.getElementById("kmTotal").innerText =
    `${kmTotal.toLocaleString("pt-BR")} KM`;

  document.getElementById("rotasAbertas").innerText = abertas;
  document.getElementById("rotasFinalizadas").innerText = finalizadas;

  document.getElementById("motoristasAtivos").innerText =
    `${motoristasAtivos.size} / ${TODOS_MOTORISTAS.length}`;

  renderizarTabela(filtrado);
}

/* =========================
   TABELA
========================= */
function renderizarTabela(registros) {
  const tbody = document.getElementById("tabela");
  tbody.innerHTML = "";

  registros.forEach(r => {
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
  });
}

/* =========================
   DATA (CORREÇÃO DEFINITIVA)
========================= */
function formatarData(data) {
  if (!data) return "-";

  const d = new Date(data);

  if (isNaN(d.getTime())) return "-";

  return (
    d.toLocaleDateString("pt-BR") +
    " " +
    d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  );
}

/* =========================
   EXPORTAR PDF
========================= */
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("l");

  doc.setFontSize(16);
  doc.text("Controle de KM | Frota", 14, 15);

  doc.setFontSize(10);
  doc.text(`Exportado em ${new Date().toLocaleString("pt-BR")}`, 14, 22);

  doc.autoTable({
    startY: 30,
    head: [[
      "Data Início",
      "Data Final",
      "Motorista",
      "Placa",
      "KM Inicial",
      "KM Final",
      "Status"
    ]],
    body: [...document.querySelectorAll("#tabela tr")].map(tr =>
      [...tr.children].map(td => td.innerText)
    ),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [44, 62, 80] }
  });

  doc.save("controle_km_frota.pdf");
}

/* =========================
   EXPORTAR CSV
========================= */
function exportarCSV() {
  let csv = "Data Início,Data Final,Motorista,Placa,KM Inicial,KM Final,Status\n";

  document.querySelectorAll("#tabela tr").forEach(tr => {
    csv += [...tr.children].map(td => `"${td.innerText}"`).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "controle_km_frota.csv";
  link.click();
}
