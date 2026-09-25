/* ===== Stylometric code detection — deep-dive interactivity ===== */

/* ---------- chart 1: validation vs test dumbbell ---------- */
function drawCliff() {
  const svg = document.getElementById('cliff-chart');
  const data = [
    { m: 'GraphCodeBERT', val: 98.21, test: 25.11 },
    { m: 'CodeT5+ encoder', val: 97.46, test: 49.39 },
    { m: 'CodeRankLLM', val: 95.27, test: 33.65 },
    { m: 'This paper', val: null, test: 67.35, ours: true },
  ];
  const f = frame(svg, { rows: data.length, rowH: 46, ticks: [0, 25, 50, 75, 100] });
  data.forEach((d, i) => {
    const y = f.y(i);
    const g = el('g', { class: 'row' + (d.ours ? ' ours' : ''), tabindex: 0 });
    g.appendChild(el('rect', { x: 0, y: f.hitY(i), width: f.width, height: f.rh, class: 'hit' }));
    g.appendChild(f.label(i, d.val == null && f.stacked ? `${d.m} · validation not reported` : d.m, d.ours));
    if (d.val != null) {
      g.appendChild(el('line', { x1: f.x(d.test), x2: f.x(d.val), y1: y, y2: y, class: 'connector' }));
      g.appendChild(el('circle', { cx: f.x(d.val), cy: y, r: 7, class: 'dot val' }));
      g.appendChild(el('text', { x: f.x(d.val) + 12, y: y + 4, class: 'val-label' }, d.val.toFixed(1)));
    } else if (!f.stacked) {
      g.appendChild(el('text', { x: f.x(d.test) + 14, y: y + 4, class: 'val-label muted' }, 'validation not reported'));
    }
    g.appendChild(el('circle', { cx: f.x(d.test), cy: y, r: 7, class: 'dot test' }));
    g.appendChild(el('text', { x: f.x(d.test) - 12, y: y + 4, 'text-anchor': 'end', class: 'val-label' }, d.test.toFixed(1)));
    svg.appendChild(g);
    bindTip(g, `<b>${esc(d.m)}</b><br><span class="k">Validation</span> ${d.val != null ? d.val.toFixed(2) : '—'}<br><span class="k">Test</span> ${d.test.toFixed(2)}` +
      (d.val != null ? `<br><span class="k">Drop</span> −${(d.val - d.test).toFixed(2)} pts` : ''));
  });
}

/* ---------- chart 2: Markdown leak rate ---------- */
function drawLeak() {
  const svg = document.getElementById('leak-chart');
  const data = [
    ['Qwen2.5-Coder-1.5B-Instruct', 87.28],
    ['Yi-Coder-1.5B-Chat', 74.39],
    ['Qwen2.5-Coder-7B-Instruct', 66.18],
    ['Phi-3.5-mini-instruct', 59.81],
    ['Phi-3-medium-4k-instruct', 35.78],
  ];
  const f = frame(svg, { rows: data.length, rowH: 34, labelW: 230, ticks: [0, 25, 50, 75, 100], right: 56 });
  data.forEach(([m, v], i) => {
    const y = f.y(i);
    const g = el('g', { class: 'row', tabindex: 0 });
    g.appendChild(el('rect', { x: 0, y: f.hitY(i), width: f.width, height: f.rh, class: 'hit' }));
    g.appendChild(f.label(i, m));
    g.appendChild(el('rect', { x: f.x(0), y: y - 8, width: f.x(v) - f.x(0), height: 16, rx: 4, class: 'bar' }));
    g.appendChild(el('text', { x: f.x(v) + 8, y: y + 4, class: 'val-label' }, v.toFixed(1) + '%'));
    svg.appendChild(g);
    bindTip(g, `<b>${esc(m)}</b><br>${v.toFixed(2)}% of snippets leak Markdown`);
  });
}

