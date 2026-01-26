const API_URL = "https://script.google.com/macros/s/AKfycbwtYMoYHzn5fspPBsRezrUrRqsnl9b-Fq8E5-BvCWpxlnShBzIYXo6W6o5cyoCAg9sEtw/exec";

/* LISTA FIXA DE MOTORISTAS */
const TODOS_MOTORISTAS = ["MARIO","JOEL","VILSON","CLAUDIOMAR","BLADEMIR","ALESSANDRO","CARLOS"];

let dadosRotas = [];
let dadosColetas = [];

const tabs = document.querySelectorAll(".tab");
const filtrosRotas = document.getElementById("filtrosRotas");
const filtrosColetas = document.getElementById("filtrosColetas");
const cardsRotas = document.getElementById("cardsRotas");
const cardsColetas = document.getElementById("cardsColetas");
const tabelaRotas = document.getElementById("tabela");
const tabelaColetasBody = document.getElementById("tabelaColetasBody");

/* =========================
   TAB NAV
========================= */
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    if(tab.dataset.tab === "rotas") {
      tabelaRotas.parentElement.classList.remove("hidden");
      tabelaColetasBody.parentElement.classList.add("hidden");
      filtrosRotas.classList.remove("hidden");
      filtrosColetas.classList.add("hidden");
      cardsRotas.classList.remove("hidden");
      cardsColetas.classList.add("hidden");
    } else {
      tabelaRotas.parentElement.classList.add("hidden");
      tabelaColetasBody.parentElement.classList.remove("hidden");
      filtrosRotas.classList.add("hidden");
      filtrosColetas.classList.remove("hidden");
      cardsRotas.classList.add("hidden");
      cardsColetas.classList.remove("hidden");
    }
  });
});

/* =========================
   CARREGA DADOS DA API
========================= */
fetch(API_URL)
  .then(res => res.json())
  .then(json => {
    dadosRotas = json.rotas || [];
    dadosColetas = json.coletas || [];

    carregarFiltros();
    carregarFiltrosColetas();
    renderizar();
    renderizarColetas();
  })
  .catch(err => console.error("Erro ao carregar dados:", err));

/* =========================
   FILTROS ROTAS
========================= */
function carregarFiltros() {
  const select = document.getElementById("motoristaFiltro");
  select.innerHTML = `<option value="TODOS">Todos os motoristas</option>`;
  TODOS_MOTORISTAS.forEach(m => select.innerHTML += `<option value="${m}">${m}</option>`);

  document.getElementById("motoristaFiltro").addEventListener("change", renderizar);
  document.getElementById("statusFiltro").addEventListener("change", renderizar);
}

/* =========================
   FILTROS COLETAS
========================= */
function carregarFiltrosColetas() {
  const select = document.getElementById("motoristaColetaFiltro");
  select.innerHTML = `<option value="TODOS">Todos os motoristas</option>`;
  TODOS_MOTORISTAS.forEach(m => select.innerHTML += `<option value="${m}">${m}</option>`);

  document.getElementById("motoristaColetaFiltro").addEventListener("change", renderizarColetas);
  document.getElementById("statusColetaFiltro").addEventListener("change", renderizarColetas);
}

