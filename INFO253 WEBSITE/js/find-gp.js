/* =========================================================
   Find a GP: filters, sorting, profile dialog, slot picker.
   Selecting a time sends the user to the booking page:
     book.html?gp=<id>&time=<ISO date>&service=<id>
   ========================================================= */

const els = {
  name: document.getElementById("f-name"),
  lang: document.getElementById("f-lang"),
  interest: document.getElementById("f-interest"),
  today: document.getElementById("f-today"),
  sort: document.getElementById("f-sort"),
  reset: document.getElementById("f-reset"),
  list: document.getElementById("gp-list"),
  count: document.getElementById("result-count"),
  form: document.getElementById("filters"),
};

const params = new URLSearchParams(location.search);
const serviceParam = params.get("service") || "";

// Service (from services page) -> area of interest
const SERVICE_TO_INTEREST = {
  mental: "Mental health",
  skin: "Skin conditions",
  children: "Children's health",
  chronic: "Chronic conditions",
  sexual: "Sexual health",
};

// Pre-compute availability once per load
GPS.forEach((gp) => (gp.slots = getSlots(gp)));

// ---------- Populate dropdowns ----------
const allLangs = [...new Set(GPS.flatMap((g) => g.languages))].sort((a, b) =>
  a === "English" ? -1 : b === "English" ? 1 : a.localeCompare(b)
);
const allInterests = [...new Set(GPS.flatMap((g) => g.interests))].sort();
els.lang.insertAdjacentHTML("beforeend", allLangs.map((l) => `<option>${l}</option>`).join(""));
els.interest.insertAdjacentHTML("beforeend", allInterests.map((i) => `<option>${i}</option>`).join(""));

if (SERVICE_TO_INTEREST[serviceParam]) els.interest.value = SERVICE_TO_INTEREST[serviceParam];

// ---------- Date helpers ----------
const isSameDay = (a, b) => a.toDateString() === b.toDateString();
const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function dayLabel(d) {
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, tomorrow)) return "Tomorrow";
  return d.toLocaleDateString("en-NZ", { weekday: "long", day: "numeric", month: "short" });
}
function timeLabel(d) {
  return d.toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit" }).replace(/\s/g, "").toLowerCase();
}
function initials(name) {
  // "Dr Mei Lin Zhao" -> "MZ"
  const parts = name.replace(/^Dr /, "").split(" ");
  return parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "");
}

// ---------- Filter + render ----------
function currentFilters() {
  return {
    name: els.name.value.trim().toLowerCase(),
    lang: els.lang.value,
    gender: els.form.querySelector("input[name=gender]:checked").value,
    interest: els.interest.value,
    today: els.today.checked,
    sort: els.sort.value,
  };
}