/* ---------- chart 3: threshold number line ---------- */
function drawThreshold() {
  const svg = document.getElementById('thresh-chart');
  const W = Math.max(260, Math.round(svg.parentNode.clientWidth - 2) || 720);
  const narrow = W < 560;
  const H = narrow ? 168 : 150, L = 16, R = 24, axisY = narrow ? 122 : 104;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W);
  svg.innerHTML = svg.querySelector('title')?.outerHTML + svg.querySelector('desc')?.outerHTML;
  const x = v => L + v * (W - L - R);
  svg.appendChild(el('rect', { x: x(0.3), y: axisY - 26, width: x(1) - x(0.3), height: 26, class: 'zone' }));
  svg.appendChild(el('text', { x: x(0.65), y: axisY - 9, 'text-anchor': 'middle', class: 'zone-label' }, narrow ? '→ LLM-generated' : '→ classified as LLM-generated'));
  svg.appendChild(el('line', { x1: x(0), x2: x(1), y1: axisY, y2: axisY, class: 'axis-line' }));
  [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(t => {
    svg.appendChild(el('line', { x1: x(t), x2: x(t), y1: axisY, y2: axisY + 5, class: 'axis-line' }));
    svg.appendChild(el('text', { x: x(t), y: axisY + 20, 'text-anchor': 'middle', class: 'tick' }, t));
  });
  const marks = [
    { v: 0.008, label: "Youden's J 0.008", cls: 'muted', dy: -64, anchor: 'start', tipTxt: 'The statistically "optimal" cut. Rejected: it favors catching LLM code over sparing human code.' },
    { v: 0.07, label: 'human mean 0.07', cls: 'val', dy: -26, anchor: 'start', tipTxt: 'Mean text-like ratio of human-written samples (non-zero values only).' },
    { v: 0.17, label: 'LLM mean 0.17', cls: 'test', dy: -44, anchor: 'start', tipTxt: 'Mean text-like ratio of LLM-generated samples (non-zero values only).' },
    { v: 0.3, label: 'threshold 0.3', cls: 'thr', dy: -26, anchor: 'start', tipTxt: 'Chosen threshold: 99.9% specificity on human code, flags the top 10.3% of LLM samples.' },
  ];
  if (narrow) marks.forEach((m, i) => { m.dy = -82 + i * 19; });
  marks.forEach(m => {
    const g = el('g', { class: 'mark ' + m.cls, tabindex: 0 });
    g.appendChild(el('line', { x1: x(m.v), x2: x(m.v), y1: axisY + m.dy + 4, y2: axisY, class: 'stem' }));
    g.appendChild(el('circle', { cx: x(m.v), cy: axisY, r: 6, class: 'dot' }));
    g.appendChild(el('text', { x: x(m.v) + 4, y: axisY + m.dy, 'text-anchor': m.anchor, class: 'mark-label' }, m.label));
    g.appendChild(el('rect', { x: x(m.v) - 10, y: axisY + m.dy - 14, width: 130, height: -m.dy + 22, class: 'hit' }));
    svg.appendChild(g);
    bindTip(g, `<b>${esc(m.label)}</b><br>${esc(m.tipTxt)}`);
  });
}

/* ---------- chart 4: classifier results ---------- */
function drawResults() {
  const svg = document.getElementById('results-chart');
  const data = [
    { m: 'Decision tree + heuristics', setup: 'depth 2 + the two rules (final system)', v: 67.35, ours: true },
    { m: 'Decision tree', setup: 'depth 2, Gini', v: 65.62 },
    { m: 'LogReg, tuned threshold', setup: 'liblinear, bucket scaling, threshold 0.65', v: 64.59 },
    { m: 'Linear SVC', setup: 'default parameters', v: 63.27 },
    { m: 'Logistic regression', setup: 'liblinear, default threshold', v: 63.16 },
    { m: 'Random forest', setup: '11 trees, depth 2', v: 62.25 },
    { m: 'MLP', setup: '(10, 5), tanh, adam', v: 60.25 },
  ];
  const f = frame(svg, { rows: data.length, rowH: 34, labelW: 210, min: 55, max: 70, ticks: [55, 60, 65, 70], right: 60 });
  data.forEach((d, i) => {
    const y = f.y(i);
    const g = el('g', { class: 'row' + (d.ours ? ' ours' : ''), tabindex: 0 });
    g.appendChild(el('rect', { x: 0, y: f.hitY(i), width: f.width, height: f.rh, class: 'hit' }));
    g.appendChild(f.label(i, d.m, d.ours));
    g.appendChild(el('line', { x1: f.x(55), x2: f.x(d.v), y1: y, y2: y, class: 'lollipop' }));
    g.appendChild(el('circle', { cx: f.x(d.v), cy: y, r: 7, class: 'dot ' + (d.ours ? 'test' : 'neutral') }));
    g.appendChild(el('text', { x: f.x(d.v) + 13, y: y + 4, class: 'val-label' + (d.ours ? ' strong' : '') }, d.v.toFixed(2)));
    svg.appendChild(g);
    bindTip(g, `<b>${esc(d.m)}</b><br>${esc(d.setup)}<br><span class="k">Test macro-F1</span> ${d.v.toFixed(2)}`);
  });
  document.getElementById('results-table').innerHTML =
    data.map(d => `<tr><td>${esc(d.m)}</td><td>${esc(d.setup)}</td><td>${d.v.toFixed(2)}</td></tr>`).join('');
}

