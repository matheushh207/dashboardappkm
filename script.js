const API_URL = "https://script.google.com/macros/s/AKfycbwtYMoYHzn5fspPBsRezrUrRqsnl9b-Fq8E5-BvCWpxlnShBzIYXo6W6o5cyoCAg9sEtw/exec";
const TODOS_MOTORISTAS = ["MARIO","JOEL","VILSON","CLAUDIOMAR","BLADEMIR","ALESSANDRO","CARLOS"];

let dadosRotas = [], dadosColetas = [];

async function carregarDados() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    dadosRotas = json.rotas || [];
    dadosColetas = json.coletas || [];
    carregarFiltros();
    renderizarRotas();
    renderizarColetas();
  } catch(e){console.error("Erro ao carregar dados:",e);}
}

carregarDados();

/* =========================
   ABAS
========================= */
function mostrarAba(aba) {
  document.getElementById("rotas").style.display = aba==="rotas"?"block":"none";
  document.getElementById("coletas").style.display = aba==="coletas"?"block":"none";
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.remove("active"));
  document.querySelector(`.tabs button[onclick="mostrarAba('${aba}')"]`).classList.add("active");
}

/* =========================
   FILTROS
========================= */
function carregarFiltros() {
  const selR = document.getElementById("motoristaFiltro");
  const selC = document.getElementById("motoristaFiltroColetas");
  [selR, selC].forEach(sel=>{
    sel.innerHTML=`<option value="TODOS">Todos os motoristas</option>`;
    TODOS_MOTORISTAS.forEach(m=>sel.innerHTML+=`<option value="${m}">${m}</option>`);
  });
  document.getElementById("motoristaFiltro").addEventListener("change", renderizarRotas);
  document.getElementById("statusFiltro").addEventListener("change", renderizarRotas);
  document.getElementById("motoristaFiltroColetas").addEventListener("change", renderizarColetas);
  document.getElementById("statusFiltroColetas").addEventListener("change", renderizarColetas);
}

/* =========================
   RENDER ROTAS
========================= */
function renderizarRotas() {
  const motoristaSel = document.getElementById("motoristaFiltro").value;
  const statusSel = document.getElementById("statusFiltro").value;
  const filtrado = dadosRotas.filter(d=>
    (motoristaSel==="TODOS"||d.motorista===motoristaSel)&&
    (statusSel==="TODOS"||d.status===statusSel)
  );

  let kmTotal=0, rotasAbertas=0, rotasFinalizadas=0;
  const motoristasAtivos=new Set();

  filtrado.forEach(r=>{
    motoristasAtivos.add(r.motorista);
    if(r.status==="EM ANDAMENTO") rotasAbertas++;
    if(r.status==="FINALIZADO"){rotasFinalizadas++; const kmRodado=Number(r.km_final)-Number(r.km_inicial); if(!isNaN(kmRodado)) kmTotal+=kmRodado;}
  });

  document.getElementById("kmTotal").innerText=`${kmTotal.toLocaleString("pt-BR")} KM`;
  document.getElementById("rotasAbertas").innerText=rotasAbertas;
  document.getElementById("rotasFinalizadas").innerText=rotasFinalizadas;
  document.getElementById("motoristasAtivos").innerText=`${motoristasAtivos.size} / ${TODOS_MOTORISTAS.length}`;

  const tbody=document.getElementById("tabelaRotas");
  tbody.innerHTML="";
  filtrado.forEach(r=>{
    tbody.innerHTML+=`<tr>
      <td>${formatarData(r.data_inicio)}</td>
      <td>${formatarData(r.data_fim)}</td>
      <td>${r.motorista}</td>
      <td>${r.placa}</td>
      <td>${r.km_inicial}</td>
      <td>${r.km_final||"-"}</td>
      <td><span class="badge ${r.status==="EM ANDAMENTO"?"andamento":"finalizado"}">${r.status}</span></td>
    </tr>`;
  });
}

/* =========================
   RENDER COLETAS
========================= */
function renderizarColetas() {
  const motoristaSel = document.getElementById("motoristaFiltroColetas").value;
  const statusSel = document.getElementById("statusFiltroColetas").value;
  const filtrado = dadosColetas.filter(d=>
    (motoristaSel==="TODOS"||d.motorista===motoristaSel)&&
    (statusSel==="TODOS"||d.status===statusSel)
  );

  let totalColetas=filtrado.length, volumesTotais=0;
  const motoristasAtivos=new Set();
  filtrado.forEach(r=>{motoristasAtivos.add(r.motorista); volumesTotais+=Number(r.volumes)||0;});

  document.getElementById("totalColetas").innerText=totalColetas;
  document.getElementById("volumesTotais").innerText=volumesTotais;
  document.getElementById("motoristasColetas").innerText=`${motoristasAtivos.size} / ${TODOS_MOTORISTAS.length}`;

  const tbody=document.getElementById("tabelaColetas");
  tbody.innerHTML="";
  filtrado.forEach(r=>{
    tbody.innerHTML+=`<tr>
      <td>${formatarData(r.data)}</td>
      <td>${r.motorista}</td>
      <td>${r.nf}</td>
      <td>${r.cnpj_remetente}</td>
      <td>${r.cnpj_destinatario}</td>
      <td>${r.cidade_destino}</td>
      <td>${r.volumes}</td>
      <td>${r.tomador}</td>
      <td>${r.somar}</td>
      <td>${r.status}</td>
    </tr>`;
  });
}

/* =========================
   FORMATAR DATA
========================= */
function formatarData(data){
  if(!data) return "-";
  const d=new Date(data);
  if(isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR")+" "+d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
}

/* =========================
   EXPORTAR PDF
========================= */
function exportarPDF(aba){
  const { jsPDF }=window.jspdf;
  const doc=new jsPDF("l");
  doc.setFontSize(16);
  doc.text("Controle de KM | Frota",14,15);
  doc.setFontSize(10);
  doc.text(`Exportado em ${new Date().toLocaleString("pt-BR")}`,14,22);

  const tbody=[...document.querySelectorAll(`#${aba==="rotas"?"tabelaRotas":"tabelaColetas"} tr`)].map(tr=>[...tr.children].map(td=>td.innerText));

  const head=aba==="rotas"?["Data Início","Data Final","Motorista","Placa","KM Inicial","KM Final","Status"]:
                           ["Data","Motorista","NF","CNPJ Remetente","CNPJ Destinatário","Cidade","Volumes","Tomador","Somar","Status"];

  doc.autoTable({startY:30,head:[head],body:tbody,styles:{fontSize:9},headStyles:{fillColor:[44,62,80]}});
  doc.save(aba==="rotas"?"controle_km_frota.pdf":"coletas_frota.pdf");
}

/* =========================
   EXPORTAR CSV
========================= */
function exportarCSV(aba){
  let csv="";
  if(aba==="rotas") csv="Data Início,Data Final,Motorista,Placa,KM Inicial,KM Final,Status\n";
  else csv="Data,Motorista,NF,CNPJ Remetente,CNPJ Destinatário,Cidade,Volumes,Tomador,Somar,Status\n";

  document.querySelectorAll(`#${aba==="rotas"?"tabelaRotas":"tabelaColetas"} tr`).forEach(tr=>{
    csv+=[...tr.children].map(td=>`"${td.innerText}"`).join(",")+"\n";
  });

  const blob=new Blob([csv],{type:"text/csv"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download=aba==="rotas"?"controle_km_frota.csv":"coletas_frota.csv";
  link.click();
}
