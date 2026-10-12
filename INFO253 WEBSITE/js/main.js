/* =========================================================
   Shared header + footer for every page.
   Edit the NAV list once here and every page updates.
   Each page sets <body data-page="services"> etc. so the
   current link gets highlighted.
   ========================================================= */

const SITE = {
  name: "Kōwhai Health",
  tagline: "Online GP clinic, Aotearoa",
};

// href = file name. Teammates' pages (index/book/login) can be added here.
const NAV = [
  { id: "home", label: "Home", href: "index.html" },
  { id: "about", label: "About us", href: "about.html" },
  { id: "services", label: "Services", href: "services.html" },
  { id: "find-gp", label: "Find a GP", href: "find-gp.html" },
  { id: "faq", label: "FAQ", href: "faq.html" },
];
const NAV_CTA = { label: "Book appointment", href: "book.html" };

const BRAND_MARK = `
<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="19" fill="#1F6E5A"/>
  <g fill="#F2B632">
    <ellipse cx="20" cy="11" rx="4" ry="7"/>
    <ellipse cx="12.5" cy="22" rx="4" ry="7" transform="rotate(-50 12.5 22)"/>
    <ellipse cx="27.5" cy="22" rx="4" ry="7" transform="rotate(50 27.5 22)"/>
  </g>
  <rect x="18.5" y="16" width="3" height="16" rx="1.5" fill="#FFFFFF"/>
</svg>`;

function renderHeader(current) {
  const links = NAV.map(
    (n) =>
      `<li><a href="${n.href}"${n.id === current ? ' aria-current="page"' : ""}>${n.label}</a></li>`
  ).join("");

  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="emergency" role="note">
    <div class="wrap">
      <strong>Emergency? Call 111.</strong>
      For free health advice any time, call Healthline on <a href="tel:0800611116">0800 611 116</a>.
    </div>
  </div>
  <header class="site-header">
    <div class="wrap">
      <a class="brand" href="index.html">${BRAND_MARK}
        <span>${SITE.name}<small>${SITE.tagline}</small></span>
      </a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
      <nav class="site-nav" id="site-nav" aria-label="Main">
        <ul class="nav-list">
          ${links}
          <li class="nav-cta"><a href="${NAV_CTA.href}"${current === "book" ? ' aria-current="page"' : ""}>${NAV_CTA.label}</a></li>
        </ul>
      </nav>
    </div>
  </header>`;
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <h4>${SITE.name}</h4>
          <p>Video and phone GP appointments for people anywhere in New Zealand, 7am to 10pm, seven days.</p>
          <p>Support: <a href="mailto:help@kowhaihealth.example">help@kowhaihealth.example</a></p>
        </div>
        <div>
          <h4>Care</h4>
          <ul>
            <li><a href="services.html">Services and fees</a></li>
            <li><a href="find-gp.html">Find a GP</a></li>
            <li><a href="book.html">Book appointment</a></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="faq.html#privacy">Privacy and records</a></li>
            <li><a href="about.html">About us</a></li>
          </ul>
        </div>
        <div>
          <h4>Urgent help</h4>
          <ul>
            <li>Emergency: <a href="tel:111">111</a></li>
            <li>Healthline: <a href="tel:0800611116">0800 611 116</a></li>
            <li>Need to talk? Free call or text <a href="tel:1737">1737</a></li>
          </ul>
        </div>
      </div>
      <p class="footer-note">© ${year} ${SITE.name}. A fictional clinic created for an INFO 253 student prototype, University of Canterbury. Not a real medical service.</p>
    </div>
  </footer>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const current = document.body.dataset.page;
  const headerSlot = document.querySelector("[data-include='header']");
  const footerSlot = document.querySelector("[data-include='footer']");
  if (headerSlot) headerSlot.outerHTML = renderHeader(current);
  if (footerSlot) footerSlot.outerHTML = renderFooter();

  // Mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    });
  }
});

// Small helper used by several pages
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
