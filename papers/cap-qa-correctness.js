/* ===== CAP (How Correct Is Your Answer?) — deep-dive interactivity ===== */

/* ---------- taxonomy (Eq. 1, Tables 7, 17, 18) + real CAP-Correctness rows ---------- */
// rel: relation between this class and the NEXT one in Eq. (1)
const CLASSES = [
  { key: 'exact', name: 'Exact', rel: '≈', rank: 6,
    def: 'Semantically identical to the gold answer.',
    instr: 'Reproduce the gold answer verbatim.',
    ex: { q: 'Which reflects light?', g: 'mirror', a: 'mirror', sg: 'Mirror reflects light.', sp: 'Mirror reflects light.', src: 'ARC-Easy' } },
  { key: 'equivalent', name: 'Equivalent', rel: '≈', rank: 6,
    def: 'Same meaning expressed through linguistic variation or paraphrasing.',
    instr: 'Express the same meaning as the gold answer using different wording. Do not omit or add information.',
    ex: { q: 'Matter in the gas phase has', g: 'fluctuating volume', a: 'variable volume', sg: 'Matter in the gas phase has fluctuating volume.', sp: 'Matter in the gas phase has variable volume.', src: 'OpenBookQA' } },
  { key: 'alternative_correct', name: 'Alternative-correct', rel: '≥', rank: 6,
    def: 'Different but still semantically correct answer.',
    instr: 'Produce a different but equally valid answer to the question. The answer must be factually correct and must not be entailed by the gold answer in either direction.',
    ex: { q: 'Rubber can protect from', g: 'electricity', a: 'heat', sg: 'Rubber can protect from electricity.', sp: 'Rubber can protect from heat.', src: 'OpenBookQA' } },
  { key: 'overinclusive_valid', name: 'Overinclusive-valid', rel: '>', rank: 5,
    def: 'Correct answer with additional valid information.',
    instr: 'Include the full content of the gold answer and add one short piece of additional information that is factually correct and relevant to the question.',
    ex: { q: 'Hummingbirds gather nectar using their', g: 'bills', a: 'bills, which are specially adapted long beaks for accessing flowers.', sg: 'Hummingbirds gather nectar using their bills.', sp: 'Hummingbirds gather nectar using their bills, which are specially adapted long beaks for accessing flowers.', src: 'OpenBookQA' } },
  { key: 'partial', name: 'Partial', rel: '>', rank: 4,
    def: 'Contains only part of the required information.',
    instr: 'Reproduce a strict subset of the information in the gold answer. Do not add information beyond what the gold states.',
    ex: { q: 'A glacier is made of', g: 'solid water', a: 'water', sg: 'A glacier is made of solid water.', sp: 'A glacier is made of water.', src: 'OpenBookQA' } },
  { key: 'overinclusive_invalid', name: 'Overinclusive-invalid', rel: '>', rank: 2,
    def: 'Correct answer with additional incorrect information.',
    instr: 'Include the full content of the gold answer and add one short piece of additional information that is factually incorrect or unsupported.',
    ex: { q: 'In animal skin tissue, cell division is responsible for', g: 'growth and repair', a: 'growth and repair, and also digestion', sg: 'In animal skin tissue, cell division is responsible for growth and repair.', sp: 'In animal skin tissue, cell division is responsible for growth and repair, and also digestion.', src: 'ARC-Easy' } },
  { key: 'invalid', name: 'Invalid', rel: '≥', rank: 1,
    def: 'Semantically incorrect answer.',
    instr: 'Produce a plausible-sounding answer to the question that is factually wrong. Do not directly contradict the gold answer.',
    ex: { q: 'A magnet will stick to', g: 'a belt buckle', a: 'a paper plate', sg: 'A magnet will stick to a belt buckle.', sp: 'A magnet will stick to a paper plate.', src: 'OpenBookQA' } },
  { key: 'contradictory', name: 'Contradictory', rel: null, rank: 0,
    def: 'Explicitly contradicts the gold answer or question premise.',
    instr: 'Produce an answer that directly contradicts the gold answer or rejects the premise of the question.',
    ex: { q: 'One renewable fuel source is', g: 'vegetable oil', a: 'fossil fuel', sg: 'One renewable fuel source is vegetable oil.', sp: 'One renewable fuel source is fossil fuel.', src: 'OpenBookQA' } },
];

