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
  document.getElementById("rotasFinalizadas").innerText=rotasFinalizadas
