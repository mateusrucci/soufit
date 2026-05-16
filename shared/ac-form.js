/**
 * ac-form.js — Integração ActiveCampaign com UTMs
 * Intercepta o formulário Elementor, lê UTMs do localStorage
 * e envia tudo para /ac-submit.php (server-side).
 */
(function () {
  var STORAGE_KEY = 'soufit_tracking_params';
  var SUBMIT_URL  = '/ac-submit.php';
  var BTN_LABEL   = null; // guarda o texto original do botão

  function getUtms() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function getField(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function showMessage(form, text, isError) {
    var el = form.querySelector('.elementor-message') ||
             form.querySelector('.e-form__messages');
    if (!el) {
      el = document.createElement('div');
      el.className = 'elementor-message';
      form.appendChild(el);
    }
    el.textContent = text;
    el.style.display   = 'block';
    el.style.marginTop = '12px';
    el.style.color     = isError ? '#c0392b' : '#27ae60';
    el.style.fontWeight = '600';
  }

  function handleSubmit(e) {
    var form = e.target;
    if (!form || !form.classList.contains('elementor-form')) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var btn = form.querySelector('[type="submit"]');
    if (btn) {
      BTN_LABEL    = BTN_LABEL || btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Enviando...';
    }

    var utms  = getUtms();
    var email = getField(form, 'form_fields[email]');

    if (!email) {
      showMessage(form, 'Por favor, informe seu e-mail.', true);
      if (btn) { btn.disabled = false; btn.textContent = BTN_LABEL; }
      return;
    }

    var payload = {
      name:         getField(form, 'form_fields[name]'),
      phone:        getField(form, 'form_fields[message]'),
      email:        email,
      utm_source:   utms.utm_source   || '',
      utm_medium:   utms.utm_medium   || '',
      utm_campaign: utms.utm_campaign || '',
      utm_content:  utms.utm_content  || '',
      utm_term:     utms.utm_term     || '',
    };

    fetch(SUBMIT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.status === 'ok') {
        window.location.href = '/protocolo-magra-em-casa-obg/';
      } else {
        throw new Error(res.message || 'Erro desconhecido');
      }
    })
    .catch(function () {
      showMessage(form, 'Ops! Tente novamente em instantes.', true);
      if (btn) { btn.disabled = false; btn.textContent = BTN_LABEL; }
    });
  }

  document.addEventListener('submit', handleSubmit, true);
})();