// Mean CAP (×100) per class. Tables 17 (CAP-Correctness, 1,638 human-validated subset) and 5 (LLM answers); n from Table 6.
const SOURCES = [
  { id: 'syn', name: 'Synthetic labels', means: [98.79, 84.59, 36.74, 50.07, 83.61, 39.20, 13.04, 3.18] },
  { id: 'hum', name: 'Human labels', means: [98.62, 86.76, 31.74, 49.91, 77.98, 38.46, 14.56, 4.22] },
  { id: 'gpt', name: 'GPT-4o', means: [97.27, 78.81, 31.59, 40.32, 35.64, 36.58, 25.70, 18.18], n: [111, 268, 235, 213, 37, 6, 123, 6] },
  { id: 'gem', name: 'Gemini 2.0 Flash', means: [91.20, 70.66, 26.77, 44.08, 48.87, 38.82, 38.75, 28.16], n: [84, 232, 102, 114, 251, 7, 206, 3] },
  { id: 'qwen', name: 'Qwen3-8B', means: [98.87, 80.18, 29.65, 47.47, 46.87, 28.38, 23.26, 4.53], n: [48, 296, 242, 225, 73, 16, 91, 8] },
];

/* ---------- taxonomy explorer ---------- */
function initTaxonomy() {
  const ladder = document.getElementById('cap-ladder');
  const info = document.getElementById('cap-tax-info');
  ladder.innerHTML = CLASSES.map((c, i) => `
    <li><button class="cap-rung" data-i="${i}" role="tab" style="--t:${i / 7}">
      <span class="num">${i + 1}</span><span class="nm">${esc(c.name)}</span><span class="df">${esc(c.def)}</span>
    </button></li>
    ${c.rel ? `<li class="rel" aria-label="${c.rel === '≈' ? 'about equal to' : c.rel === '≥' ? 'at least as good as' : 'better than'}">${c.rel}</li>` : ''}`).join('');

  function select(i) {
    const c = CLASSES[i], e = c.ex;
    ladder.querySelectorAll('.cap-rung').forEach(b => {
      const on = +b.dataset.i === i;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });
    const syn = SOURCES[0].means[i], hum = SOURCES[1].means[i];
    info.innerHTML = `
      <p class="eyebrow" style="margin:0 0 0.2rem;">Class ${i + 1} of 8</p>
      <h4>${esc(c.name)}</h4>
      <p class="def">${esc(c.def)}</p>
      <div class="cap-ex">
        <p><span class="k">Question</span>${esc(e.q)}</p>
        <p><span class="k">Gold</span>${esc(e.g)}</p>
        <p class="pred"><span class="k">Candidate</span>${esc(e.a)}</p>
        <p class="stmt"><span class="k">s<sub>g</sub></span>${esc(e.sg)}</p>
        <p class="stmt"><span class="k">s<sub>p</sub></span>${esc(e.sp)}</p>
        <p class="src">Real CAP-Correctness row (${esc(e.src)}), human-confirmed label. The statements are the ones released in the dataset.</p>
      </div>
      <dl>
        <dt>Generation instruction (Table 18)</dt><dd>${esc(c.instr)}</dd>
        <dt>Mean CAP for this class</dt><dd>${syn.toFixed(1)} (synthetic labels) · ${hum.toFixed(1)} (human labels)</dd>
      </dl>`;
  }
  ladder.addEventListener('click', e => {
    const b = e.target.closest('.cap-rung');
    if (!b) return;
    select(+b.dataset.i);
    // Single-column layout: the detail panel sits below the ladder, so bring it into view.
    if (window.innerWidth < 760) info.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  select(4);
}

/* ---------- CAP calculator ---------- */
// Illustrative NLI outputs for each pattern the paper describes (not real model outputs).
const PRESETS = {
  equivalent: { name: 'Equivalent', gp: [0.95, 0.04], pg: [0.94, 0.05] },
  partial: { name: 'Partial', gp: [0.90, 0.08], pg: [0.10, 0.85] },
  ov: { name: 'Overinclusive-valid', gp: [0.15, 0.80], pg: [0.92, 0.06] },
  alt: { name: 'Alternative-correct', gp: [0.08, 0.62], pg: [0.07, 0.63] },
  contra: { name: 'Contradictory', gp: [0.01, 0.02], pg: [0.01, 0.03] },
};
const state = { gp: [...PRESETS.partial.gp], pg: [...PRESETS.partial.pg], alpha: 0.85, lambda: 0.3 };

const D = ([e, n], lam) => e + lam * n;
const capOf = (gp, pg, a, lam) => a * D(gp, lam) + (1 - a) * D(pg, lam);

function dirPanel(id, title, sub, key) {
  const el = document.getElementById(id);
  el.innerHTML = `
    <h5>${title}</h5><p class="sub">${sub}</p>
    <div class="cap-stack" aria-hidden="true"><i class="e"></i><i class="n"></i><i class="c"></i></div>
    <p class="cap-key" aria-hidden="true"><span><i class="e"></i>entailment</span><span><i class="n"></i>neutral</span><span><i class="c"></i>contradiction</span></p>
    <div class="slider-group"><label>P(entailment) <span class="val" data-v="e"></span></label><input type="range" min="0" max="1" step="0.01" data-k="e"></div>
    <div class="slider-group"><label>P(neutral) <span class="val" data-v="n"></span></label><input type="range" min="0" max="1" step="0.01" data-k="n"></div>
    <p class="contra">P(contradiction) = <b data-v="c"></b> <span>(the rest)</span></p>
    <p class="dval">D = <span data-v="d"></span></p>`;
  el.addEventListener('input', ev => {
    const k = ev.target.dataset.k;
    if (!k) return;
    let [e, n] = state[key];
    const v = +ev.target.value;
    if (k === 'e') { e = v; n = Math.min(n, 1 - e); } else { n = v; e = Math.min(e, 1 - n); }
    state[key] = [+e.toFixed(2), +n.toFixed(2)];
    document.querySelectorAll('#calc-presets button').forEach(b => b.classList.remove('active'));
    renderCalc();
  });
}

function renderDir(id, key) {
  const el = document.getElementById(id);
  const [e, n] = state[key];
  const c = Math.max(0, 1 - e - n);
  el.querySelector('[data-k="e"]').value = e;
  el.querySelector('[data-k="n"]').value = n;
  el.querySelector('[data-v="e"]').textContent = e.toFixed(2);
  el.querySelector('[data-v="n"]').textContent = n.toFixed(2);
  el.querySelector('[data-v="c"]').textContent = c.toFixed(2);
  el.querySelector('.cap-stack .e').style.width = e * 100 + '%';
  el.querySelector('.cap-stack .n').style.width = n * 100 + '%';
  el.querySelector('.cap-stack .c').style.width = c * 100 + '%';
  el.querySelector('[data-v="d"]').innerHTML = `${e.toFixed(2)} + ${state.lambda.toFixed(2)} × ${n.toFixed(2)} = <b>${D(state[key], state.lambda).toFixed(3)}</b>`;
}

function renderCalc() {
  document.getElementById('alpha-val').textContent = state.alpha.toFixed(2);
  document.getElementById('lambda-val').textContent = state.lambda.toFixed(2);
  renderDir('dir-gp', 'gp');
  renderDir('dir-pg', 'pg');
  const dgp = D(state.gp, state.lambda), dpg = D(state.pg, state.lambda);
  const cap = capOf(state.gp, state.pg, state.alpha, state.lambda);
  document.getElementById('cap-result').innerHTML = `
    <div class="cap-meter-big"><div class="fill" style="width:${cap * 100}%"></div></div>
    <p class="cap-eq">CAP = ${state.alpha.toFixed(2)} × ${dgp.toFixed(3)} + ${(1 - state.alpha).toFixed(2)} × ${dpg.toFixed(3)} = <b>${cap.toFixed(3)}</b></p>`;
  drawAlpha();
}

function initCalc() {
  dirPanel('dir-gp', 'Gold → prediction', 'Premise s<sub>g</sub>, hypothesis s<sub>p</sub>: does the gold imply the answer?', 'gp');
  dirPanel('dir-pg', 'Prediction → gold', 'Premise s<sub>p</sub>, hypothesis s<sub>g</sub>: does the answer imply the gold?', 'pg');
  const presets = document.getElementById('calc-presets');
  presets.innerHTML = Object.entries(PRESETS).map(([k, p]) => `<button class="toggle-btn${k === 'partial' ? ' active' : ''}" data-k="${k}">${esc(p.name)}</button>`).join('');
  presets.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const p = PRESETS[b.dataset.k];
    state.gp = [...p.gp];
    state.pg = [...p.pg];
    presets.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    renderCalc();
  });
  const alpha = document.getElementById('alpha'), lambda = document.getElementById('lambda');
  alpha.addEventListener('input', () => { state.alpha = +alpha.value; renderCalc(); });
  lambda.addEventListener('input', () => { state.lambda = +lambda.value; renderCalc(); });
  renderCalc();
}

