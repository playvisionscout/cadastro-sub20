(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);

  const opt = (obj) => Object.entries(obj).map(([v, t]) => [v, t]);
  const lista = (arr) => arr.map((x) => [x, x]);

  /* req: true = sempre; 'menor' = obrigatório só para menores de 18 anos */
  const ETAPAS = [
    { nome: 'Dados pessoais', campos: [
      { k: 'nome', r: 'Nome completo', req: true, ac: 'name', cls: 'inteiro' },
      { k: 'nome_esportivo', r: 'Nome esportivo', ph: 'Como você é conhecido', cls: 'inteiro' },
      { k: 'nascimento', r: 'Data de nascimento', req: true, tipo: 'date', ac: 'bday' },
      { k: 'naturalidade', r: 'Naturalidade (cidade/UF)', ph: 'Ex.: Campinas/SP' },
      { k: 'cpf', r: 'CPF', req: true, mask: 'cpf', im: 'numeric', ph: '000.000.000-00' },
      { k: 'rg', r: 'RG' },
      { k: 'escola', r: 'Escola' },
      { k: 'serie', r: 'Série atual', ph: 'Ex.: 2º ano EM' },
      { k: 'cep', r: 'CEP', mask: 'cep', im: 'numeric', ac: 'postal-code', ph: '00000-000', dica: 'O endereço é preenchido automaticamente.' },
      { k: 'endereco', r: 'Endereço (rua/avenida)', ac: 'address-line1', cls: 'inteiro' },
      { k: 'numero', r: 'Número', im: 'text' },
      { k: 'complemento', r: 'Complemento' },
      { k: 'bairro', r: 'Bairro' },
      { k: 'cidade', r: 'Cidade', ac: 'address-level2' },
      { k: 'uf', r: 'UF', tipo: 'select', opts: () => lista(V.UFS), vazio: 'Selecione' },
      { k: 'telefone', r: 'Telefone/WhatsApp', req: true, mask: 'tel', tipo: 'tel', ac: 'tel', ph: '(00) 00000-0000' },
      { k: 'email', r: 'E-mail', tipo: 'email', ac: 'email', cls: 'inteiro' },
      { k: 'instagram', r: 'Instagram', ph: '@usuario', cls: 'inteiro' },
    ] },
    { nome: 'Responsável e contatos', campos: [
      { k: 'nome_pai', r: 'Nome do pai', ac: 'off', cls: 'inteiro' },
      { k: 'nome_mae', r: 'Nome da mãe', ac: 'off', cls: 'inteiro' },
      { k: 'resp_nome', r: 'Responsável legal (nome)', req: 'menor', cls: 'inteiro' },
      { k: 'resp_parentesco', r: 'Parentesco', req: 'menor', tipo: 'select', opts: () => lista(V.PARENTESCOS), vazio: 'Selecione' },
      { k: 'resp_cpf', r: 'CPF do responsável', req: 'menor', mask: 'cpf', im: 'numeric', ph: '000.000.000-00' },
      { k: 'resp_telefone', r: 'Telefone/WhatsApp do responsável', req: 'menor', mask: 'tel', tipo: 'tel', ph: '(00) 00000-0000', cls: 'inteiro' },
      { k: 'emerg_nome', r: 'Contato de emergência (nome)', req: true, cls: 'inteiro' },
      { k: 'emerg_telefone', r: 'Telefone do contato de emergência', req: true, mask: 'tel', tipo: 'tel', ph: '(00) 00000-0000', cls: 'inteiro' },
    ] },
    { nome: 'Dados esportivos', campos: [
      { k: 'posicao', r: 'Posição principal', req: true, tipo: 'select', opts: () => opt(V.POSICOES), vazio: 'Selecione' },
      { k: 'posicao2', r: 'Posição secundária', tipo: 'select', opts: () => opt(V.POSICOES), vazio: 'Nenhuma' },
      { k: 'pe', r: 'Pé dominante', tipo: 'select', opts: () => opt(V.PES), vazio: 'Selecione' },
      { k: 'altura', r: 'Altura (cm)', tipo: 'number', im: 'numeric', ph: 'Ex.: 175' },
      { k: 'peso', r: 'Peso (kg)', im: 'decimal', ph: 'Ex.: 68,5' },
      { k: 'camisa_num', r: 'Nº da camisa preferido', tipo: 'number', im: 'numeric', ph: '1 a 99' },
      { k: 'tam_camisa', r: 'Tamanho da camisa', tipo: 'select', opts: () => lista(V.TAM_ROUPA), vazio: 'Selecione' },
      { k: 'tam_short', r: 'Tamanho do short', tipo: 'select', opts: () => lista(V.TAM_ROUPA), vazio: 'Selecione' },
      { k: 'tam_meia', r: 'Tamanho da meia', tipo: 'select', opts: () => lista(V.TAM_MEIA), vazio: 'Selecione' },
      { k: 'chuteira', r: 'Tamanho da chuteira', tipo: 'number', im: 'numeric', ph: 'Ex.: 41' },
      { k: 'clube_anterior', r: 'Clube anterior' },
      { k: 'categoria_anterior', r: 'Categoria anterior', ph: 'Ex.: Sub-17' },
      { k: 'registro_federacao', r: 'Registro na federação', cls: 'inteiro' },
    ] },
  ];
  const ETAPA_DO_CAMPO = {};
  ETAPAS.forEach((e, i) => e.campos.forEach((c) => { ETAPA_DO_CAMPO[c.k] = i; }));
  ETAPA_DO_CAMPO.consentimento = 2;

  /* ---------- Máscaras ---------- */
  const MASCARAS = {
    cpf: (d) => d.slice(0, 11).replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2'),
    cep: (d) => d.slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2'),
    tel: (d) => {
      d = d.slice(0, 11);
      if (d.length <= 2) return d ? '(' + d : '';
      if (d.length <= 6) return d.replace(/^(\d{2})(\d+)/, '($1) $2');
      if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
      return d.replace(/^(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
    },
  };

  /* ---------- Montagem do formulário ---------- */
  const form = $('#ficha');
  const campoEl = {};

  function criarCampo(c) {
    const wrap = document.createElement('div');
    wrap.className = 'campo ' + (c.cls || '');
    wrap.dataset.campo = c.k;
    const label = document.createElement('label');
    label.htmlFor = c.k;
    label.append(c.r);
    if (c.req) {
      const s = document.createElement('span');
      s.className = 'req'; s.textContent = '*'; s.setAttribute('aria-hidden', 'true');
      if (c.req === 'menor') s.dataset.menor = '1';
      label.append(s);
    }
    wrap.append(label);
    let inp;
    if (c.tipo === 'select') {
      inp = document.createElement('select');
      const v = document.createElement('option');
      v.value = ''; v.textContent = c.vazio || 'Selecione';
      inp.append(v);
      for (const [val, txt] of c.opts()) { const o = document.createElement('option'); o.value = val; o.textContent = txt; inp.append(o); }
    } else {
      inp = document.createElement('input');
      inp.type = c.tipo || 'text';
      if (c.ph) inp.placeholder = c.ph;
      if (c.im) inp.inputMode = c.im;
      if (inp.type === 'number') { inp.step = c.k === 'peso' ? '0.1' : '1'; inp.min = '0'; }
      if (inp.type === 'date') inp.max = new Date().toISOString().slice(0, 10);
      inp.maxLength = c.mask ? 16 : 120;
    }
    inp.id = inp.name = c.k;
    if (c.ac) inp.autocomplete = c.ac;
    if (c.mask) inp.addEventListener('input', () => { inp.value = MASCARAS[c.mask](V.digits(inp.value)); });
    inp.addEventListener('input', () => limparErro(c.k));
    inp.addEventListener('change', () => limparErro(c.k));
    wrap.append(inp);
    if (c.dica) { const d = document.createElement('small'); d.className = 'dica'; d.id = c.k + '-dica'; d.textContent = c.dica; wrap.append(d); }
    const err = document.createElement('p');
    err.className = 'erro-msg'; err.id = c.k + '-erro'; err.hidden = true;
    wrap.append(err);
    campoEl[c.k] = wrap;
    return wrap;
  }

  ETAPAS.forEach((e, i) => {
    const sec = document.createElement('section');
    sec.className = 'cartao etapa'; sec.dataset.etapa = i; sec.hidden = i !== 0;
    const h = document.createElement('h2'); h.textContent = e.nome; sec.append(h);
    if (i === 1) {
      const p = document.createElement('p');
      p.id = 'nota-menor'; p.className = 'sub';
      p.textContent = 'Informe os dados do responsável legal.';
      sec.append(p);
    }
    const g = document.createElement('div'); g.className = 'grade';
    e.campos.forEach((c) => g.append(criarCampo(c)));
    sec.append(g);
    if (i === 2) {
      const cons = document.createElement('div');
      cons.className = 'campo'; cons.dataset.campo = 'consentimento';
      cons.innerHTML = '<div class="consent"><input type="checkbox" id="consentimento" name="consentimento"><label for="consentimento">Autorizo o uso destes dados para fins de cadastro no clube. <a href="#privacidade" id="link-priv">Política de privacidade</a></label></div><p class="erro-msg" id="consentimento-erro" hidden></p>';
      cons.querySelector('input').addEventListener('change', () => limparErro('consentimento'));
      campoEl.consentimento = cons;
      sec.append(cons);
    }
    form.append(sec);
  });

  /* ---------- Erros ---------- */
  function mostrarErro(k, msg) {
    const w = campoEl[k]; if (!w) return false;
    const p = $('#' + k + '-erro', w); const inp = $('#' + k, w);
    p.textContent = msg; p.hidden = false;
    w.classList.add('invalido');
    if (inp) { inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', k + '-erro'); }
    return true;
  }
  function limparErro(k) {
    const w = campoEl[k]; if (!w) return;
    const p = $('#' + k + '-erro', w); if (p) p.hidden = true;
    w.classList.remove('invalido');
    const inp = $('#' + k, w); if (inp) { inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); }
  }
  function banner(msg) { const b = $('#banner'); b.textContent = msg || ''; b.hidden = !msg; if (msg) b.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

  /* ---------- Dados ---------- */
  function coletar() {
    const raw = {};
    for (const k of V.CAMPOS) {
      const el = document.getElementById(k);
      if (el) raw[k] = el.type === 'checkbox' ? el.checked : el.value;
    }
    return V.normalizar(raw);
  }
  const ehMenor = () => { const a = V.idade(coletar().nascimento); return a !== null && a < 18 && V.parseData(coletar().nascimento) !== null; };

  function atualizarMenor() {
    const d = coletar();
    const valida = V.parseData(d.nascimento);
    const menor = valida && V.idade(d.nascimento) < 18;
    document.querySelectorAll('[data-menor]').forEach((s) => { s.hidden = !menor; });
    $('#nota-menor').textContent = menor
      ? 'Você tem menos de 18 anos: os dados do responsável legal são obrigatórios.'
      : 'Como você tem 18 anos ou mais, os dados do responsável legal são opcionais.';
  }
  $('#nascimento').addEventListener('input', atualizarMenor);
  $('#nascimento').addEventListener('change', atualizarMenor);
  atualizarMenor();

  /* ---------- CEP (ViaCEP) ---------- */
  let ultimoCep = '';
  $('#cep').addEventListener('input', async () => {
    const cep = V.digits($('#cep').value);
    const dica = $('#cep-dica');
    if (cep.length !== 8) { ultimoCep = ''; return; }
    if (cep === ultimoCep) return;
    ultimoCep = cep;
    dica.textContent = 'Buscando endereço…';
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      if (j.erro) { dica.textContent = 'CEP não encontrado. Preencha o endereço manualmente.'; return; }
      const set = (k, v) => { if (v) { document.getElementById(k).value = v; limparErro(k); } };
      set('endereco', j.logradouro); set('bairro', j.bairro); set('cidade', j.localidade); set('uf', j.uf);
      dica.textContent = 'Endereço preenchido. Confira e informe o número.';
      $('#numero').focus();
    } catch {
      dica.textContent = 'Não foi possível buscar o CEP. Preencha o endereço manualmente.';
    }
  });

  /* ---------- Navegação entre etapas ---------- */
  let etapa = 0;
  const btnVoltar = $('#btn-voltar'), btnAvancar = $('#btn-avancar');

  function irPara(n) {
    etapa = n;
    document.querySelectorAll('.etapa').forEach((s) => { s.hidden = Number(s.dataset.etapa) !== n; });
    $('#etapa-titulo').textContent = `Etapa ${n + 1} de 3`;
    $('#etapa-nome').textContent = ETAPAS[n].nome;
    $('#barra-fill').style.width = ((n + 1) / 3 * 100) + '%';
    $('#barra').setAttribute('aria-valuenow', n + 1);
    btnVoltar.hidden = n === 0;
    btnAvancar.textContent = n === 2 ? 'Enviar cadastro' : 'Continuar';
    banner('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validarEtapas(etapas) {
    const erros = V.validar(coletar());
    let primeiro = null;
    for (const [k, msg] of Object.entries(erros)) {
      if (!etapas.includes(ETAPA_DO_CAMPO[k])) continue;
      mostrarErro(k, msg);
      if (!primeiro) primeiro = k;
    }
    return { erros, primeiro };
  }
  function focar(k) {
    const el = document.getElementById(k);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
  }

  function mostrar(tela) {
    for (const t of ['form', 'envio', 'ok', 'priv']) $('#tela-' + t).hidden = t !== tela;
    $('#nav').hidden = tela !== 'form';
    window.scrollTo({ top: 0 });
  }

  function montarMensagem(d) {
    const anos = V.idade(d.nascimento);
    const resp = d.resp_nome ? `${d.resp_nome}${d.resp_parentesco ? ' - ' + d.resp_parentesco : ''} (tel ${V.fmt('tel', d.resp_telefone) || '—'})` : '—';
    const linhas = [
      '*Novo cadastro Sub-20*',
      `Nome: ${d.nome}`,
      `Nascimento: ${V.fmt('data', d.nascimento)}${anos != null ? ' (' + anos + ' anos)' : ''}`,
      `Posição: ${V.fmt('posicao', d.posicao)}`,
      `Telefone: ${V.fmt('tel', d.telefone)}`,
      `Responsável: ${resp}`,
    ];
    const jaMostrados = new Set(['nome', 'nascimento', 'posicao', 'telefone']);
    for (const g of V.GRUPOS) {
      const itens = [];
      for (const [k, rotulo, tipo] of g.campos) {
        if (jaMostrados.has(k) || d[k] === '' || d[k] == null) continue;
        itens.push(`${rotulo}: ${String(V.fmt(tipo, d[k])).replace('.', k === 'peso' ? ',' : '.')}`);
      }
      if (itens.length) linhas.push('', `*${g.titulo}*`, ...itens);
    }
    linhas.push('', 'Autorizou o uso dos dados para cadastro no clube: sim');
    return linhas.join('\n');
  }

  function enviar() {
    banner('');
    for (const k of Object.keys(campoEl)) limparErro(k);
    const { erros } = validarEtapas([0, 1, 2]);
    const chaves = Object.keys(erros).filter((k) => k in ETAPA_DO_CAMPO);
    if (chaves.length) {
      const menorEtapa = Math.min(...chaves.map((k) => ETAPA_DO_CAMPO[k]));
      const primeiro = chaves.find((k) => ETAPA_DO_CAMPO[k] === menorEtapa);
      if (menorEtapa !== etapa) irPara(menorEtapa);
      banner('Corrija os campos destacados para enviar.');
      setTimeout(() => focar(primeiro), 50);
      return;
    }
    const msg = montarMensagem(coletar());
    let num = V.digits((window.CONFIG || {}).NUMERO_TECNICO || '');
    if (num.length === 10 || num.length === 11) num = '55' + num;
    $('#btn-whatsapp').href = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
    $('#previa').textContent = msg;
    mostrar('envio');
  }

  function avancar() {
    if (btnAvancar.disabled) return;
    if (etapa === 2) return enviar();
    for (const c of ETAPAS[etapa].campos) limparErro(c.k);
    const { primeiro } = validarEtapas([etapa]);
    if (primeiro) { banner('Corrija os campos destacados para continuar.'); focar(primeiro); return; }
    irPara(etapa + 1);
  }

  btnAvancar.addEventListener('click', avancar);
  btnVoltar.addEventListener('click', () => irPara(etapa - 1));
  form.addEventListener('submit', (e) => { e.preventDefault(); avancar(); });

  irPara(0);

  $('#link-priv').addEventListener('click', (e) => { e.preventDefault(); mostrar('priv'); });
  $('#btn-priv-voltar').addEventListener('click', () => mostrar('form'));
  $('#btn-corrigir').addEventListener('click', () => mostrar('form'));
  $('#btn-ja-enviei').addEventListener('click', () => mostrar('ok'));
  $('#btn-copiar').addEventListener('click', async () => {
    const aviso = $('#copiado');
    try { await navigator.clipboard.writeText($('#previa').textContent); aviso.textContent = 'Mensagem copiada.'; }
    catch { aviso.textContent = 'Não foi possível copiar. Selecione o texto acima e copie manualmente.'; }
  });

})();
