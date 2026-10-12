'use strict';
// Integration: replace empty values with the team's actual page filenames.
const TEAM = { home: 'index.html', appointments: '', messages: '', profile: '' };
const STORE = 'online-gp-course-demo-v1';
const RX = { title: 'Prescriptions', prefix: 'prescription', list: 'prescriptions.html', fee: 20 };
const MC = { title: 'Medical certificates', prefix: 'certificate',
  list: 'medical-certificates.html', fee: 25 };
const key = document.body.dataset.page;
const isRx = key.startsWith('prescription');
const cfg = isRx ? RX : MC;
const type = isRx ? 'rx' : 'mc';
const medicines = ['Example medicine A', 'Example medicine B'];
const pharmacies = ['Sample Central Pharmacy', 'Sample Riverside Pharmacy'];
const purposes = ['Work absence', 'Study absence'];
const visits = ['Sample completed consultation', 'I need a consultation'];
const changes = ['No changes to discuss', 'I need to discuss a change'];
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = value => `NZ$${value.toFixed(2)}`;
const blank = () => ({ drafts: {}, requests: [], last: {} });
let storageOK = true;
function load() {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    return value && value.drafts && Array.isArray(value.requests) && value.last
      ? value : blank();
  } catch { storageOK = false; return blank(); }
}
let state = load();
function save() {
  try { sessionStorage.setItem(STORE, JSON.stringify(state)); return true; }
  catch {
    openDialog('Browser storage is unavailable',
      '<p>Enable session storage and open this folder with VS Code Live Server.</p>' +
      '<p>The demo has not saved or sent a request.</p>');
    return false;
  }
}
function openDialog(title, body, extra = '') {
  $('dialog-title').textContent = title;
  $('dialog-body').innerHTML = body;
  $('dialog-actions').innerHTML = extra;
  $('dialog').showModal();
}
function teamLink(name) {
  if (TEAM[name]) { location.href = TEAM[name]; return; }
  openDialog('Continue with the clinic team',
    `<p>The ${esc(name)} page belongs to another group member.</p>` +
    '<p>This demonstration stops here. No booking or message has been sent.</p>');
}
function navItem(name, label) {
  return `<button class="quiet" data-team="${name}">${label}</button>`;
}
const shell = `
  <a class="skip" href="#main">Skip to main content</a>
  <div class="demo">Course prototype · Fictional records · No requests sent</div>
  <header><div class="top">
    <a class="brand" href="${TEAM.home}"><span class="mark" aria-hidden="true">+</span>
      Online GP Clinic</a>
    <nav aria-label="Main navigation">
      <a href="${TEAM.home}">Home</a>
      <button class="quiet" data-info="services">Services</button>
      <button class="quiet" data-info="faq">FAQ</button>
      <button class="quiet" data-info="how">How it works</button>
      <button class="quiet" data-info="contact">Contact</button>
    </nav><span class="badge green">Demo patient</span>
  </div></header>
  <div class="layout"><aside class="sidebar" aria-label="Patient area">
    <div class="account"><p class="eyebrow">Your patient portal</p>
      <strong>Alex Demo</strong><br><small>Fictional account</small></div>
    <nav aria-label="Patient navigation">
      ${navItem('messages', 'Messages')}${navItem('appointments', 'My appointments')}
      ${navItem('profile', 'My profile')}
      <a href="${RX.list}" ${isRx ? 'aria-current="location"' : ''}>Prescriptions</a>
      <a href="${MC.list}" ${!isRx && key !== 'index' ? 'aria-current="location"' : ''}>
        Medical certificates</a>
    </nav><div class="support"><strong>Need some help?</strong>
      <p class="hint">Find out what happens after you send a request.</p>
      <button class="secondary" data-info="faq">View help</button></div>
  </aside><main id="main" tabindex="-1"></main></div>
  <footer><span>Online GP Clinic · Student design prototype</span>
    <button class="quiet" data-info="privacy">Privacy and data use</button>
    <button class="quiet" id="reset">Reset demo</button></footer>
  <dialog id="dialog" aria-labelledby="dialog-title">
    <h2 id="dialog-title"></h2><div id="dialog-body"></div>
    <div id="dialog-actions" class="actions"></div>
    <form method="dialog" class="actions"><button class="secondary">Close</button></form>
  </dialog>`;
