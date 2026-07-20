(() => {
  'use strict';

  const STORAGE_KEY = 'livro-caixa:lancamentos';

  const CATEGORIAS = {
    entrada: ['Salário', 'Freelance', 'Investimentos', 'Presente', 'Reembolso', 'Outros'],
    saida: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Assinaturas', 'Outros']
  };

  const fmtMoeda = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtData = (iso) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  };
  const hojeISO = () => new Date().toISOString().slice(0, 10);
  const mesRefISO = (iso) => iso.slice(0, 7); // YYYY-MM

  // ---------- State ----------
  let lancamentos = carregar();
  let tipoAtivo = 'entrada';

  function carregar() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Falha ao carregar dados salvos:', e);
      return [];
    }
  }

  function salvar() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lancamentos));
    } catch (e) {
      console.error('Falha ao salvar dados:', e);
      alert('Não foi possível salvar os dados neste navegador.');
    }
  }

  // ---------- Elements ----------
  const els = {
    stamp: document.getElementById('stamp'),
    stampLabel: document.getElementById('stampLabel'),
    stampValue: document.getElementById('stampValue'),
    stampSub: document.getElementById('stampSub'),
    totalEntradas: document.getElementById('totalEntradas'),
    countEntradas: document.getElementById('countEntradas'),
    totalSaidas: document.getElementById('totalSaidas'),
    countSaidas: document.getElementById('countSaidas'),
    totalMes: document.getElementById('totalMes'),
    mesReferencia: document.getElementById('mesReferencia'),
    form: document.getElementById('formLancamento'),
    descricao: document.getElementById('descricao'),
    valor: document.getElementById('valor'),
    data: document.getElementById('data'),
    categoria: document.getElementById('categoria'),
    corpoTabela: document.getElementById('corpoTabela'),
    estadoVazio: document.getElementById('estadoVazio'),
    busca: document.getElementById('busca'),
    filtroMes: document.getElementById('filtroMes'),
    filtroCategoria: document.getElementById('filtroCategoria'),
    filtroTipo: document.getElementById('filtroTipo'),
    chartBars: document.getElementById('chartBars'),
    chartEmpty: document.getElementById('chartEmpty'),
    chartMes: document.getElementById('chartMes'),
    btnExportar: document.getElementById('btnExportar'),
    btnImportar: document.getElementById('btnImportar'),
    inputImportar: document.getElementById('inputImportar'),
    btnLimpar: document.getElementById('btnLimpar'),
  };

  // ---------- Init ----------
  function init() {
    els.data.value = hojeISO();
    document.getElementById('anoAbertura').textContent = new Date().getFullYear();
    preencherCategorias();
    ligarEventos();
    renderTudo();
  }

  function preencherCategorias() {
    els.categoria.innerHTML = CATEGORIAS[tipoAtivo]
      .map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function ligarEventos() {
    document.querySelectorAll('.tipo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tipoAtivo = btn.dataset.tipo;
        document.querySelectorAll('.tipo-btn').forEach(b => b.classList.toggle('active', b === btn));
        preencherCategorias();
      });
    });

    els.form.addEventListener('submit', onSubmit);
    els.busca.addEventListener('input', renderTabela);
    els.filtroMes.addEventListener('change', renderTudo);
    els.filtroCategoria.addEventListener('change', renderTabela);
    els.filtroTipo.addEventListener('change', renderTabela);

    els.btnExportar.addEventListener('click', exportarBackup);
    els.btnImportar.addEventListener('click', () => els.inputImportar.click());
    els.inputImportar.addEventListener('change', importarBackup);
    els.btnLimpar.addEventListener('click', limparTudo);

    els.corpoTabela.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-del');
      if (!btn) return;
      const id = btn.dataset.id;
      if (confirm('Remover este lançamento?')) {
        lancamentos = lancamentos.filter(l => l.id !== id);
        salvar();
        renderTudo();
      }
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    const valorNum = parseFloat(els.valor.value);
    if (!els.descricao.value.trim() || isNaN(valorNum) || valorNum <= 0) return;

    lancamentos.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      tipo: tipoAtivo,
      descricao: els.descricao.value.trim(),
      valor: valorNum,
      data: els.data.value || hojeISO(),
      categoria: els.categoria.value,
    });

    salvar();
    els.form.reset();
    els.data.value = hojeISO();
    els.valor.focus();
    renderTudo();
  }

  // ---------- Render ----------
  function renderTudo() {
    preencherFiltroMes();
    preencherFiltroCategoria();
    renderResumo();
    renderTabela();
    renderGrafico();
  }

  function preencherFiltroMes() {
    const meses = [...new Set(lancamentos.map(l => mesRefISO(l.data)))].sort().reverse();
    const atual = els.filtroMes.value;
    const opcoes = ['<option value="">Todos os meses</option>']
      .concat(meses.map(m => `<option value="${m}">${rotuloMes(m)}</option>`));
    els.filtroMes.innerHTML = opcoes.join('');
    if (meses.includes(atual)) els.filtroMes.value = atual;
  }

  function preencherFiltroCategoria() {
    const cats = [...new Set(lancamentos.map(l => l.categoria))].sort();
    const atual = els.filtroCategoria.value;
    els.filtroCategoria.innerHTML = '<option value="">Todas categorias</option>'
      + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    if (cats.includes(atual)) els.filtroCategoria.value = atual;
  }

  function rotuloMes(m) {
    const [y, mm] = m.split('-');
    const nomes = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${nomes[parseInt(mm,10)-1]}/${y}`;
  }

  function lancamentosDoMesFiltro() {
    const mes = els.filtroMes.value || mesRefISO(hojeISO());
    return lancamentos.filter(l => mesRefISO(l.data) === mes);
  }

  function renderResumo() {
    const doMes = lancamentosDoMesFiltro();
    const entradas = doMes.filter(l => l.tipo === 'entrada');
    const saidas = doMes.filter(l => l.tipo === 'saida');
    const totalEntradas = entradas.reduce((s, l) => s + l.valor, 0);
    const totalSaidas = saidas.reduce((s, l) => s + l.valor, 0);
    const saldoMes = totalEntradas - totalSaidas;
    const saldoGeral = lancamentos.reduce((s, l) => s + (l.tipo === 'entrada' ? l.valor : -l.valor), 0);

    els.totalEntradas.textContent = fmtMoeda(totalEntradas);
    els.countEntradas.textContent = `${entradas.length} lançamento${entradas.length !== 1 ? 's' : ''}`;
    els.totalSaidas.textContent = fmtMoeda(totalSaidas);
    els.countSaidas.textContent = `${saidas.length} lançamento${saidas.length !== 1 ? 's' : ''}`;
    els.totalMes.textContent = fmtMoeda(saldoMes);
    els.mesReferencia.textContent = rotuloMes(els.filtroMes.value || mesRefISO(hojeISO()));

    els.stampValue.textContent = fmtMoeda(saldoGeral);
    const negativo = saldoGeral < 0;
    els.stamp.classList.toggle('negativo', negativo);
    els.stampLabel.textContent = 'SALDO GERAL';
    els.stampSub.textContent = negativo ? 'NO VERMELHO' : 'EM DIA';
  }

  function renderTabela() {
    const busca = els.busca.value.trim().toLowerCase();
    const catFiltro = els.filtroCategoria.value;
    const tipoFiltro = els.filtroTipo.value;
    const mesFiltro = els.filtroMes.value;

    let lista = [...lancamentos];
    if (mesFiltro) lista = lista.filter(l => mesRefISO(l.data) === mesFiltro);
    if (catFiltro) lista = lista.filter(l => l.categoria === catFiltro);
    if (tipoFiltro) lista = lista.filter(l => l.tipo === tipoFiltro);
    if (busca) lista = lista.filter(l => l.descricao.toLowerCase().includes(busca));

    lista.sort((a, b) => b.data.localeCompare(a.data));

    els.corpoTabela.innerHTML = lista.map(l => `
      <tr>
        <td class="col-data">${fmtData(l.data)}</td>
        <td class="col-desc">${escapeHtml(l.descricao)}</td>
        <td class="col-cat"><span class="tag-cat">${escapeHtml(l.categoria)}</span></td>
        <td class="col-valor ${l.tipo === 'entrada' ? 'valor-entrada' : 'valor-saida'}">
          ${l.tipo === 'entrada' ? '+' : '−'} ${fmtMoeda(l.valor)}
        </td>
        <td class="col-acao"><button class="btn-del" data-id="${l.id}" aria-label="Remover lançamento" title="Remover">✕</button></td>
      </tr>
    `).join('');

    els.estadoVazio.style.display = lista.length === 0 ? 'block' : 'none';
  }

  function renderGrafico() {
    const doMes = lancamentosDoMesFiltro().filter(l => l.tipo === 'saida');
    els.chartMes.textContent = `— ${rotuloMes(els.filtroMes.value || mesRefISO(hojeISO()))}`;

    if (doMes.length === 0) {
      els.chartBars.innerHTML = '';
      els.chartEmpty.style.display = 'block';
      return;
    }
    els.chartEmpty.style.display = 'none';

    const porCategoria = {};
    doMes.forEach(l => { porCategoria[l.categoria] = (porCategoria[l.categoria] || 0) + l.valor; });
    const max = Math.max(...Object.values(porCategoria));
    const linhas = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);

    els.chartBars.innerHTML = linhas.map(([cat, val]) => `
      <div class="chart-row">
        <span class="chart-cat">${escapeHtml(cat)}</span>
        <div class="chart-track"><div class="chart-fill" style="width:${(val / max * 100).toFixed(1)}%"></div></div>
        <span class="chart-amount">${fmtMoeda(val)}</span>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ---------- Backup ----------
  function exportarBackup() {
    const blob = new Blob([JSON.stringify(lancamentos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livro-caixa-backup-${hojeISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dados = JSON.parse(reader.result);
        if (!Array.isArray(dados)) throw new Error('Formato inválido');
        if (!confirm(`Importar ${dados.length} lançamento(s)? Isso será somado ao que já existe.`)) return;
        lancamentos = lancamentos.concat(dados);
        salvar();
        renderTudo();
      } catch (err) {
        alert('Não foi possível ler este arquivo de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function limparTudo() {
    if (!confirm('Isso vai apagar TODOS os lançamentos salvos neste navegador. Tem certeza?')) return;
    if (!confirm('Última confirmação: apagar tudo mesmo?')) return;
    lancamentos = [];
    salvar();
    renderTudo();
  }

  init();
})();
