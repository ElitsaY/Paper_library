/* ===== Paper Library — shared chart helpers (SVG builder, hover tooltip, horizontal row-chart frame) ===== */

const SVG_NS = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function el(tag, attrs = {}, text) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

/* ---------- shared hover tooltip ---------- */
const tip = document.getElementById('viz-tip') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'viz-tip', className: 'viz-tip', hidden: true }));
tip.setAttribute('role', 'tooltip');
function bindTip(node, html) {
  const show = e => {
    tip.innerHTML = html;
    tip.hidden = false;
    const x = e.clientX ?? node.getBoundingClientRect().left;
    const y = e.clientY ?? node.getBoundingClientRect().top;
    const w = tip.offsetWidth;
    tip.style.left = Math.min(window.innerWidth - w - 12, Math.max(12, x + 14)) + 'px';
    tip.style.top = (y + 16) + 'px';
  };
  node.addEventListener('mousemove', show);
  node.addEventListener('mouseenter', show);
  node.addEventListener('mouseleave', () => { tip.hidden = true; });
}
window.addEventListener('scroll', () => { tip.hidden = true; }, { passive: true });

/* Horizontal dot/dumbbell/bar charts share one layout: label column + value axis. */
/* Drawn at the SVG's real pixel width so text stays legible; on narrow screens each
   row's label moves above its mark instead of sitting in a left column. */
function frame(svg, { rows, rowH = 40, labelW = 190, min = 0, max = 100, ticks, top = 8, bottom = 28, right = 48 }) {
  const width = Math.max(260, Math.round(svg.parentNode.clientWidth - 2) || 720);
  const stacked = width < 520;
  const lw = stacked ? 8 : labelW;
  const rh = stacked ? rowH + 16 : rowH;
  const height = top + rows * rh + bottom;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('width', width);
  svg.innerHTML = svg.querySelector('title')?.outerHTML + svg.querySelector('desc')?.outerHTML;
  const x = v => lw + ((v - min) / (max - min)) * (width - lw - right);
  const g = el('g', { class: 'axis' });
  ticks.forEach(t => {
    g.appendChild(el('line', { x1: x(t), x2: x(t), y1: top - 4, y2: top + rows * rh, class: 'grid' }));
    g.appendChild(el('text', { x: x(t), y: top + rows * rh + 18, 'text-anchor': 'middle', class: 'tick' }, t));
  });
  svg.appendChild(g);
  const y = i => top + i * rh + rh / 2 + (stacked ? 8 : 0);
  return {
    x, y, lw, width, rh, stacked,
    hitY: i => top + i * rh,
    label: (i, text, strong) => stacked
      ? el('text', { x: lw, y: y(i) - 15, class: 'row-label' + (strong ? ' strong' : '') }, text)
      : el('text', { x: lw - 14, y: y(i) + 5, 'text-anchor': 'end', class: 'row-label' + (strong ? ' strong' : '') }, text),
  };
}