/* ---------- pipeline explorer ---------- */
const STAGES = {
  input: {
    title: 'Raw code snippet',
    body: 'One snippet, fully human-written or fully machine-generated. Training covers C++, Python and Java; the test set adds Go, PHP, C#, C and JavaScript, plus research and production code.',
  },
  lang: {
    title: 'Language classifier',
    body: 'Tree-Sitter needs to know the language before it can parse, so a small classifier guesses it first.',
    facts: [['Model', 'Character 3–8-gram TF-IDF → Multinomial Naïve Bayes (α = 0.1)'], ['Trained on', 'Rosetta Code'], ['Accuracy', '95.10% on 1K public-test snippets labelled via ChatGPT-5.2'], ['Typical mix-ups', 'C ↔ C++ and C# ↔ Java. Mostly harmless, since their parse trees look alike.']],
  },
  cvt: {
    title: 'Code-vs-text line classifier',
    body: 'Labels each line as code or natural language, which catches samples where prose is mixed in with the code or replaces it. It powers the text-like ratio.',
    facts: [['Model', 'Character 3–5-gram TF-IDF → linear classifier'], ['Trained on', 'Stack Overflow code blocks (code) + Twitch chat (informal text). A dataset the authors built and released.'], ['Validation', '96.07 macro-F1 · 97.11% accuracy'], ['Hand-checked test lines', '86.43 macro-F1 · 89.47% accuracy on 30 examples. Some "text" lines in the data look a lot like code.']],
  },
  ts: {
    title: 'Tree-Sitter parsing',
    body: 'An incremental parser with grammars for all seven languages. It still produces a tree for incomplete or broken code, which matters for truncated LLM output. It is used to pull out comments reliably; spaCy then tags the verbs in them.',
  },
  feat: {
    title: 'Feature extraction',
    body: 'About 30 stylometric and syntactic features were tried. All are ratios, so snippet length matters less. After SHAP and coefficient analysis, only two stayed in the classifier: comment ratio and verb-comment ratio. Snippets are also split into small / medium / large buckets by line count, each with its own feature scaling.',
    facts: [['Buckets (from the code)', '< 20 lines · 20–70 · > 70']],
  },
  dt: {
    title: 'Decision tree (final classifier)',
    body: 'Depth 2 and Gini impurity: at most two yes/no questions about the two ratios. Small enough to read completely.',
    facts: [['Test macro-F1', '65.62 alone · 67.35 with the rules']],
  },
  lr: {
    title: 'Logistic regression (alternative)',
    body: 'Same two features. Tuning the decision threshold on validation (0.65 instead of 0.5) helps. Per-bucket thresholds looked even better on validation but did not carry over to test.',
    facts: [['Test macro-F1', '63.16 default · 64.59 at threshold 0.65']],
  },
  rules: {
    title: 'Decision logic + heuristics',
    body: 'Two rules override the classifier and mark the snippet as machine-generated: (1) a standalone language-name line such as "python", left over from a Markdown code fence; (2) a text-like ratio above 0.3. Together they add about 2 points of macro-F1.',
    link: '#rules',
  },
  out: {
    title: 'Human / machine',
    body: 'Binary label. Inference is near-instant; the whole pipeline trains on a CPU.',
  },
};