/* ---------- α sweep: partial vs overinclusive-valid ---------- */
function drawAlpha() {
  const svg = document.getElementById('alpha-chart');
  const W = Math.max(260, Math.round(svg.parentNode.clientWidth - 2) || 720);
  const H = 240, L = 40, R = 16, T = 14, B = 34;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = svg.querySelector('title').outerHTML + svg.querySelector('desc').outerHTML;
  const x = a => L + a * (W - L - R), y = v => T + (1 - v) * (H - T - B);
  const lam = state.lambda;
  const P = PRESETS.partial, O = PRESETS.ov;
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    svg.appendChild(el('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'grid' }));
    svg.appendChild(el('text', { x: L - 8, y: y(v) + 4, 'text-anchor': 'end', class: 'tick' }, v));
  });
  [0, 0.25, 0.5, 0.75, 1].forEach(a => svg.appendChild(el('text', { x: x(a), y: H - B + 18, 'text-anchor': 'middle', class: 'tick' }, a)));
  svg.appendChild(el('text', { x: W - R, y: H - 2, 'text-anchor': 'end', class: 'tick' }, 'α →'));
  // paper setting
  svg.appendChild(el('line', { x1: x(0.85), x2: x(0.85), y1: T, y2: H - B, class: 'ref' }));
  const line = p => Array.from({ length: 51 }, (_, i) => i / 50).map((a, i) => `${i ? 'L' : 'M'}${x(a).toFixed(1)},${y(capOf(p.gp, p.pg, a, lam)).toFixed(1)}`).join('');
  svg.appendChild(el('path', { d: line(P), class: 'series a' }));
  svg.appendChild(el('path', { d: line(O), class: 'series b' }));
  // crossing point
  const dP = D(P.gp, lam) - D(P.pg, lam), dO = D(O.gp, lam) - D(O.pg, lam);
  const aX = (D(O.pg, lam) - D(P.pg, lam)) / (dP - dO);
  if (aX > 0 && aX < 1) {
    const yx = capOf(P.gp, P.pg, aX, lam);
    svg.appendChild(el('circle', { cx: x(aX), cy: y(yx), r: 4, class: 'cross' }));
  }
  document.getElementById('alpha-cross').textContent = aX > 0 && aX < 1 ? `lines cross at α ≈ ${aX.toFixed(2)}` : 'lines don’t cross';
  // current α marker + hover
  const a = state.alpha;
  const vp = capOf(P.gp, P.pg, a, lam), vo = capOf(O.gp, O.pg, a, lam);
  svg.appendChild(el('line', { x1: x(a), x2: x(a), y1: T, y2: H - B, class: 'cur' }));
  svg.appendChild(el('circle', { cx: x(a), cy: y(vp), r: 6, class: 'dot val' }));
  svg.appendChild(el('circle', { cx: x(a), cy: y(vo), r: 6, class: 'dot test' }));
  const lx = a > 0.6 ? x(a) - 10 : x(a) + 10, anchor = a > 0.6 ? 'end' : 'start';
  // Nudge the two value labels apart when the lines are close (the higher value goes above).
  const gap = Math.abs(y(vp) - y(vo)) < 18, mid = (y(vp) + y(vo)) / 2;
  const [yp, yo] = !gap ? [y(vp) + 4, y(vo) + 4] : vp >= vo ? [mid - 6, mid + 14] : [mid + 14, mid - 6];
  svg.appendChild(el('text', { x: lx, y: yp, 'text-anchor': anchor, class: 'val-label strong' }, vp.toFixed(2)));
  svg.appendChild(el('text', { x: lx, y: yo, 'text-anchor': anchor, class: 'val-label strong' }, vo.toFixed(2)));
  const hit = el('rect', { x: L, y: T, width: W - L - R, height: H - T - B, class: 'hit' });
  svg.appendChild(hit);
  bindTip(hit, `<b>α = ${a.toFixed(2)}</b> (drag the α slider)<br><span class="k">Partial</span> ${vp.toFixed(3)}<br><span class="k">Overincl.-valid</span> ${vo.toFixed(3)}`);
}

