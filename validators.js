/* Regras compartilhadas entre navegador e servidor (UMD). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.V = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const POSICOES = {
    goleiro: 'Goleiro', zagueiro: 'Zagueiro', lateral_direito: 'Lateral direito',
    lateral_esquerdo: 'Lateral esquerdo', volante: 'Volante', meia: 'Meia',
    ponta: 'Ponta', centroavante: 'Centroavante',
  };
  const PES = { direito: 'Direito', esquerdo: 'Esquerdo', ambidestro: 'Ambidestro' };
  const PARENTESCOS = ['Pai', 'Mãe', 'Avô', 'Avó', 'Tio', 'Tia', 'Irmão', 'Irmã', 'Padrasto', 'Madrasta', 'Tutor(a) legal', 'Outro'];
  const TAM_ROUPA = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
  const TAM_MEIA = ['34-37', '38-40', '41-44'];
  const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  /* Grupos usados na ficha, no WhatsApp e na planilha. tipo = formato de exibição. */
  const GRUPOS = [
    { titulo: 'Dados pessoais', campos: [
      ['nome', 'Nome completo'], ['nome_esportivo', 'Nome esportivo'], ['nascimento', 'Data de nascimento', 'data'],
      ['naturalidade', 'Naturalidade'], ['cpf', 'CPF', 'cpf'], ['rg', 'RG'], ['escola', 'Escola'], ['serie', 'Série'],
      ['cep', 'CEP', 'cep'], ['endereco', 'Endereço'], ['numero', 'Número'], ['complemento', 'Complemento'],
      ['bairro', 'Bairro'], ['cidade', 'Cidade'], ['uf', 'UF'], ['telefone', 'Telefone/WhatsApp', 'tel'],
      ['email', 'E-mail'], ['instagram', 'Instagram', 'insta'],
    ] },
    { titulo: 'Responsável e contatos', campos: [
      ['nome_pai', 'Nome do pai'], ['nome_mae', 'Nome da mãe'], ['resp_nome', 'Responsável legal'],
      ['resp_parentesco', 'Parentesco'], ['resp_cpf', 'CPF do responsável', 'cpf'],
      ['resp_telefone', 'Telefone do responsável', 'tel'], ['emerg_nome', 'Contato de emergência'],
      ['emerg_telefone', 'Telefone de emergência', 'tel'],
    ] },
    { titulo: 'Dados esportivos', campos: [
      ['posicao', 'Posição principal', 'posicao'], ['posicao2', 'Posição secundária', 'posicao'],
      ['pe', 'Pé dominante', 'pe'], ['altura', 'Altura (cm)'], ['peso', 'Peso (kg)'],
      ['camisa_num', 'Nº da camisa preferido'], ['tam_camisa', 'Tamanho da camisa'],
      ['tam_short', 'Tamanho do short'], ['tam_meia', 'Tamanho da meia'], ['chuteira', 'Tamanho da chuteira'],
      ['clube_anterior', 'Clube anterior'], ['categoria_anterior', 'Categoria anterior'],
      ['registro_federacao', 'Registro na federação'],
    ] },
  ];
  const CAMPOS = GRUPOS.flatMap((g) => g.campos.map((c) => c[0])).concat('consentimento');

  const digits = (s) => String(s == null ? '' : s).replace(/\D/g, '');

  function validaCPF(valor) {
    const c = digits(valor);
    if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    for (let t = 9; t < 11; t++) {
      let soma = 0;
      for (let i = 0; i < t; i++) soma += Number(c[i]) * (t + 1 - i);
      const dv = ((soma * 10) % 11) % 10;
      if (dv !== Number(c[t])) return false;
    }
    return true;
  }

  function validaTelefone(valor) {
    let d = digits(valor);
    if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
    if (d.length !== 10 && d.length !== 11) return false;
    if (Number(d.slice(0, 2)) < 11) return false;
    if (d.length === 11 && d[2] !== '9') return false;
    return true;
  }

  function parseData(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return null;
    const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return { a: +m[1], m: +m[2], d: +m[3] };
  }

  function idade(iso, hoje) {
    const p = parseData(iso);
    if (!p) return null;
    hoje = hoje || new Date();
    let anos = hoje.getFullYear() - p.a;
    if (hoje.getMonth() + 1 < p.m || (hoje.getMonth() + 1 === p.m && hoje.getDate() < p.d)) anos--;
    return anos;
  }

  const txt = (v, max) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max || 120);
  const numOuVazio = (v) => {
    const n = parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return Number.isFinite(n) ? n : '';
  };

  /* Limpa e padroniza os dados recebidos (só campos conhecidos). */
  function normalizar(raw) {
    raw = raw || {};
    const o = {};
    for (const k of CAMPOS) o[k] = '';
    for (const k of ['nome', 'nome_esportivo', 'naturalidade', 'rg', 'escola', 'serie', 'endereco', 'numero', 'complemento',
      'bairro', 'cidade', 'email', 'nome_pai', 'nome_mae', 'resp_nome', 'resp_parentesco', 'emerg_nome',
      'clube_anterior', 'categoria_anterior', 'registro_federacao', 'tam_camisa', 'tam_short', 'tam_meia', 'posicao',
      'posicao2', 'pe']) o[k] = txt(raw[k]);
    o.email = o.email.toLowerCase();
    o.nascimento = txt(raw.nascimento, 10);
    o.uf = txt(raw.uf, 2).toUpperCase();
    o.instagram = txt(raw.instagram, 31).replace(/^@+/, '').replace(/\s/g, '');
    for (const k of ['cpf', 'resp_cpf']) o[k] = digits(raw[k]).slice(0, 11);
    for (const k of ['telefone', 'resp_telefone', 'emerg_telefone']) {
      let d = digits(raw[k]);
      if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
      o[k] = d.slice(0, 11);
    }
    o.cep = digits(raw.cep).slice(0, 8);
    o.altura = numOuVazio(raw.altura);
    o.peso = numOuVazio(raw.peso);
    o.camisa_num = numOuVazio(raw.camisa_num);
    o.chuteira = numOuVazio(raw.chuteira);
    o.consentimento = raw.consentimento === true || raw.consentimento === 'true' || raw.consentimento === 1;
    return o;
  }

  const reNome = /^\p{L}[\p{L}'.\- ]*$/u;
  const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* Recebe dados já normalizados; devolve { campo: 'mensagem' }. */
  function validar(d, hoje) {
    const e = {};
    const nomeCompleto = (v) => reNome.test(v) && v.split(' ').filter((p) => p.length > 1).length >= 2;

    if (!d.nome) e.nome = 'Informe o nome completo.';
    else if (!nomeCompleto(d.nome)) e.nome = 'Informe nome e sobrenome, apenas com letras.';

    if (!d.nascimento) e.nascimento = 'Informe a data de nascimento.';
    else if (!parseData(d.nascimento)) e.nascimento = 'Data de nascimento inválida.';
    else {
      const anos = idade(d.nascimento, hoje);
      if (anos < 0) e.nascimento = 'A data de nascimento não pode estar no futuro.';
      else if (anos > 40 || anos < 5) e.nascimento = 'Confira a data de nascimento.';
    }

    if (!d.cpf) e.cpf = 'Informe o CPF.';
    else if (!validaCPF(d.cpf)) e.cpf = 'CPF inválido. Confira os números.';

    if (!d.telefone) e.telefone = 'Informe o telefone/WhatsApp.';
    else if (!validaTelefone(d.telefone)) e.telefone = 'Telefone inválido. Use DDD + número, ex.: (11) 91234-5678.';

    if (d.email && !reEmail.test(d.email)) e.email = 'E-mail inválido.';
    if (d.instagram && !/^[A-Za-z0-9._]{1,30}$/.test(d.instagram)) e.instagram = 'Instagram inválido. Use só o nome de usuário, ex.: joaosilva10.';
    if (d.cep && d.cep.length !== 8) e.cep = 'CEP deve ter 8 números.';
    if (d.uf && !UFS.includes(d.uf)) e.uf = 'Selecione uma UF válida.';

    /* Responsável legal: obrigatório para menores de 18 anos. */
    const anos = parseData(d.nascimento) ? idade(d.nascimento, hoje) : null;
    const menor = anos !== null && anos < 18;
    const reqResp = (k, msg) => { if (menor && !d[k]) e[k] = msg; };
    reqResp('resp_nome', 'Informe o nome do responsável legal (obrigatório para menores de 18 anos).');
    reqResp('resp_parentesco', 'Informe o parentesco do responsável.');
    reqResp('resp_cpf', 'Informe o CPF do responsável.');
    reqResp('resp_telefone', 'Informe o telefone do responsável.');
    if (d.resp_nome && !nomeCompleto(d.resp_nome)) e.resp_nome = 'Informe nome e sobrenome do responsável, apenas com letras.';
    if (d.resp_parentesco && !PARENTESCOS.includes(d.resp_parentesco)) e.resp_parentesco = 'Selecione o parentesco.';
    if (d.resp_cpf && !validaCPF(d.resp_cpf)) e.resp_cpf = 'CPF do responsável inválido.';
    else if (d.resp_cpf && d.cpf && d.resp_cpf === d.cpf) e.resp_cpf = 'O CPF do responsável deve ser diferente do CPF do atleta.';
    if (d.resp_telefone && !validaTelefone(d.resp_telefone)) e.resp_telefone = 'Telefone do responsável inválido. Use DDD + número.';

    if (d.nome_pai && !reNome.test(d.nome_pai)) e.nome_pai = 'Use apenas letras no nome do pai.';
    if (d.nome_mae && !reNome.test(d.nome_mae)) e.nome_mae = 'Use apenas letras no nome da mãe.';

    if (!d.emerg_nome) e.emerg_nome = 'Informe o nome do contato de emergência.';
    else if (!reNome.test(d.emerg_nome)) e.emerg_nome = 'Use apenas letras no nome do contato.';
    if (!d.emerg_telefone) e.emerg_telefone = 'Informe o telefone do contato de emergência.';
    else if (!validaTelefone(d.emerg_telefone)) e.emerg_telefone = 'Telefone de emergência inválido. Use DDD + número.';

    if (!d.posicao) e.posicao = 'Selecione a posição principal.';
    else if (!POSICOES[d.posicao]) e.posicao = 'Posição inválida.';
    if (d.posicao2 && !POSICOES[d.posicao2]) e.posicao2 = 'Posição inválida.';
    if (d.pe && !PES[d.pe]) e.pe = 'Selecione o pé dominante.';

    if (d.altura !== '') {
      if (d.altura < 3) e.altura = 'Informe a altura em centímetros, ex.: 175.';
      else if (d.altura < 120 || d.altura > 230) e.altura = 'Altura deve estar entre 120 e 230 cm.';
    }
    if (d.peso !== '' && (d.peso < 30 || d.peso > 150)) e.peso = 'Peso deve estar entre 30 e 150 kg.';
    if (d.camisa_num !== '' && (!Number.isInteger(d.camisa_num) || d.camisa_num < 1 || d.camisa_num > 99)) e.camisa_num = 'Número da camisa deve ser de 1 a 99.';
    if (d.tam_camisa && !TAM_ROUPA.includes(d.tam_camisa)) e.tam_camisa = 'Tamanho inválido.';
    if (d.tam_short && !TAM_ROUPA.includes(d.tam_short)) e.tam_short = 'Tamanho inválido.';
    if (d.tam_meia && !TAM_MEIA.includes(d.tam_meia)) e.tam_meia = 'Tamanho inválido.';
    if (d.chuteira !== '' && (!Number.isInteger(d.chuteira) || d.chuteira < 28 || d.chuteira > 50)) e.chuteira = 'Tamanho da chuteira deve ser de 28 a 50.';

    if (!d.consentimento) e.consentimento = 'Para enviar, é necessário autorizar o uso dos dados.';
    return e;
  }

  /* Formatação para exibição. */
  function fmt(tipo, v) {
    if (v === null || v === undefined || v === '') return '';
    v = String(v);
    switch (tipo) {
      case 'cpf': return v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
      case 'cep': return v.replace(/^(\d{5})(\d{3})$/, '$1-$2');
      case 'tel': return v.length === 11 ? v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') : v.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
      case 'data': return v.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1');
      case 'posicao': return POSICOES[v] || v;
      case 'pe': return PES[v] || v;
      case 'insta': return '@' + v;
      default: return v;
    }
  }

  return { POSICOES, PES, PARENTESCOS, TAM_ROUPA, TAM_MEIA, UFS, GRUPOS, CAMPOS, digits, validaCPF, validaTelefone, parseData, idade, normalizar, validar, fmt };
});