function initPipeline() {
  const pipe = document.getElementById('cd-pipe');
  const info = document.getElementById('cd-stage-info');
  function select(key) {
    pipe.querySelectorAll('.stage').forEach(b => {
      const on = b.dataset.stage === key;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });
    const s = STAGES[key];
    info.innerHTML = `<h4>${esc(s.title)}</h4><p>${esc(s.body)}</p>` +
      (s.facts ? `<dl>${s.facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : '') +
      (s.link ? `<p><a href="${s.link}">See the rules below ↓</a></p>` : '');
  }
  pipe.querySelectorAll('.stage').forEach(b => {
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => select(b.dataset.stage));
  });
  select('feat');
}

/* ---------- feature x-ray ---------- */
const PRESETS = [
  {
    name: 'Terse C++',
    code: `#include <bits/stdc++.h>
using namespace std;
int main(){
    int n; cin>>n;
    vector<long long> a(n);
    for(auto&x:a) cin>>x;
    long long best=0,cur=0;
    for(int i=0;i<n;i++){
        cur=max(0LL,cur+a[i]);
        best=max(best,cur);
    }
    cout<<best<<"\\n";
}`,
  },
  {
    name: 'Chatty comments',
    code: `def max_subarray_sum(nums):
    # Initialize the current sum and the best sum found so far
    current_sum = 0
    best_sum = 0

    # Iterate over each number in the list
    for num in nums:
        # Extend the current subarray or start a new one
        current_sum = max(0, current_sum + num)
        # Update the best sum if the current one is larger
        best_sum = max(best_sum, current_sum)

    # Return the maximum subarray sum
    return best_sum


# Example usage
print(max_subarray_sum([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
  },
  {
    name: 'Markdown leak',
    code: `python
def max_subarray_sum(nums):
    best = cur = 0
    for x in nums:
        cur = max(0, cur + x)
        best = max(best, cur)
    return best`,
  },
  {
    name: 'Prose mixed in',
    code: `Here is a simple solution to the problem using Kadane's algorithm.
def max_subarray_sum(nums):
    best = cur = 0
    for x in nums:
        cur = max(0, cur + x)
        best = max(best, cur)
    return best
This solution works by keeping a running sum and resetting it when it drops below zero.
It runs in linear time and uses constant extra space.`,
  },
];

// Standalone language names, exactly as the submission code checks the first line.
const LANG_MARKERS = new Set(['go', 'python', 'java', 'c++', 'javascript', 'c#', 'c', 'cpp']);
const PREPROCESSOR = /^#\s*(include|define|pragma|if|ifdef|ifndef|else|elif|endif|undef|import|region|endregion)\b/;
const CODE_PUNCT = /[=;{}()[\]<>]|->|::/;
const CODE_START = /^(for|if|elif|else|while|do|def|class|return|import|from|try|except|finally|with|switch|case|package|func|public|private|protected|static|int|long|void|var|let|const|using|namespace|print|echo|break|continue|pass|end|fn|struct|type|interface|async|await|yield|lambda|raise|throw|new|delete|goto)\b/;
// Stand-in for spaCy's VERB/AUX tags: auxiliaries + verbs common in code comments + -ing/-ed forms.
const VERBS = new Set(('is are was were be been being am have has had do does did will would could should may might must shall can ' +
  'check compute calculate return create initialize init iterate loop read store update find get set add print handle convert sort use ' +
  'append remove increment decrement define call parse split count build ensure move swap skip compare process write load save reset start ' +
  'output take make keep extend track fill push pop insert delete apply map filter reduce merge search traverse visit mark assign declare ' +
  'run test verify validate format join replace generate open close send receive allocate free copy compute determine collect contains ' +
  'represents returns stores creates checks computes calculates iterates updates finds gets sets adds prints handles converts sorts uses ' +
  'appends removes starts reads writes takes makes keeps extends tracks initializes').split(' '));

function isVerb(w) {
  const lw = w.toLowerCase();
  return VERBS.has(lw) || (lw.length > 4 && /(ing|ed)$/.test(lw));
}

function analyze(code) {
  const raw = code.replace(/\r/g, '').split('\n');
  const lines = [];
  let inBlock = false;
  let firstSeen = false;
  raw.forEach((text, i) => {
    const s = text.trim();
    if (!s) { lines.push({ text, kind: 'blank' }); return; }
    let kind;
    if (!firstSeen && i === raw.findIndex(t => t.trim()) && LANG_MARKERS.has(s.toLowerCase())) kind = 'marker';
    else if (inBlock) { kind = 'comment'; if (s.includes('*/')) inBlock = false; }
    else if (s.startsWith('/*')) { kind = 'comment'; if (!s.includes('*/')) inBlock = true; }
    else if (s.startsWith('//') || (s.startsWith('#') && !PREPROCESSOR.test(s))) kind = 'comment';
    else {
      const words = s.match(/[A-Za-z][A-Za-z']*/g) || [];
      kind = (!CODE_PUNCT.test(s) && !CODE_START.test(s) && words.length >= 3) ? 'text' : 'code';
    }
    firstSeen = true;
    lines.push({ text, kind });
  });

  const nonEmpty = lines.filter(l => l.kind !== 'blank');
  const n = nonEmpty.length;
  const comments = nonEmpty.filter(l => l.kind === 'comment');
  const commentWords = comments.flatMap(l => l.text.replace(/^\s*(\/\/+|#+|\/\*+|\*\/|\*)/, '').replace(/\*\/\s*$/, '').match(/[A-Za-z][A-Za-z']*/g) || []);
  const verbs = commentWords.filter(isVerb);
  const textLines = nonEmpty.filter(l => l.kind === 'text').length;
  const marker = nonEmpty[0]?.kind === 'marker';
  return {
    lines, n,
    commentRatio: n ? comments.length / n : 0,
    commentCount: comments.length,
    verbRatio: commentWords.length ? verbs.length / commentWords.length : 0,
    verbCount: verbs.length, wordCount: commentWords.length,
    textRatio: n ? textLines / n : 0, textLines,
    marker,
    bucket: n < 20 ? 'small (< 20 lines)' : n <= 70 ? 'medium (20–70)' : 'large (> 70)',
  };
}

function renderLine(l) {
  const tags = { code: 'code', comment: 'comment', text: 'prose', marker: 'lang name', blank: '' };
  let body = esc(l.text) || '&nbsp;';
  if (l.kind === 'comment') {
    body = esc(l.text).replace(/[A-Za-z][A-Za-z']*/g, w => isVerb(w) ? `<mark>${w}</mark>` : w);
  }
  return `<div class="ln ${l.kind}"><span class="tag">${tags[l.kind]}</span><code>${body}</code></div>`;
}

function meter(label, value, detail, threshold) {
  const pct = Math.min(100, value * 100);
  return `<div class="cd-meter">
    <div class="top"><span>${label}</span><b>${value.toFixed(2)}</b></div>
    <div class="track">${threshold != null ? `<i class="thr" style="left:${threshold * 100}%" title="threshold ${threshold}"></i>` : ''}<div class="fill" style="width:${pct}%"></div></div>
    <div class="detail">${detail}</div>
  </div>`;
}

function initXray() {
  const input = document.getElementById('xr-input');
  const presets = document.getElementById('xr-presets');
  const linesEl = document.getElementById('xr-lines');
  const featsEl = document.getElementById('xr-feats');
  const rulesEl = document.getElementById('xr-rules');

  presets.innerHTML = PRESETS.map((p, i) => `<button class="toggle-btn" data-i="${i}">${esc(p.name)}</button>`).join('');
  presets.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    load(+b.dataset.i);
  });

  function load(i) {
    input.value = PRESETS[i].code;
    presets.querySelectorAll('button').forEach(b => b.classList.toggle('active', +b.dataset.i === i));
    update();
  }

  function update() {
    const a = analyze(input.value);
    linesEl.innerHTML = a.n ? a.lines.map(renderLine).join('') : '<p class="muted">Paste some code above.</p>';
    featsEl.innerHTML =
      meter('Comment ratio', a.commentRatio, `${a.commentCount} comment line${a.commentCount === 1 ? '' : 's'} of ${a.n} · <span class="cd-pill keep">tree</span>`) +
      meter('Verb-comment ratio', a.verbRatio, a.wordCount ? `${a.verbCount} verb${a.verbCount === 1 ? '' : 's'} (highlighted) of ${a.wordCount} comment words · <span class="cd-pill keep">tree</span>` : 'no comment words · <span class="cd-pill keep">tree</span>') +
      meter('Text-like ratio', a.textRatio, `${a.textLines} prose line${a.textLines === 1 ? '' : 's'} of ${a.n} · <span class="cd-pill rule">rule at 0.3</span>`, 0.3) +
      `<p class="cd-bucket">Length bucket: <b>${a.bucket}</b></p>`;

    const r1 = a.marker, r2 = a.textRatio > 0.3;
    const rule = (on, name, why) => `<div class="cd-rule ${on ? 'on' : ''}"><span class="st">${on ? '✓ fires' : '— no'}</span><div><b>${name}</b><br><span>${why}</span></div></div>`;
    rulesEl.innerHTML =
      rule(r1, 'Standalone language name', r1 ? `First line is “${esc(a.lines.find(l => l.kind === 'marker').text.trim())}”` : 'First line isn’t a bare language name') +
      rule(r2, 'Text-like ratio > 0.3', `${a.textRatio.toFixed(2)} ${r2 ? '>' : '≤'} 0.3`) +
      (r1 || r2
        ? `<div class="cd-verdict machine"><b>Machine-generated</b> <span>(set by a rule, the tree is skipped)</span></div>`
        : `<div class="cd-verdict tree"><b>Up to the tree</b> <span>No rule fired, so the depth-2 tree decides from comment ratio and verb-comment ratio. Its split values aren't published, so we don't guess a label.</span></div>`);
  }

  input.addEventListener('input', () => {
    presets.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    update();
  });
  load(1);
}

/* ---------- boot ---------- */
function drawCharts() { drawCliff(); drawLeak(); drawResults(); drawThreshold(); }
document.addEventListener('DOMContentLoaded', () => {
  drawCharts();
  initPipeline();
  initXray();
  let w = window.innerWidth, t;
  window.addEventListener('resize', () => {
    if (window.innerWidth === w) return;
    w = window.innerWidth;
    clearTimeout(t);
    t = setTimeout(drawCharts, 120);
  });
});