/* ---------- metric comparison ---------- */
const METRICS = [
  { m: 'BLEU', rho: [10.95, 8.55, 13.25], tau: [8.31, 6.41, 10.12], pair: 51.57, viol: 14 },
  { m: 'ROUGE-L', rho: [16.67, 14.29, 19.08], tau: [13.00, 11.04, 14.95], pair: 55.35, viol: 12 },
  { m: 'METEOR', rho: [14.70, 12.41, 17.01], tau: [11.45, 9.62, 13.27], pair: 53.71, viol: 12 },
  { m: 'BERTScore', rho: [16.10, 13.82, 18.39], tau: [10.90, 9.22, 12.63], pair: 56.18, viol: 11 },
  { m: 'COMET', rho: [26.88, 24.77, 28.99], tau: [19.57, 17.98, 21.18], pair: 61.10, viol: 9 },
  { m: 'CAP', rho: [60.37, 58.56, 62.11], tau: [48.83, 47.32, 50.35], pair: 77.70, viol: 4, ours: true },
];
const MEASURES = [
  { id: 'rho', name: 'Spearman ρ', note: 'Rank correlation with the taxonomy order (×100), with 95% CI. Higher is better.', get: d => d.rho[0], ci: d => d.rho, max: 70, ticks: [0, 20, 40, 60], fmt: v => v.toFixed(2) },
  { id: 'tau', name: 'Kendall τ', note: 'Rank correlation with the taxonomy order (×100), with 95% CI. Higher is better.', get: d => d.tau[0], ci: d => d.tau, max: 70, ticks: [0, 20, 40, 60], fmt: v => v.toFixed(2) },
  { id: 'pair', name: 'Pairwise accuracy', note: 'Share of class-ordered answer pairs ranked correctly. Chance = 50%.', get: d => d.pair, max: 100, ticks: [0, 25, 50, 75, 100], chance: 50, fmt: v => v.toFixed(2) + '%' },
  { id: 'viol', name: 'Order violations', note: 'Class pairs (out of 25) whose mean scores are in the wrong order. Lower is better.', get: d => d.viol, max: 25, ticks: [0, 5, 10, 15, 20, 25], fmt: v => `${v} / 25` },
];

