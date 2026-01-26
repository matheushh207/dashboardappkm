<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Controle de KM | Frota</title>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js"></script>

<style>
/* MESMO CSS DO SEU DASHBOARD + ABAÇÃO */
body {margin:0; font-family:"Segoe UI",Arial,sans-serif; background:#f4f6f8; padding:24px;}
.header {background:linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)),url("header-frota.jpg") center/cover no-repeat; color:#fff; padding:28px; border-radius:16px; margin-bottom:24px;}
.header h1{margin:0;font-size:26px;}
.header p{margin-top:6px;opacity:.85;}
.tabs{display:flex;gap:8px;margin-bottom:16px;}
.tabs button{padding:10px 14px;border:none;border-radius:8px;cursor:pointer;background:#2c3e50;color:#fff;}
.tabs button.active{background:#34495e;}
.controls{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;}
select, button{padding:10px 14px;border-radius:8px;border:none;font-size:14px;}
select{background:#fff;}
button{background:#2c3e50;color:#fff;cursor:pointer;}
button i{margin-right:6px;}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px;}
.card{background:#fff;padding:18px;border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,.08);}
.card span{display:block;color:#777;font-size:13px;}
.card strong{font-size:22px;margin-top:6px;display:block;}
.table-box{background:#fff;border-radius:14px;box-shadow:0 4px 12px rgba(0,0,0,.08);padding:16px;overflow-x:auto;}
table{width:100%;border-collapse:collapse;}
th{background:#2c3e50;color:#fff;padding:12px;font-size:13px;white-space:nowrap;}
td{padding:12px;text-align:center;border-bottom:1px solid #eee;font-size:13px;white-space:nowrap;}
.badge{padding:6px 12px;border-radius:12px;font-size:12px;font-weight:600;color:#fff;display:inline-block;}
.andamento{background:#f39c12;}
.finalizado{background:#27ae60;}
</style>
</head>
<body>

<div class="header">
<h1><i class="fa-solid fa-truck"></i> Controle de KM | Frota</h1>
<p>Gestão de frota e controle de rotas e coletas</p>
</div>

<!-- ABAS -->
<div class="tabs">
<button class="active" onclick="mostrarAba('rotas')">Rotas</button>
<button onclick="mostrarAba('coletas')">Coletas</button>
</div>

<!-- CONTEÚDO ROTAS -->
<div id="rotas" class="aba">
  <div class="controls">
    <select id="motoristaFiltro">
      <option value="TODOS">Todos os motoristas</option>
    </select>
    <select id="statusFiltro">
      <option value="TODOS">Todos os status</option>
      <option value="EM ANDAMENTO">Em andamento</option>
      <option value="FINALIZADO">Finalizado</option>
    </select>
    <button onclick="exportarPDF('rotas')"><i class="fa-solid fa-file-pdf"></i> Exportar PDF</button>
    <button onclick="exportarCSV('rotas')"><i class="fa-solid fa-file-csv"></i> Exportar CSV</button>
  </div>

  <div class="cards">
    <div class="card"><span>KM Total Rodado</span><strong id="kmTotal">0 KM</strong></div>
    <div class="card"><span>Rotas Abertas</span><strong id="rotasAbertas">0</strong></div>
    <div class="card"><span>Rotas Finalizadas</span><strong id="rotasFinalizadas">0</strong></div>
    <div class="card"><span>Motoristas em Operação</span><strong id="motoristasAtivos">0 / 0</strong></div>
  </div>

  <div class="table-box">
    <table>
      <thead>
        <tr>
          <th>Data Início</th>
          <th>Data Finalização</th>
          <th>Motorista</th>
          <th>Placa</th>
          <th>KM Inicial</th>
          <th>KM Final</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="tabelaRotas"></tbody>
    </table>
  </div>
</div>

<!-- CONTEÚDO COLETAS -->
<div id="coletas" class="aba" style="display:none;">
  <div class="controls">
    <select id="motoristaFiltroColetas">
      <option value="TODOS">Todos os motoristas</option>
    </select>
    <select id="statusFiltroColetas">
      <option value="TODOS">Todos os status</option>
      <option value="ATIVO">Ativo</option>
      <option value="AGRUPADO">Agrupado</option>
    </select>
    <button onclick="exportarPDF('coletas')"><i class="fa-solid fa-file-pdf"></i> Exportar PDF</button>
    <button onclick="exportarCSV('coletas')"><i class="fa-solid fa-file-csv"></i> Exportar CSV</button>
  </div>

  <div class="cards">
    <div class="card"><span>Total Coletas</span><strong id="totalColetas">0</strong></div>
    <div class="card"><span>Volumes Totais</span><strong id="volumesTotais">0</strong></div>
    <div class="card"><span>Motoristas Ativos</span><strong id="motoristasColetas">0 / 0</strong></div>
  </div>

  <div class="table-box">
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Motorista</th>
          <th>NF</th>
          <th>CNPJ Remetente</th>
          <th>CNPJ Destinatário</th>
          <th>Cidade</th>
          <th>Volumes</th>
          <th>Tomador</th>
          <th>Somar</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody id="tabelaColetas"></tbody>
    </table>
  </div>
</div>

<script src="dashboard.js"></script>
</body>
</html>
