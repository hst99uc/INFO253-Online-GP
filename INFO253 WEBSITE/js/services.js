/* =========================================================
   Services page: service cards + "Can I be seen online?" checker
   ========================================================= */

// ----- Service catalogue (edit freely) -----
// mode: "online" = fully online, "maybe" = online first, may need in-person follow-up
const SERVICES = [
  {
    id: "everyday", category: "Everyday care", title: "Everyday illness",
    mode: "online",
    desc: "Short-term illnesses that don't need a physical examination.",
    examples: ["Colds, flu and sore throats", "Urinary tract infections", "Eye infections"],
    price: "$25", priceNote: "enrolled, from",
  },
  {
    id: "skin", category: "Everyday care", title: "Skin concerns",
    mode: "online",
    desc: "Upload a photo before your appointment so your GP can see it clearly.",
    examples: ["Rashes and eczema", "Acne", "Insect bites and minor burns"],
    price: "$25", priceNote: "enrolled, from",
  },
  {
    id: "scripts", category: "Prescriptions", title: "Repeat prescriptions",
    mode: "online",
    desc: "Renew regular medicines without a full appointment. Sent to any NZ pharmacy.",
    examples: ["Contraceptive pill", "Blood pressure medicine", "Asthma inhalers"],
    price: "$20", priceNote: "enrolled",
  },
  {
    id: "mental", category: "Mental health", title: "Mental health and wellbeing",
    mode: "online",
    desc: "A private, unhurried conversation. Long appointments are available.",
    examples: ["Stress, anxiety and low mood", "Sleep problems", "Referral to counselling"],
    price: "$45", priceNote: "enrolled, 30 min",
  },
  {
    id: "sexual", category: "Sexual health", title: "Sexual and reproductive health",
    mode: "maybe",
    desc: "Confidential advice. We send lab forms if you need a test.",
    examples: ["Contraception advice", "STI testing forms", "Emergency contraception"],
    price: "$25", priceNote: "enrolled, from",
  },
  {
    id: "chronic", category: "Ongoing conditions", title: "Ongoing conditions",
    mode: "maybe",
    desc: "Regular reviews for long-term conditions, with blood tests at a local lab.",
    examples: ["Diabetes reviews", "High blood pressure", "Thyroid conditions"],
    price: "$45", priceNote: "enrolled, 30 min",
  },
  {
    id: "certs", category: "Certificates and referrals", title: "Medical certificates",
    mode: "online",
    desc: "For work, study or exams when you've been too unwell to attend.",
    examples: ["Sick leave certificates", "Special consideration for exams", "Return to work notes"],
    price: "$25", priceNote: "enrolled",
  },
  {
    id: "referrals", category: "Certificates and referrals", title: "Referrals and test results",
    mode: "online",
    desc: "Get a referral to a specialist, or talk through results with a GP.",
    examples: ["Specialist referrals", "Blood test results", "X-ray and scan forms"],
    price: "$25", priceNote: "enrolled, from",
  },
  {
    id: "children", category: "Everyday care", title: "Children's health",
    mode: "maybe",
    desc: "For children over 3 months. A parent or caregiver joins the call.",
    examples: ["Fevers and coughs", "Ear pain", "Rashes"],
    price: "Free", priceNote: "under 14",
  },
];

// ----- Checker keywords -----
// type: online | maybe | inperson | emergency
const CONDITIONS = [
  { name: "Sore throat", type: "online" },
  { name: "Cold or flu", type: "online" },
  { name: "Urinary tract infection (UTI)", type: "online" },
  { name: "Rash", type: "online" },
  { name: "Acne", type: "online" },
  { name: "Eczema", type: "online" },
  { name: "Repeat prescription", type: "online" },
  { name: "Contraceptive pill", type: "online" },
  { name: "Medical certificate", type: "online" },
  { name: "Anxiety or stress", type: "online" },
  { name: "Low mood or depression", type: "online" },
  { name: "Trouble sleeping", type: "online" },
  { name: "Hay fever", type: "online" },
  { name: "Eye infection", type: "online" },
  { name: "Specialist referral", type: "online" },
  { name: "Blood test results", type: "online" },
  { name: "Ear pain", type: "maybe" },
  { name: "Child with a fever", type: "maybe" },
  { name: "STI testing", type: "maybe" },
  { name: "Diabetes review", type: "maybe" },
  { name: "Back pain", type: "maybe" },
  { name: "Mole check", type: "maybe" },
  { name: "Vaccination", type: "inperson" },
  { name: "Cervical screening", type: "inperson" },
  { name: "Stitches or wound care", type: "inperson" },
  { name: "Suspected broken bone", type: "inperson" },
  { name: "Driver licence medical", type: "inperson" },
  { name: "Chest pain", type: "emergency" },
  { name: "Difficulty breathing", type: "emergency" },
  { name: "Signs of a stroke", type: "emergency" },
  { name: "Severe bleeding", type: "emergency" },
  { name: "Thoughts of suicide or self-harm", type: "emergency" },
];

