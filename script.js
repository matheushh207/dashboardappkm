const API_URL = "https://script.google.com/macros/s/AKfycbwtYMoYHzn5fspPBsRezrUrRqsnl9b-Fq8E5-BvCWpxlnShBzIYXo6W6o5cyoCAg9sEtw/exec";

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

let dados = [];

// BUSCA DADOS DA API
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

/* 🔹 FILTRO DE DATA (ADICIONADO) */
document.getElementById("dataFiltro").addEventListener("change", renderizar);

function carregarFiltros() {
  const select = document.getElementById("motoristaFiltro");
  select.innerHTML = `<option value="TODOS">Todos os motoristas</option>`;

  TODOS_MOTORISTAS.forEach(m => {
    select.innerHTML += `<option value="${m}">${m}</option>`;
  });
}

function renderizar() {
  const motoristaSel = document.getElementById("motoristaFiltro").value;
  const statusSel = document.getElementById("statusFiltro").value;
  const dataSel = document.getElementById("dataFiltro").value; // yyyy-mm-dd

  let filtrado = dados.filter(d => {

    const matchMotorista =
      motoristaSel === "TODOS" || d.motorista === motoristaSel;

    const matchStatus =
      statusSel === "TODOS" || d.status === statusSel;

    let matchData = true;
    if (dataSel) {
      const dataRegistro = d.data_inicio
        ? new Date(d.data_inicio).toISOString().split("T")[0]
        : null;

      matchData = dataRegistro === dataSel;
    }

    return matchMotorista && matchStatus && matchData;
  });

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
      kmTotal += (Number(r.km_final) - Number(r.km_inicial));
    }
  });

  document.getElementById("kmTotal").innerText = `${kmTotal} KM`;
  document.getElementById("rotasAbertas").innerText = abertas;
  document.getElementById("rotasFinalizadas").innerText = finalizadas;
  document.getElementById("motoristasAtivos").innerText =
    `${motoristasAtivos.size} / ${TODOS_MOTORISTAS.length}`;

  const tbody = document.getElementById("tabela");
  tbody.innerHTML = "";

  filtrado.forEach(r => {
    tbody.innerHTML += `
      <tr>
        <td>${r.data_inicio ? formatarData(r.data_inicio) : "-"}</td>
        <td>${r.data_fim ? formatarData(r.data_fim) : "-"}</td>
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

function formatarData(data) {
  if (!data) return "-";
  try {
    return new Date(data).toLocaleString("pt-BR");
  } catch (e) {
    return data;
  }
}

/* EXPORTAÇÕES */
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4');

  doc.setFontSize(16);
  doc.text("Controle de KM | Frota", 14, 15);
  doc.setFontSize(10);
  doc.text(`Exportado em ${new Date().toLocaleString("pt-BR")}`, 14, 22);

  doc.autoTable({
    startY: 30,
    head: [["Início", "Finalização", "Motorista", "Placa", "KM Inicial", "KM Final", "Status"]],
    body: [...document.querySelectorAll("#tabela tr")].map(tr =>
      [...tr.children].map(td => td.innerText)
    ),
    theme: 'grid',
    headStyles: { fillColor: [27, 58, 87] }
  });

  doc.save("controle_km_frota.pdf");
}

function exportarCSV() {
  let csv = "\uFEFFData Inicio,Data Finalizacao,Motorista,Placa,KM Inicial,KM Final,Status\n";
  document.querySelectorAll("#tabela tr").forEach(tr => {
    csv += [...tr.children].map(td => `"${td.innerText}"`).join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "controle_km_frota.csv";
  link.click();
}
