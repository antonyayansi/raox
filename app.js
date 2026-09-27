(() => {
  'use strict';
  const config = window.RAOX_CONFIG || {};
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const safeURL = (value) => {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; }
    catch { return ''; }
  };
  const phone = /^\d{8,15}$/.test(config.whatsapp || '') ? config.whatsapp : '';
  const email = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(config.email || '') ? config.email : '';
  const whatsappURL = (message) => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const mailURL = (message) => `mailto:${email}?subject=${encodeURIComponent('Solicitud de cotización — Raox')}&body=${encodeURIComponent(message)}`;
  $('#year').textContent = new Date().getFullYear();
  if (config.serviceArea) $('[data-service-area]').textContent = config.serviceArea;
  const legal = [config.legalName, config.ruc && `RUC: ${config.ruc}`, config.address].filter(Boolean);
  if (legal.length) { $('#legal-data').textContent = legal.join(' · '); $('#legal-data').hidden = false; }
  if (email) {
    const link = $('[data-email]'); link.href = `mailto:${email}`; link.textContent = email; link.hidden = false;
    $('#privacy-contact').textContent = `Para consultas sobre tus datos, escribe a ${email}.${config.legalName ? ` Responsable: ${config.legalName}.` : ''}`;
  } else if (phone) {
    $('#privacy-contact').textContent = `Para consultas sobre tus datos, contacta con Raox por WhatsApp al +${phone}.${config.legalName ? ` Responsable: ${config.legalName}.` : ''}`;
  }
  if (phone) { const link = $('[data-whatsapp]'); link.href = whatsappURL('Hola, Raox. Quiero conversar sobre un proyecto para mi empresa.'); link.hidden = false; }
  $$('[data-social]').forEach(link => {
    const href = safeURL(config[link.dataset.social]);
    if (href) { link.href = href; link.hidden = false; }
  });
  $$('[data-checkout]').forEach(link => {
    const href = safeURL(config.checkout?.[link.dataset.checkout]);
    if (href) {
      link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      link.removeAttribute('data-service');
      link.textContent = 'Contratar servicio ↗';
      link.setAttribute('aria-label', `Contratar ${link.closest('article').querySelector('h3').textContent} en un proveedor externo`);
    }
  });
  const menuButton = $('.menu-toggle');
  const navigation = $('#navigation');
  document.documentElement.classList.add('js-menu');
  const closeMenu = () => { navigation.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton.addEventListener('click', () => {
    const opened = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(opened));
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) { closeMenu(); menuButton.focus(); }
  });
  $$('[data-service]').forEach(link => link.addEventListener('click', () => {
    $('#service-select').value = link.dataset.service;
    $('#request-result').hidden = true;
  }));
  $$('[data-dialog]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.dialog).showModal()));
  $$('dialog').forEach(dialog => {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
  });
  let preparedRequest = '';
  const form = $('#quote-form');
  form.addEventListener('input', () => { $('#request-result').hidden = true; preparedRequest = ''; });
  form.addEventListener('change', () => { $('#request-result').hidden = true; preparedRequest = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    preparedRequest = `Hola, Raox. Me gustaría recibir una propuesta.\n\nNombre: ${fields.get('name').trim()}\nEmpresa: ${fields.get('company').trim()}\nCorreo: ${fields.get('email').trim()}\nServicio: ${fields.get('service')}\n\nMi proyecto:\n${fields.get('message').trim()}`;
    $('#request-summary').textContent = preparedRequest;
    $('#result-help').textContent = phone || email
      ? 'Revisa tu solicitud y elige cómo enviarla. Se abrirá el canal seleccionado para que confirmes el envío.'
      : 'El contacto directo estará disponible próximamente. Puedes descargar tu solicitud para conservarla; todavía no se enviará a Raox.';
    if (phone) { $('#send-whatsapp').href = whatsappURL(preparedRequest); $('#send-whatsapp').hidden = false; }
    if (email) { $('#send-email').href = mailURL(preparedRequest); $('#send-email').hidden = false; }
    $('#result-status').textContent = 'Solicitud preparada. Todavía no se ha enviado.';
    $('#request-result').hidden = false;
    $('#request-result').focus({ preventScroll: true });
    $('#request-result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
  });
  $('#download-request').addEventListener('click', () => {
    if (!preparedRequest) return;
    const url = URL.createObjectURL(new Blob([preparedRequest], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'solicitud-raox.txt';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#result-status').textContent = 'Descarga iniciada. La solicitud no se ha enviado a Raox.';
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.07 });
    $$('.reveal').forEach(element => observer.observe(element));
    document.documentElement.classList.add('js-motion');
  }
})();