const VERDICTS = {
  online: {
    title: "Yes, you can be seen online",
    body: "A 15-minute video or phone appointment is usually enough for this.",
    action: '<a class="btn" href="find-gp.html">Find a GP</a>',
  },
  maybe: {
    title: "Start online, you may need a follow-up",
    body: "A GP can assess you by video first. If they need to examine you, they'll tell you where to go and we'll refund the online fee.",
    action: '<a class="btn" href="find-gp.html">Find a GP</a>',
  },
  inperson: {
    title: "This needs an in-person visit",
    body: "Our GPs can't do this online. Book with a local general practice or pharmacy. We can help you find one.",
    action: '<a class="btn btn-ghost" href="faq.html#getting-started">How to find a local clinic</a>',
  },
  emergency: {
    title: "Call 111 now",
    body: "This could be serious. Don't wait for an online appointment. Call 111 or go to your nearest emergency department.",
    action: '<a class="btn" style="background:#fff;color:#B42318;border-color:#fff" href="tel:111">Call 111</a>',
  },
};

// Special message for mental health crises (still type emergency, but add 1737)
const CRISIS_EXTRA = "You can also free call or text 1737 any time to talk with a trained counsellor.";

// ---------- Service cards ----------
const grid = document.getElementById("svc-grid");
const filterWrap = document.getElementById("svc-filter");
const categories = ["All", ...new Set(SERVICES.map((s) => s.category))];
let activeCat = "All";

function renderFilters() {
  filterWrap.innerHTML = categories
    .map((c) => `<button class="chip" type="button" aria-pressed="${c === activeCat}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderServices() {
  const list = activeCat === "All" ? SERVICES : SERVICES.filter((s) => s.category === activeCat);
  grid.innerHTML = list
    .map(
      (s) => `
      <article class="svc" id="svc-${s.id}">
        <div class="svc-top">
          <h3>${s.title}</h3>
          <span class="mode ${s.mode === "online" ? "mode-online" : "mode-maybe"}">
            ${s.mode === "online" ? "Fully online" : "May need a visit"}
          </span>
        </div>
        <p>${s.desc}</p>
        <ul>${s.examples.map((e) => `<li>${e}</li>`).join("")}</ul>
        <div class="svc-foot">
          <span class="price">${s.price}<small>${s.priceNote}</small></span>
          <a class="btn btn-sm" href="find-gp.html?service=${s.id}">Book</a>
        </div>
      </article>`
    )
    .join("");
}

filterWrap.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  activeCat = btn.dataset.cat;
  renderFilters();
  renderServices();
});

renderFilters();
renderServices();

// ---------- Checker ----------
const input = document.getElementById("check-input");
const verdict = document.getElementById("verdict");
const suggest = document.getElementById("check-suggest");
const datalist = document.getElementById("check-options");

datalist.innerHTML = CONDITIONS.map((c) => `<option value="${c.name}">`).join("");
suggest.innerHTML = ["Sore throat", "Repeat prescription", "Child with a fever", "Vaccination", "Chest pain"]
  .map((n) => `<button type="button">${n}</button>`)
  .join("");

function findCondition(q) {
  q = q.trim().toLowerCase();
  if (q.length < 2) return null;
  return (
    CONDITIONS.find((c) => c.name.toLowerCase() === q) ||
    CONDITIONS.find((c) => c.name.toLowerCase().startsWith(q)) ||
    CONDITIONS.find((c) => c.name.toLowerCase().includes(q)) ||
    null
  );
}

function showVerdict(q) {
  if (q.trim().length < 2) {
    verdict.removeAttribute("data-type");
    verdict.innerHTML = `<h3>Start typing to check</h3>
      <p>Our GPs handle most everyday concerns by video, including infections, skin problems, repeat prescriptions and mental health.</p>`;
    return;
  }
  const match = findCondition(q);
  if (!match) {
    verdict.dataset.type = "maybe";
    verdict.innerHTML = `<h3>We don't have "${escapeHtml(q)}" on our list</h3>
      <p>Book a standard appointment and the GP will advise you. If you can't be treated online, you get a full refund.</p>
      <a class="btn" href="find-gp.html">Find a GP</a>`;
    return;
  }
  const v = VERDICTS[match.type];
  const extra = match.name.includes("suicide") ? `<p><strong>${CRISIS_EXTRA}</strong></p>` : "";
  verdict.dataset.type = match.type;
  verdict.innerHTML = `<p style="font-size:.9rem;opacity:.8;margin-bottom:4px">${match.name}</p>
    <h3>${v.title}</h3><p>${v.body}</p>${extra}${v.action}`;
}

input.addEventListener("input", () => showVerdict(input.value));
suggest.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;
  input.value = e.target.textContent;
  showVerdict(input.value);
});