document.body.insertAdjacentHTML('beforeend', shell);
function heading(title, subtitle, action = '') {
  document.title = `${title} | Online GP Clinic`;
  return `<nav class="crumb" aria-label="Breadcrumb"><a href="${TEAM.home}">Home</a>
    <span>/</span><a href="${cfg.list}">${cfg.title}</a>
    ${title !== cfg.title ? `<span>/</span>${esc(title)}` : ''}</nav>
    <div class="heading"><div><p class="eyebrow">Patient services</p>
      <h1>${title}</h1><p class="muted">${subtitle}</p></div>${action}</div>`;
}
function steps(n) {
  return `<ol class="steps" aria-label="Request progress">${
    ['1 Details', '2 Review', '3 Confirmation'].map((s, i) =>
      `<li ${i === n - 1 ? 'class="current" aria-current="step"' : ''}>${s}</li>`
    ).join('')}</ol>`;
}
function compactFee() {
  return `<p class="mobile-fee"><strong>Example fee: ${money(cfg.fee)}</strong>
    · No payment collected in this demo.</p>`;
}
function feePanel() {
  return `<aside><div class="panel"><p class="eyebrow">Example service fee</p>
    <p class="price">${money(cfg.fee)}</p><p>Illustrative price for this prototype.</p>
    <p class="hint">No payment is collected. If a consultation is needed,
    its fee must be shown before booking.${isRx ? ' Pharmacy charges are separate.' : ''}</p></div>
    <div class="panel"><h3>Reviewed by a GP</h3>
    <p class="hint">A request does not guarantee a prescription or certificate.
    Your GP may need more information or an in-person assessment.</p>
    <button class="secondary" data-info="privacy">How data is used</button></div></aside>`;
}
function records() {
  const list = state.requests.filter(r => r.type === type).slice().reverse();
  return `<div class="panel"><h2>Your requests</h2>${list.length ? list.map(r => `
    <article class="record"><div class="row"><div><h3>${esc(r.id)}</h3>
    <p class="hint">${esc(r.type === 'rx' ? r.data.medicine : r.data.purpose)}</p></div>
    <span class="badge amber">Awaiting GP review</span></div>
    <p class="hint">Saved in this demo session. No clinical decision has been made.</p>
    <button class="secondary" data-view="${esc(r.id)}">View request</button></article>`
  ).join('') : '<p class="muted">No requests yet. Your submitted demo requests appear here.</p>'}</div>`;
}
function overview() {
  const action = `<a class="button" href="${cfg.prefix}-request.html">${
    isRx ? 'Request a repeat' : 'Request a certificate'}</a>`;
  const intro = isRx ? 'Manage repeat requests and check what happens next.' :
    'Request evidence of absence after a clinical assessment.';
  let content = isRx ? `<div class="panel"><h2>Medicines in your demo record</h2>
    ${medicines.map(m => `<div class="record row"><div><h3>${m}</h3>
      <p class="hint">Fictional medicine · Existing record</p></div>
      <span class="badge green">Available to request</span></div>`).join('')}
    <p class="notice">Need a new medicine or a change? Arrange a consultation.</p>
    <button class="secondary" data-team="appointments">Discuss with a GP</button></div>` :
    `<div class="panel hero"><h2>For work or study</h2>
      <p>Tell your GP the requested dates and connect your request to a consultation.
      The GP decides whether a certificate can be issued and what it can state.</p>
      <p>Certificates are intended for your patient account. You choose whether
      to share an issued document with your employer or education provider.</p></div>
      <div class="panel"><h2>Issued documents</h2><p>No issued certificates in this demo.</p>
      <p class="hint">A submitted request stays pending until a GP makes a decision.</p></div>`;
  $('main').innerHTML = heading(cfg.title, intro, action) + compactFee() +
    `<div class="columns"><div>${content}${records()}</div>${feePanel()}</div>`;
}
function selectField(id, label, options, hint = '') {
  return `<div class="field"><label for="${id}">${label} (required)</label>
    ${hint ? `<p id="${id}-hint" class="hint">${hint}</p>` : ''}
    <select id="${id}" name="${id}" required
      aria-describedby="${id}-error${hint ? ` ${id}-hint` : ''}">
      <option value="">Choose an option</option>${options.map(o =>
        `<option value="${esc(o)}">${esc(o)}</option>`).join('')}</select>
    <p id="${id}-error" class="error"></p></div>`;
}
function dateField(id, label) {
  return `<div class="field"><label for="${id}">${label} (required)</label>
    <input id="${id}" name="${id}" type="date" required aria-describedby="${id}-error">
    <p id="${id}-error" class="error"></p></div>`;
}
const errorBox = '<div id="errors" class="errors" tabindex="-1" role="alert" hidden></div>';
function requestPage() {
  const fields = isRx ?
    selectField('medicine', 'Medicine', medicines, 'Select a fictional existing medicine.') +
    selectField('change', 'Changes since your last review', changes) +
    selectField('pharmacy', 'Collection pharmacy', pharmacies,
      'These are fictional branches. Check your chosen branch on the next page.') :
    selectField('purpose', 'Certificate purpose', purposes) +
    `<div class="two">${dateField('from', 'Requested start date')}
      ${dateField('to', 'Requested end date')}</div>` +
    selectField('visit', 'Related consultation', visits,
      'Requested dates are subject to the GP assessment.');
  $('main').innerHTML = heading(isRx ? 'Request a repeat' : 'Request a certificate',
    'Use the fictional options below. All marked fields are required.') + compactFee() + steps(1) +
    `<div class="columns"><form id="request-form" class="panel" novalidate>
      <h2>Request details</h2><p class="hint">Patient: Alex Demo · Fictional account</p>
      ${errorBox}${fields}<p id="consult-note" class="notice" hidden>
      This option needs a consultation. Use the button below to continue with the GP.</p>
      <button type="button" class="secondary" id="consult" data-team="appointments" hidden>
        Arrange a consultation</button>
      <p class="hint">Only the details needed for this request are shown.
      No employer contact details or medical history are collected here.</p>
      <div class="actions"><button type="button" class="secondary" id="cancel">Cancel</button>
      <button type="submit">Review request</button></div></form>${feePanel()}</div>`;
  const draft = state.drafts[type];
  if (draft) Object.entries(draft).forEach(([id, v]) => { if ($(id)) $(id).value = v; });
  $('request-form').addEventListener('change', updateConsult);
  $('request-form').addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const errors = validate(data);
    if (errors.length) { showErrors(errors); return; }
    state.drafts[type] = data;
    if (save()) location.href = `${cfg.prefix}-review.html`;
  });
  $('cancel').onclick = cancelDraft;
  updateConsult();
}
function updateConsult() {
  const needed = isRx ? $('change').value === changes[1] : $('visit').value === visits[1];
  $('consult-note').hidden = !needed; $('consult').hidden = !needed;
}
function validDate(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return false;
  const d = new Date(v + 'T12:00:00Z');
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v;
}
function validate(d) {
  const errors = [];
  const check = (id, ok, message) => { if (!ok) errors.push([id, message]); };
  if (isRx) {
    check('medicine', medicines.includes(d.medicine), 'Choose an existing example medicine.');
    check('change', d.change === changes[0], d.change === changes[1]
      ? 'Arrange a consultation to discuss the change.' : 'Choose whether anything has changed.');
    check('pharmacy', pharmacies.includes(d.pharmacy), 'Choose your collection pharmacy.');
  } else {
    check('purpose', purposes.includes(d.purpose), 'Choose work or study absence.');
    check('from', validDate(d.from), 'Enter a valid start date.');
    check('to', validDate(d.to), 'Enter a valid end date.');
    if (validDate(d.from) && validDate(d.to))
      check('to', d.to >= d.from, 'The end date must be on or after the start date.');
    check('visit', d.visit === visits[0], d.visit === visits[1]
      ? 'Arrange a consultation before submitting this request.' : 'Choose a related consultation.');
  }
  return errors;
}
function showErrors(errors) {
  document.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  document.querySelectorAll('.error').forEach(el => { el.textContent = ''; });
  errors.forEach(([id, msg]) => {
    if ($(id)) $(id).setAttribute('aria-invalid', 'true');
    if ($(`${id}-error`)) $(`${id}-error`).textContent = msg;
  });
  $('errors').innerHTML = '<strong>Check your request</strong><ul>' + errors.map(([id, msg]) =>
    `<li><a href="#${id}">${esc(msg)}</a></li>`).join('') + '</ul>';
  $('errors').hidden = false; $('errors').focus();
}
function summary(d) {
  const values = isRx ? [['Medicine', d.medicine], ['Changes', d.change], ['Pharmacy', d.pharmacy]] :
    [['Purpose', d.purpose], ['Start date', d.from], ['End date', d.to], ['Consultation', d.visit]];
  return '<dl>' + [['Patient', 'Alex Demo'], ...values, ['Example fee', money(cfg.fee)]].map(([k, v]) =>
    `<div class="summary-row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('') + '</dl>';
}
function guard() {
  $('main').innerHTML = heading('Start a request first', 'There is no active request to display.') +
    `<div class="panel"><p>Your draft may have been submitted, cancelled or cleared.</p>
      <a class="button" href="${cfg.prefix}-request.html">Start a new request</a></div>`;
}
function reviewPage() {
  const draft = state.drafts[type];
  if (!draft || validate(draft).length) { guard(); return; }
  $('main').innerHTML = heading('Review your request', 'Check every detail before continuing.') +
    steps(2) + `<div class="columns"><form class="panel" id="review-form" novalidate>
    <h2>Request summary</h2>${summary(draft)}${errorBox}
    <p class="notice">The GP will review this request. Nothing has been approved yet.</p>
    <label class="check"><input type="checkbox" id="consent" required
      aria-describedby="consent-error"><span>I confirm these demo details are correct
      and understand that a GP must review the request.</span></label>
    <p class="error" id="consent-error"></p>
    <p class="hint">${isRx ? 'Proposed live flow: clinic staff review the request and an approved ' +
      'prescription is sent to the selected pharmacy.' : 'Proposed live flow: the GP reviews ' +
      'the consultation and any issued certificate appears in your patient account.'}
      This demo sends no data.</p>
    <div class="actions"><a class="button secondary" href="${cfg.prefix}-request.html">Edit details</a>
      <button id="submit" type="submit">Submit demo request</button></div>
    </form>${feePanel()}</div>`;
  $('review-form').onsubmit = e => {
    e.preventDefault();
    if (!$('consent').checked) { showErrors([['consent', 'Confirm the details before submitting.']]); return; }
    state = load();
    if (!state.drafts[type]) { guard(); return; }
    $('submit').disabled = true;
    const id = `${isRx ? 'RX' : 'MC'}-DEMO-${Date.now().toString(36).toUpperCase()}`;
    state.requests.push({ id, type, data: state.drafts[type] });
    state.last[type] = id; delete state.drafts[type];
    if (save()) location.replace(`${cfg.prefix}-confirmation.html`);
    else $('submit').disabled = false;
  };
}
function confirmationPage() {
  const item = state.requests.find(r => r.id === state.last[type] && r.type === type);
  if (!item) { guard(); return; }
  $('main').innerHTML = heading('Demo request saved', 'Your request is awaiting GP review.') + steps(3) +
    `<div class="columns"><div class="panel"><span class="success" aria-hidden="true">✓</span>
    <h2>Awaiting GP review</h2><p>Reference: <strong>${esc(item.id)}</strong></p>
    ${summary(item.data)}<h3 style="margin-top:22px">What happens next</h3>
    <p>In the proposed service, the GP checks your request and may ask for more information
    or an appointment. ${isRx ? 'After approval, the prescription goes to your chosen pharmacy.' :
    'If issued, the certificate becomes available in your patient account.'}</p>
    <p class="notice">Demo only. No request was sent, no payment was taken,
    and no prescription or certificate was issued.</p>
    <div class="actions"><a class="button" href="${cfg.list}">Return to ${cfg.title.toLowerCase()}</a>
    <button class="secondary" data-download="${esc(item.id)}">Download demo receipt</button></div>
    </div>${feePanel()}</div>`;
}
function cancelDraft() {
  openDialog('Discard this draft?', '<p>Your unsent selections will be cleared.</p>',
    '<button id="discard">Discard draft</button>');
  $('discard').onclick = () => {
    delete state.drafts[type]; if (save()) location.href = cfg.list;
  };
}
function download(id) {
  const item = state.requests.find(r => r.id === id);
  if (!item) return;
  const text = `COURSE DEMO RECEIPT\n${item.id}\nAwaiting GP review\n` +
    'No request sent. No payment taken. Not a prescription or medical certificate.\n';
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `${id}.txt`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function indexPage() {
  document.title = 'Patient services demo | Online GP Clinic';
  $('main').innerHTML = `<p class="eyebrow">Online GP Clinic</p><h1>Your care after a consultation</h1>
    <p class="muted">Manage a repeat prescription or request a medical certificate.</p>
    <div class="two"><section class="panel hero"><h2>Prescriptions</h2>
      <p>Select an existing medicine, choose a pharmacy and review your request.</p>
      <a class="button" href="${RX.list}">Manage prescriptions</a></section>
    <section class="panel hero"><h2>Medical certificates</h2>
      <p>Request evidence of absence for work or study after a consultation.</p>
      <a class="button" href="${MC.list}">Manage certificates</a></section></div>
    <div class="panel"><h2>Prototype guide</h2>
      <p>This entry page connects the two modules. The group will supply the full website homepage.</p>
      <a href="iterations/versions.html">View design versions and mobile preview</a></div>`;
}
const info = {
  services: ['Patient services', '<p>Manage repeat prescriptions and medical certificate requests.</p>' +
    `<p><a href="${RX.list}">Prescriptions</a> · <a href="${MC.list}">Medical certificates</a></p>`],
  faq: ['Help with your request', '<details open><summary>Does submission mean approval?</summary>' +
    '<p>No. A GP must review the request and may need a consultation.</p></details>' +
    '<details><summary>Can I change the details?</summary><p>Use Edit details before submitting.' +
    ' After submission, contact the clinic through the full website.</p></details>' +
    '<details><summary>Where is my certificate?</summary><p>Requests in this demo stay pending.' +
    ' Only a clinician can issue a real certificate.</p></details>'],
  how: ['How requests work', '<ol><li>Complete your request details.</li>' +
    '<li>Check the details and fee.</li><li>Submit for GP review.</li></ol>' +
    '<p>These screens demonstrate the patient journey. They do not provide clinical care.</p>'],
  contact: ['Contact the clinic', '<p>In the full website, use the clinic contact or Messages page.</p>' +
    '<p>This student prototype does not connect to a real clinic.</p>'],
  privacy: ['Privacy and data use', '<p>Use only fictional selections. This prototype saves demo ' +
    'requests in this browser tab session. Reset demo clears them. It sends no data to a clinic.</p>' +
    '<p>In a live service, clinical staff would review requests and approved prescriptions would ' +
    'be shared with the selected pharmacy. Certificates would be delivered to the patient account.</p>']
};
document.addEventListener('click', e => {
  const b = e.target.closest('[data-team],[data-info],[data-view],[data-download]');
  if (!b) return;
  if (b.dataset.team) teamLink(b.dataset.team);
  if (b.dataset.info) openDialog(...info[b.dataset.info]);
  if (b.dataset.download) download(b.dataset.download);
  if (b.dataset.view) {
    const r = state.requests.find(x => x.id === b.dataset.view);
    if (r) openDialog(r.id, summary(r.data) +
      '<p class="notice">Awaiting GP review. This is a demo request.</p>');
  }
});
$('reset').onclick = () => {
  openDialog('Reset this demo?', '<p>This clears only fictional requests and drafts in this tab.</p>',
    '<button id="reset-confirm">Clear demo data</button>');
  $('reset-confirm').onclick = () => { state = blank(); if (save()) location.href = TEAM.home; };
};
function render() {
  state = load();
  if (key === 'index') indexPage();
  else if (key.endsWith('request')) requestPage();
  else if (key.endsWith('review')) reviewPage();
  else if (key.endsWith('confirmation')) confirmationPage();
  else overview();
}
render();
window.addEventListener('pageshow', e => { if (e.persisted) render(); });
if (!storageOK) openDialog('Session storage is unavailable',
  '<p>Enable session storage to complete the multi-page demo.</p>');
