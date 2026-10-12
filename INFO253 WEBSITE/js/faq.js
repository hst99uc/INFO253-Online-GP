/* =========================================================
   FAQ page: topic filter + live search with highlighting.
   Add questions to FAQS below. Answers may contain HTML.
   Link straight to a topic with faq.html#fees, faq.html#privacy etc.
   ========================================================= */

const TOPICS = [
  { id: "getting-started", label: "Getting started" },
  { id: "appointments", label: "Appointments" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "fees", label: "Fees and payment" },
  { id: "privacy", label: "Privacy and records" },
  { id: "technical", label: "Technical help" },
];

const FAQS = [
  // Getting started
  { topic: "getting-started", q: "Do I need to be enrolled to use Kōwhai Health?",
    a: "<p>No. Anyone in New Zealand can book as a casual patient. If you enrol with us as your main GP, you pay lower fees and we keep your full health record.</p>" },
  { topic: "getting-started", q: "Can I use Kōwhai Health if I already have a regular GP?",
    a: "<p>Yes. Many people use us for evenings and weekends when their GP is closed. With your permission, we send a summary of your appointment to your regular GP.</p>" },
  { topic: "getting-started", q: "Who can't use an online GP?",
    a: "<p>Online appointments aren't suitable for emergencies, babies under 3 months with a fever, or anything that needs a physical examination. See the <a href='services.html'>services page</a> for the full list. In an emergency, call 111.</p>" },
  { topic: "getting-started", q: "How do I find a local clinic if I need to be seen in person?",
    a: "<p>Your GP will recommend a clinic near you at the end of your appointment. You can also search Healthpoint for general practices and urgent care centres in your area.</p>" },

  // Appointments
  { topic: "appointments", q: "How quickly can I see a GP?",
    a: "<p>Most people are seen the same day. Use <a href='find-gp.html'>Find a GP</a> and turn on “Available today” to see the earliest times.</p>" },
  { topic: "appointments", q: "Can I choose a GP who speaks my language?",
    a: "<p>Yes. Our GPs speak English, Mandarin, Cantonese, Hindi, Samoan, Tongan and te reo Māori. Filter by language on the <a href='find-gp.html'>Find a GP</a> page.</p>" },
  { topic: "appointments", q: "How do I cancel or change my appointment?",
    a: "<p>Go to My appointments in your account and choose Change or Cancel. Cancel at least 2 hours before your appointment for a full refund.</p>" },
  { topic: "appointments", q: "What happens if my GP is running late?",
    a: "<p>You'll get a text telling you the new expected time. If you wait more than 20 minutes, you can rebook for free or ask for a refund.</p>" },
  { topic: "appointments", q: "Can someone join the appointment with me?",
    a: "<p>Yes. A family member, support person or interpreter can join. Parents or caregivers must join for children under 16.</p>" },

  // Prescriptions
  { topic: "prescriptions", q: "How do I get my prescription?",
    a: "<p>Your GP sends it electronically to the pharmacy you choose when you book. Most pharmacies have it ready within an hour.</p>" },
  { topic: "prescriptions", q: "Can I get a repeat prescription without an appointment?",
    a: "<p>Yes, if you're an enrolled patient and your GP has already prescribed the medicine in the last 12 months. Request it from your account for $20.</p>" },
  { topic: "prescriptions", q: "Are there medicines you can't prescribe online?",
    a: "<p>We don't start new prescriptions for controlled medicines, such as strong pain relief, sleeping tablets or ADHD medication. Your regular GP or a specialist needs to see you in person for these.</p>" },

  // Fees
  { topic: "fees", q: "How much does an appointment cost?",
    a: "<p>A standard 15-minute appointment is $25 for enrolled patients and $69 for casual patients. Children under 14 are free. See all <a href='services.html#fees'>fees</a>.</p>" },
  { topic: "fees", q: "What if the GP can't help me online?",
    a: "<p>If your GP decides you need to be seen in person, we refund your appointment fee in full, automatically.</p>" },
  { topic: "fees", q: "What payment methods do you accept?",
    a: "<p>Visa, Mastercard, Apple Pay, Google Pay and POLi bank transfer. You pay when you book.</p>" },
  { topic: "fees", q: "Do you accept the Community Services Card?",
    a: "<p>Yes. Add your card number to your account and you'll pay the enrolled rate, even as a casual patient.</p>" },

  // Privacy
  { topic: "privacy", q: "Are video calls recorded?",
    a: "<p>No. Calls are encrypted end to end and are never recorded. Your GP writes notes in your health record, just like an in-person visit.</p>" },
  { topic: "privacy", q: "Who can see my health information?",
    a: "<p>Only the clinicians involved in your care. We follow the Health Information Privacy Code 2020 and store all records in New Zealand.</p>" },
  { topic: "privacy", q: "Can I get a copy of my health records?",
    a: "<p>Yes. Download them any time from your account, or email us and we'll send them within 20 working days.</p>" },

  // Technical
  { topic: "technical", q: "What do I need for a video appointment?",
    a: "<p>A phone, tablet or computer with a camera and microphone, and a stable internet connection. We recommend Chrome, Safari or Edge. There's no app to download.</p>" },
  { topic: "technical", q: "My video isn't working. What should I do?",
    a: "<p>Check that your browser has permission to use your camera and microphone, then refresh the page. If it still doesn't work, your GP will call you on your phone instead.</p>" },
  { topic: "technical", q: "Can I have a phone appointment instead of video?",
    a: "<p>Yes. Choose “Phone call” when you book. Some concerns, like skin problems, work better on video so your GP can see.</p>" },
];