function render() {
  const f = currentFilters();
  const now = new Date();

  let list = GPS.filter(
    (g) =>
      (!f.name || g.name.toLowerCase().includes(f.name)) &&
      (!f.lang || g.languages.includes(f.lang)) &&
      (!f.gender || g.gender === f.gender) &&
      (!f.interest || g.interests.includes(f.interest)) &&
      (!f.today || g.slots.some((s) => isSameDay(s, now)))
  );

  const soonest = (g) => (g.slots[0] ? g.slots[0].getTime() : Infinity);
  if (f.sort === "soonest") list.sort((a, b) => (soonest(a) === soonest(b) ? 0 : soonest(a) < soonest(b) ? -1 : 1));
  if (f.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  if (f.sort === "experience") list.sort((a, b) => b.years - a.years);

  els.count.textContent = `${list.length} ${list.length === 1 ? "GP" : "GPs"} found`;

  if (list.length === 0) {
    els.list.innerHTML = `
      <div class="empty">
        <h3>No GPs match all your filters</h3>
        <p>Try removing a filter, such as gender or “Available today”. Our GPs' schedules change daily, so new times open up often.</p>
        <button class="btn btn-ghost btn-sm" type="button" data-reset>Clear all filters</button>
      </div>`;
    return;
  }

  els.list.innerHTML = list
    .map((g) => {
      const next = g.slots[0];
      const isToday = next && isSameDay(next, now);
      const nextText = next ? `${dayLabel(next)}, ${timeLabel(next)}` : "No times this week";
      return `
      <article class="gp-card">
        <div class="avatar" style="background:${g.colour}" aria-hidden="true">${initials(g.name)}</div>
        <div>
          <h3>${g.name}</h3>
          <p class="gp-meta">${g.quals}, ${g.years} years' experience</p>
          <p class="gp-langs"><strong>Speaks:</strong> ${g.languages.join(", ")}</p>
          <div class="gp-tags">${g.interests.map((i) => `<span class="tag">${i}</span>`).join("")}</div>
        </div>
        <div class="gp-side">
          <p class="next-slot ${isToday ? "today" : ""}" style="margin:0">Next available<b>${nextText}</b></p>
          <button class="btn btn-sm" type="button" data-open="${g.id}" ${next ? "" : "disabled"}>View times</button>
        </div>
      </article>`;
    })
    .join("");
}

function resetFilters() {
  els.form.reset();
  els.sort.value = "soonest";
  render();
}

els.form.addEventListener("input", render);
els.sort.addEventListener("change", render);
els.reset.addEventListener("click", resetFilters);

// ---------- Profile dialog ----------
const dlg = document.getElementById("profile");
const p = {
  avatar: document.getElementById("p-avatar"),
  name: document.getElementById("p-name"),
  meta: document.getElementById("p-meta"),
  bio: document.getElementById("p-bio"),
  langs: document.getElementById("p-langs"),
  tags: document.getElementById("p-tags"),
  days: document.getElementById("p-days"),
  slots: document.getElementById("p-slots"),
  summary: document.getElementById("p-summary"),
  summaryText: document.getElementById("p-summary-text"),
  cont: document.getElementById("p-continue"),
};
let openGp = null;
let activeDay = null;
let chosen = null;

let byDay = new Map();

function groupByDay(slots) {
  const map = new Map();
  slots.forEach((s) => {
    const key = dayKey(s);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });
  return map;
}

function renderDays() {
  byDay = groupByDay(openGp.slots);
  const keys = [...byDay.keys()].slice(0, 4); // show up to 4 working days
  activeDay = keys[0];
  p.days.innerHTML = keys
    .map((k) => `<button type="button" class="chip" data-day="${k}">${dayLabel(byDay.get(k)[0])}</button>`)
    .join("");
}

function renderSlots() {
  p.days.querySelectorAll("[data-day]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.day === activeDay));
  });

  const slots = byDay.get(activeDay) || [];
  p.slots.innerHTML = slots.length
    ? slots
        .map((s) => `<button type="button" class="slot" data-time="${s.toISOString()}" aria-pressed="${chosen && chosen.getTime() === s.getTime()}">${timeLabel(s)}</button>`)
        .join("")
    : `<p class="slot-empty">No free times on this day.</p>`;

  if (chosen) {
    p.summary.hidden = false;
    p.summaryText.innerHTML = `<strong>${openGp.name}</strong><br>${dayLabel(chosen)} at ${timeLabel(chosen)}, 15 min appointment`;
    const q = new URLSearchParams({ gp: openGp.id, time: chosen.toISOString() });
    if (serviceParam) q.set("service", serviceParam);
    p.cont.href = `book.html?${q}`;
  } else {
    p.summary.hidden = true;
  }
}

function openProfile(id) {
  openGp = GPS.find((g) => g.id === id);
  activeDay = null;
  chosen = null;
  p.avatar.textContent = initials(openGp.name);
  p.avatar.style.background = openGp.colour;
  p.name.textContent = openGp.name;
  p.meta.textContent = `${openGp.quals}, ${openGp.years} years' experience`;
  p.bio.textContent = openGp.bio;
  p.langs.textContent = openGp.languages.join(", ");
  p.tags.innerHTML = openGp.interests.map((i) => `<span class="tag">${i}</span>`).join("");
  renderDays();
  renderSlots();
  dlg.showModal();
}

els.list.addEventListener("click", (e) => {
  const open = e.target.closest("[data-open]");
  if (open) openProfile(open.dataset.open);
  if (e.target.closest("[data-reset]")) {
    resetFilters();
    els.name.focus();
  }
});

p.days.addEventListener("click", (e) => {
  const b = e.target.closest("[data-day]");
  if (!b) return;
  activeDay = b.dataset.day;
  renderSlots();
});

p.slots.addEventListener("click", (e) => {
  const b = e.target.closest("[data-time]");
  if (!b) return;
  chosen = new Date(b.dataset.time);
  renderSlots();
  p.cont.focus({ preventScroll: false });
});

document.getElementById("p-close").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", (e) => {
  // Backdrop click only (not the dialog's scrollbar)
  if (e.target !== dlg) return;
  const r = dlg.getBoundingClientRect();
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!inside) dlg.close();
});

render();
