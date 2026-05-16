/**
 * ac-form.js — Integração ActiveCampaign com UTMs + redirect pós-cadastro
 *
 * Estratégia: captura o CLICK no botão submit (fase capture, antes do Elementor)
 * para garantir controle total do fluxo. O fetch é fire-and-forget (keepalive)
 * pois o AC já salva via PHP — o redirect ocorre imediatamente após validação.
 */
(function () {
  var STORAGE_KEY  = 'soufit_tracking_params';
  var SUBMIT_URL   = '/ac-submit.php';
  var REDIRECT_URL = '/protocolo-magra-em-casa-obg/';

  function getUtms() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function getField(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function showError(form, btn, origLabel, text) {
    var el = form.querySelector('.soufit-msg');
    if (!el) {
      el = document.createElement('div');
      el.className = 'soufit-msg';
      el.style.cssText = 'margin-top:10px;font-size:14px;font-weight:600;color:#c0392b;';
      form.appendChild(el);
    }
    el.textContent = text;
    if (btn) { btn.disabled = false; btn.textContent = origLabel; }
  }

  function handleClick(e) {
    // Só botões submit dentro de formulários Elementor
    var btn = e.target.closest('[type="submit"]');
    if (!btn) return;
    var form = btn.closest('form.elementor-form');
    if (!form) return;

    // Bloqueia Elementor e submit nativo
    e.preventDefault();
    e.stopImmediatePropagation();

    var origLabel = btn.textContent;
    btn.disabled  = true;
    btn.textContent = 'Enviando…';

    var email = getField(form, 'form_fields[email]');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      showError(form, btn, origLabel, 'Por favor, informe um e-mail válido.');
      return;
    }

    var utms = getUtms();
    var payload = JSON.stringify({
      name:         getField(form, 'form_fields[name]'),
      phone:        getField(form, 'form_fields[message]'),
      email:        email,
      utm_source:   utms.utm_source   || '',
      utm_medium:   utms.utm_medium   || '',
      utm_campaign: utms.utm_campaign || '',
      utm_content:  utms.utm_content  || '',
      utm_term:     utms.utm_term     || '',
    });

    // Fire-and-forget com keepalive — sobrevive à navegação da página
    try {
      fetch(SUBMIT_URL, {
        method:   'POST',
        headers:  { 'Content-Type': 'application/json' },
        body:     payload,
        keepalive: true,
      });
    } catch (_) {}

    // Redireciona imediatamente — não espera resposta do PHP
    window.location.href = REDIRECT_URL;
  }

  // Capture no document garante prioridade sobre qualquer handler Elementor
  document.addEventListener('click', handleClick, true);

  // Fallback: submit nativo (caso algum browser não dispare click primeiro)
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || !form.classList.contains('elementor-form')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.click(); // re-roteia para o click handler acima
  }, true);
})();