function drawResults(mid) {
  const M = MEASURES.find(x => x.id === mid);
  document.getElementById('res-note').textContent = M.note;
  const svg = document.getElementById('res-chart');
  const f = frame(svg, { rows: METRICS.length, rowH: 34, labelW: 110, max: M.max, ticks: M.ticks, right: 70 });
  if (M.chance) {
    svg.appendChild(el('line', { x1: f.x(M.chance), x2: f.x(M.chance), y1: 2, y2: f.y(METRICS.length - 1) + f.rh / 2, class: 'chance' }));
  }
  METRICS.forEach((d, i) => {
    const v = M.get(d), yy = f.y(i);
    const g = el('g', { class: 'row' + (d.ours ? ' ours' : ''), tabindex: 0 });
    g.appendChild(el('rect', { x: 0, y: f.hitY(i), width: f.width, height: f.rh, class: 'hit' }));
    g.appendChild(f.label(i, d.m, d.ours));
    g.appendChild(el('rect', { x: f.x(0), y: yy - 7, width: Math.max(2, f.x(v) - f.x(0)), height: 14, rx: 4, class: 'bar ' + (d.ours ? 'hl' : 'muted') }));
    let endX = f.x(v);
    if (M.ci) {
      const [, lo, hi] = M.ci(d);
      g.appendChild(el('line', { x1: f.x(lo), x2: f.x(hi), y1: yy, y2: yy, class: 'ci' }));
      g.appendChild(el('line', { x1: f.x(lo), x2: f.x(lo), y1: yy - 5, y2: yy + 5, class: 'ci' }));
      g.appendChild(el('line', { x1: f.x(hi), x2: f.x(hi), y1: yy - 5, y2: yy + 5, class: 'ci' }));
      endX = f.x(hi);
    }
    g.appendChild(el('text', { x: endX + 8, y: yy + 4, class: 'val-label' + (d.ours ? ' strong' : '') }, M.fmt(v)));
    svg.appendChild(g);
    bindTip(g, `<b>${esc(d.m)}</b><br><span class="k">Spearman ρ</span> ${d.rho[0]} [${d.rho[1]}, ${d.rho[2]}]<br><span class="k">Kendall τ</span> ${d.tau[0]} [${d.tau[1]}, ${d.tau[2]}]<br><span class="k">Pairwise</span> ${d.pair}%<br><span class="k">Violations</span> ${d.viol} / 25`);
  });
}

