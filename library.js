/* ===== Paper Library — home page: cards, search, topic filter ===== */
(function () {
  const papers = (window.PAPERS || []).slice().sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  const accents = { coral: "--coral", teal: "--teal", gold: "--amber", blue: "--indigo", sky: "--violet" };

  const grid = document.getElementById("paper-grid");
  const search = document.getElementById("lib-search");
  const topicRow = document.getElementById("topic-row");
  const note = document.getElementById("result-note");

  let activeTopic = null;

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---- hero stats ----
  const live = papers.filter((p) => p.status !== "soon");
  const allTopics = [...new Set(papers.flatMap((p) => p.topics || []))];
  const years = live.map((p) => p.year);
  document.getElementById("stat-papers").textContent = live.length;
  document.getElementById("stat-topics").textContent = allTopics.length;
  document.getElementById("stat-years").textContent = years.length
    ? (Math.min(...years) === Math.max(...years) ? Math.min(...years) : `${Math.min(...years)}–${Math.max(...years)}`)
    : "—";

  // ---- topic chips (most common first) ----
  const counts = {};
  papers.forEach((p) => (p.topics || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
  const topicList = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));

  function renderTopics() {
    const chip = (label, value, n) =>
      `<button class="topic-btn${activeTopic === value ? " active" : ""}" data-topic="${esc(value ?? "")}">${esc(label)}${n != null ? `<span class="count">${n}</span>` : ""}</button>`;
    topicRow.innerHTML = chip("All", null, papers.length) + topicList.map((t) => chip(t, t, counts[t])).join("");
  }

  topicRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".topic-btn");
    if (!btn) return;
    const t = btn.dataset.topic || null;
    activeTopic = activeTopic === t ? null : t;
    renderTopics();
    renderCards();
  });

  // ---- cards ----
  function card(p) {
    const accent = `var(${accents[p.accent] || "--indigo"})`;
    const soon = p.status === "soon";
    const href = p.url || `papers/${p.id}.html`;
    const inner = `
      <p class="venue"><span>${esc(p.venue)} ${esc(p.year)}</span>${soon ? '<span class="status">In progress</span>' : ""}</p>
      <h3>${esc(p.title)}</h3>
      ${p.fullTitle && p.fullTitle !== p.title ? `<p class="full-title">${esc(p.fullTitle)}</p>` : ""}
      <p class="authors">${esc(p.authors)}</p>
      <p class="hook">${esc(p.hook)}</p>
      ${p.interactive ? `<p class="interactive"><span class="ic" aria-hidden="true">◐</span><span>${esc(p.interactive)}</span></p>` : ""}
      <div class="topics">${(p.topics || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <span class="go">${soon ? "Coming soon" : "Open deep dive →"}</span>`;
    return soon
      ? `<div class="lib-card soon" style="--accent:${accent}">${inner}</div>`
      : `<a class="lib-card" style="--accent:${accent}" href="${esc(href)}">${inner}</a>`;
  }

  function matches(p, q) {
    if (activeTopic && !(p.topics || []).includes(activeTopic)) return false;
    if (!q) return true;
    const hay = [p.title, p.fullTitle, p.authors, p.venue, p.year, p.hook, ...(p.topics || [])].join(" ").toLowerCase();
    return q.split(/\s+/).every((w) => hay.includes(w));
  }

  function renderCards() {
    const q = search.value.trim().toLowerCase();
    const shown = papers.filter((p) => matches(p, q));
    grid.innerHTML = shown.length
      ? shown.map(card).join("")
      : `<div class="empty-state">No papers match${q ? ` “${esc(q)}”` : ""}${activeTopic ? ` in <b>${esc(activeTopic)}</b>` : ""}. <button type="button" id="clear-filters">Clear filters</button></div>`;
    const filtered = q || activeTopic;
    note.textContent = filtered ? `Showing ${shown.length} of ${papers.length}` : "";
  }

  grid.addEventListener("click", (e) => {
    if (e.target.id !== "clear-filters") return;
    search.value = "";
    activeTopic = null;
    renderTopics();
    renderCards();
    search.focus();
  });

  search.addEventListener("input", renderCards);
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== search) { e.preventDefault(); search.focus(); }
    if (e.key === "Escape" && document.activeElement === search) { search.value = ""; renderCards(); }
  });

  renderTopics();
  renderCards();
})();