/* =========================
   RENDERIZA ROTAS
========================= */
function renderizar() {
  const motoristaSel = document.getElementById("motoristaFiltro").value;
  const statusSel = document.getElementById("statusFiltro").value;

  const filtrado = dadosRotas.filter(d =>
    (motoristaSel === "TODOS" || d.motorista === motoristaSel) &&
    (statusSel === "TODOS" || d.status === statusSel)
  );

  let kmTotal = 0, rotasAbertas = 0, rotasFinalizadas = 0;
  const motoristasAtivos = new Set();

  filtrado.forEach(r => {
    motoristasAtivos.add(r.motorista);
    if(r.status === "EM ANDAMENTO") rotasAbertas++;
    if(r.status === "FINALIZADO") {
      rotasFinalizadas++;
      const kmRodado = Number(r.km_final) - Number(r.km_inicial);
      if(!isNaN(kmRodado)) kmTotal += kmRodado;
    }
  });

  document.getElementById("kmTotal").innerText = `${kmTotal.toLocaleString("pt-BR")} KM`;
  document.getElementById("rotasAbertas").innerText = rotasAbertas;
  document.getElementById("rotasFinalizadas").innerText = rotasFinalizadas;
  document.getElementById("motoristasAtivos").innerText = `${motoristasAtivos.size} / ${TODOS_MOTORISTAS.length}`;

  tabelaRotas.innerHTML = "";
  filtrado.forEach(r => {
    tabelaRotas.innerHTML += `
      <tr>
        <td>${formatarData(r.data_inicio)}</td>
        <td>${formatarData(r.data_fim)}</td>
        <td>${r.motorista}</td>
        <td>${r.placa}</td>
        <td>${r.km_inicial}</td>
        <td>${r.km_final || "-"}</td>
        <td><span class="badge ${r.status === "EM ANDAMENTO" ? "andamento" : "finalizado"}">${r.status}</span></td>
      </tr>
    `;
  });
}

/* =========================
   RENDERIZA COLETAS
========================= */
function renderizarColetas() {
  const motoristaSel = document.getElementById("motoristaColetaFiltro").value;
  const statusSel = document.getElementById("statusColetaFiltro").value;

  const filtrado = dadosColetas.filter(d =>
    (motoristaSel === "TODOS" || d.motorista === motoristaSel) &&
    (statusSel === "TODOS" || d.status === statusSel)
  );

  let totalVolumes = 0;
  filtrado.forEach(r => totalVolumes += Number(r.volumes));

  document.getElementById("totalColetas").innerText = filtrado.length;
  document.getElementById("totalVolumes").innerText = totalVolumes;

  tabelaColetasBody.innerHTML = "";
  filtrado.forEach(r => {
    tabelaColetasBody.innerHTML += `
      <tr>
        <td>${formatarData(r.data)}</td>
        <td>${r.motorista}</td>
        <td>${r.nf}</td>
        <td>${r.cnpj_remetente}</td>
        <td>${r.cnpj_destinatario}</td>
        <td>${r.cidade_destino}</td>
        <td>${r.volumes}</td>
        <td>${r.tomador}</td>
        <td>${r.somar}</td>
        <td><span class="badge ${r.status.toLowerCase() === "ativo" ? "ativo" : "agrupado"}">${r.status}</span></td>
      </tr>
    `;
  });
}

/* =========================
   FORMATA DATA
========================= */
function formatarData(data) {
  if(!data) return "-";
  const d = new Date(data);
  if(isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
}

/* =========================
   EXPORTAR PDF
========================= */
function exportarPDF(tipo="rotas") {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("l");

  doc.setFontSize(16);
  doc.text(tipo === "rotas" ? "Controle de KM | Frota" : "Controle de Coletas | Frota", 14, 15);
  doc.setFontSize(10);
  doc.text(`Exportado em ${new Date().toLocaleString("pt-BR")}`, 14, 22);

  const body = [...document.querySelectorAll(tipo==="rotas"?"#tabela tr":"#tabelaColetasBody tr")].map(tr => [...tr.children].map(td=>td.innerText));

  doc.autoTable({
    startY: 30,
    head: [ [...document.querySelectorAll(tipo==="rotas"?"#tabela thead th":"#tabelaColetas thead th")].map(th=>th.innerText) ],
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [44,62,80] }
  });

  doc.save(tipo==="rotas"?"controle_km_frota.pdf":"controle_coletas_frota.pdf");
}

/* =========================
   EXPORTAR CSV
========================= */
function exportarCSV(tipo="rotas") {
  let csv = [...document.querySelectorAll(tipo==="rotas"?"#tabela thead th":"#tabelaColetas thead th")].map(th=>`"${th.innerText}"`).join(",") + "\n";

  [...document.querySelectorAll(tipo==="rotas"?"#tabela tr":"#tabelaColetasBody tr")].forEach(tr=>{
    csv += [...tr.children].map(td=>`"${td.innerText}"`).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = tipo==="rotas"?"controle_km_frota.csv":"controle_coletas_frota.csv";
  link.click();
}