function initResults() {
  const row = document.getElementById('res-measure');
  let cur = 'rho';
  row.innerHTML = MEASURES.map(m => `<button class="toggle-btn${m.id === cur ? ' active' : ''}" data-m="${m.id}">${esc(m.name)}</button>`).join('');
  row.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    cur = b.dataset.m;
    row.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    drawResults(cur);
  });
  document.getElementById('res-table').innerHTML = METRICS.map(d =>
    `<tr${d.ours ? ' class="cap-best"' : ''}><td>${d.m}</td><td>${d.rho[0]} [${d.rho[1]}, ${d.rho[2]}]</td><td>${d.tau[0]} [${d.tau[1]}, ${d.tau[2]}]</td><td>${d.pair}</td><td>${d.viol} / 25</td></tr>`).join('');
  drawResults(cur);
  return () => drawResults(cur);
}

/* ---------- hard neighboring pairs: small multiples (Table 4) ---------- */
const PAIRS = [
  { t: 'Equivalent > Partial', v: [36.47, 23.21, 41.31, 51.86, 47.36, 59.73] },
  { t: 'Overincl.-valid > Partial', v: [51.42, 27.37, 70.66, 32.02, 26.88, 16.34] },
  { t: 'Overincl.-valid > Overincl.-invalid', v: [34.80, 27.74, 36.38, 30.88, 41.61, 69.48] },
  { t: 'Alt.-correct > Invalid', v: [36.78, 35.74, 39.86, 57.21, 61.01, 73.20] },
];
function drawPairs() {
  const grid = document.getElementById('pairs-grid');
  grid.innerHTML = PAIRS.map((p, i) => `<div class="sim-panel cap-pair"><h5>${esc(p.t)}</h5><svg class="viz" id="pair-${i}" role="img" aria-label="${esc(p.t)}: ${METRICS.map((m, j) => `${m.m} ${p.v[j]}`).join(', ')}"><title>${esc(p.t)}</title><desc></desc></svg></div>`).join('');
  PAIRS.forEach((p, i) => {
    const svg = document.getElementById('pair-' + i);
    const f = frame(svg, { rows: METRICS.length, rowH: 24, labelW: 84, ticks: [0, 50, 100], right: 44, bottom: 22 });
    svg.appendChild(el('line', { x1: f.x(50), x2: f.x(50), y1: 2, y2: f.y(METRICS.length - 1) + f.rh / 2, class: 'chance' }));
    const best = Math.max(...p.v);
    METRICS.forEach((d, j) => {
      const v = p.v[j], yy = f.y(j);
      const g = el('g', { class: 'row', tabindex: 0 });
      g.appendChild(el('rect', { x: 0, y: f.hitY(j), width: f.width, height: f.rh, class: 'hit' }));
      g.appendChild(f.label(j, d.m, d.ours));
      g.appendChild(el('circle', { cx: f.x(v), cy: yy, r: 5.5, class: 'dot ' + (d.ours ? 'test' : 'neutral') }));
      g.appendChild(el('text', { x: f.x(v) + 9, y: yy + 4, class: 'val-label' + (v === best ? ' strong' : '') }, v.toFixed(1)));
      svg.appendChild(g);
      bindTip(g, `<b>${esc(d.m)}</b> · ${esc(p.t)}<br>${v.toFixed(2)}% of pairs ordered correctly ${v < 50 ? '(below chance)' : ''}`);
    });
  });
}

