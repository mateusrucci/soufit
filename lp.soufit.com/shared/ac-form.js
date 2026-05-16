/**
 * ac-form.js — Integração ActiveCampaign + redirect pós-cadastro
 * Vanilla JS puro. Sem dependência de jQuery ou Elementor.
 */
(function () {
  var STORAGE_KEY  = 'soufit_tracking_params';
  var SUBMIT_URL   = '/ac-submit.php';
  var REDIRECT_URL = '/protocolo-magra-em-casa-obg/';

  function getUtms() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (_) { return {}; }
  }

  function val(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function showError(form, msg) {
    var el = form.querySelector('.soufit-msg');
    if (!el) {
      el = document.createElement('p');
      el.className = 'soufit-msg';
      el.style.cssText = 'color:#c0392b;font-weight:600;margin-top:10px;font-size:14px;';
      form.appendChild(el);
    }
    el.textContent = msg;
  }

  function handleSubmit(e) {
    e.preventDefault();

    var form = e.currentTarget;
    var btn  = form.querySelector('[type="submit"]');
    var orig = btn ? btn.textContent : '';

    var email = val(form, 'form_fields[email]');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showError(form, 'Por favor, informe um e-mail válido.');
      return;
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

    var utms = getUtms();
    var body = JSON.stringify({
      name:         val(form, 'form_fields[name]'),
      phone:        val(form, 'form_fields[message]'),
      email:        email,
      utm_source:   utms.utm_source   || '',
      utm_medium:   utms.utm_medium   || '',
      utm_campaign: utms.utm_campaign || '',
      utm_content:  utms.utm_content  || '',
      utm_term:     utms.utm_term     || '',
    });

    // Fire-and-forget com keepalive — request sobrevive à navegação
    try {
      fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
      });
    } catch (_) {}

    // Redireciona imediatamente
    window.location.href = REDIRECT_URL;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var forms = document.querySelectorAll('form.elementor-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', handleSubmit);
    });
  });
})();