// ---------- Rendering ----------
const topicList = document.getElementById("faq-topics");
const listEl = document.getElementById("faq-list");
const countEl = document.getElementById("faq-count");
const searchEl = document.getElementById("faq-q");

let activeTopic = "all";

// Wrap matches in <mark>, in text nodes only
function highlight(root, q) {
  if (!q) return;
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    text.replace(re, (match, index) => {
      frag.append(text.slice(last, index));
      const mark = document.createElement("mark");
      mark.textContent = match;
      frag.append(mark);
      last = index + match.length;
    });
    if (last === 0) return;
    frag.append(text.slice(last));
    node.replaceWith(frag);
  });
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ");
}

function topicLabel(id) {
  const t = TOPICS.find((t) => t.id === id);
  return t ? t.label : "All questions";
}

function renderTopics() {
  const counts = TOPICS.map((t) => FAQS.filter((f) => f.topic === t.id).length);
  topicList.innerHTML =
    `<li><button type="button" data-topic="all">All questions <span>${FAQS.length}</span></button></li>` +
    TOPICS.map(
      (t, i) =>
        `<li><button type="button" data-topic="${t.id}">${t.label} <span>${counts[i]}</span></button></li>`
    ).join("");
  syncTopics();
}

function syncTopics() {
  topicList.querySelectorAll("[data-topic]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.topic === activeTopic));
  });
}

function setTopic(id) {
  activeTopic = id;
  syncTopics();
  render();
}

function render() {
  const q = searchEl.value.trim();
  const ql = q.toLowerCase();

  const matches = FAQS.filter(
    (f) =>
      (activeTopic === "all" || f.topic === activeTopic) &&
      (!ql || f.q.toLowerCase().includes(ql) || stripTags(f.a).toLowerCase().includes(ql))
  );

  if (matches.length === 0) {
    const inTopic = activeTopic !== "all";
    const where = inTopic ? ` in ${topicLabel(activeTopic)}` : "";
    countEl.textContent = `No questions${where} match “${q}”`;
    listEl.innerHTML = `
      <div class="empty">
        <h3>No questions${escapeHtml(where)} match “${escapeHtml(q)}”</h3>
        <p>${inTopic ? "Try searching all topics, or use" : "Try"} a shorter word, such as “prescription”, “refund” or “video”, or email our support team below.</p>
        <button class="btn btn-ghost btn-sm" type="button" id="faq-reset">${inTopic ? "Search all topics" : "Show all questions"}</button>
      </div>`;
    document.getElementById("faq-reset").onclick = () => {
      if (!inTopic) searchEl.value = "";
      history.replaceState(null, "", location.pathname + location.search);
      setTopic("all");
      searchEl.focus();
    };
    return;
  }

  countEl.textContent = q
    ? `${matches.length} ${matches.length === 1 ? "question matches" : "questions match"} “${q}”`
    : "";

  // group by topic, in topic order
  listEl.innerHTML = TOPICS.filter((t) => matches.some((m) => m.topic === t.id))
    .map((t) => {
      const items = matches
        .filter((m) => m.topic === t.id)
        .map(
          (f) => `
          <details class="faq-item"${q ? " open" : ""}>
            <summary>${escapeHtml(f.q)}</summary>
            <div class="faq-answer">${f.a}</div>
          </details>`
        )
        .join("");
      return `<section class="faq-group" id="${t.id}"><h2>${t.label}</h2>${items}</section>`;
    })
    .join("");

  listEl.querySelectorAll(".faq-item").forEach((item) => highlight(item, q));
}

topicList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-topic]");
  if (!btn) return;
  const id = btn.dataset.topic;
  history.replaceState(null, "", id === "all" ? location.pathname + location.search : `#${id}`);
  setTopic(id);
});

searchEl.addEventListener("input", render);

// Deep link: faq.html#fees opens that topic
function topicFromHash() {
  const hash = location.hash.slice(1);
  return TOPICS.some((t) => t.id === hash) ? hash : "all";
}

// Hash links clicked while already on this page
window.addEventListener("hashchange", () => {
  setTopic(topicFromHash());
  const section = document.getElementById(activeTopic);
  if (section) section.scrollIntoView();
});

activeTopic = topicFromHash();
renderTopics();
render();