/* ---------- class-mean ladder ---------- */
function violations(means) {
  // strict pairs (i above j with higher rank): violation if mean_i <= mean_j
  const flagged = new Set();
  let count = 0;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    if (CLASSES[i].rank > CLASSES[j].rank && means[i] <= means[j]) { count++; flagged.add(i); flagged.add(j); }
  }
  return { count, flagged };
}

function drawLadder(sid) {
  const S = SOURCES.find(s => s.id === sid);
  const svg = document.getElementById('lad-chart');
  const f = frame(svg, { rows: 8, rowH: 32, labelW: 170, ticks: [0, 25, 50, 75, 100], right: S.n ? 96 : 56 });
  const { count, flagged } = violations(S.means);
  CLASSES.forEach((c, i) => {
    const v = S.means[i], yy = f.y(i);
    const out = flagged.has(i);
    const g = el('g', { class: 'row', tabindex: 0 });
    g.appendChild(el('rect', { x: 0, y: f.hitY(i), width: f.width, height: f.rh, class: 'hit' }));
    g.appendChild(f.label(i, `${i + 1}. ${c.name}`));
    g.appendChild(el('line', { x1: f.x(0), x2: f.x(v), y1: yy, y2: yy, class: 'lollipop' }));
    g.appendChild(el('circle', { cx: f.x(v), cy: yy, r: 7, class: 'dot ' + (out ? 'test' : 'val') }));
    g.appendChild(el('text', { x: f.x(v) + 12, y: yy + 4, class: 'val-label' + (out ? ' strong' : '') }, v.toFixed(1) + (out ? ' ⚑' : '')));
    if (S.n) g.appendChild(el('text', { x: f.width - 4, y: yy + 4, 'text-anchor': 'end', class: 'val-label muted' }, `n=${S.n[i]}`));
    svg.appendChild(g);
    const inv = CLASSES.map((d, j) => j).filter(j => (CLASSES[i].rank > CLASSES[j].rank && v <= S.means[j]) || (CLASSES[j].rank > CLASSES[i].rank && S.means[j] <= v));
    bindTip(g, `<b>${esc(c.name)}</b> · ${esc(S.name)}<br><span class="k">Mean CAP</span> ${v.toFixed(2)}` + (S.n ? `<br><span class="k">Answers</span> ${S.n[i]}` : '') +
      (inv.length ? `<br><span class="k">Out of order with</span> ${inv.map(j => esc(CLASSES[j].name)).join(', ')}` : ''));
  });
  document.getElementById('lad-viol').innerHTML = `<b>${count} / 25</b> ordered class pairs are inverted for ${esc(S.name)}. <span>⚑ marks classes involved in an inversion.</span>`;
}

function initLadder() {
  const row = document.getElementById('lad-source');
  let cur = 'syn';
  row.innerHTML = SOURCES.map(s => `<button class="toggle-btn${s.id === cur ? ' active' : ''}" data-s="${s.id}">${esc(s.name)}</button>`).join('');
  row.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    cur = b.dataset.s;
    row.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    drawLadder(cur);
  });
  drawLadder(cur);
  return () => drawLadder(cur);
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTaxonomy();
  initCalc();
  const redrawResults = initResults();
  drawPairs();
  const redrawLadder = initLadder();
  let w = window.innerWidth, t;
  window.addEventListener('resize', () => {
    if (window.innerWidth === w) return;
    w = window.innerWidth;
    clearTimeout(t);
    t = setTimeout(() => { redrawResults(); drawPairs(); redrawLadder(); drawAlpha(); }, 120);
  });
});
