/* The Fin AI — shared behaviour for every page: header, nav, reveal, micro-interactions. */
(() => {
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- load-in: split headline words ---------- */
$$('.split').forEach(el => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="transition-delay:${.2 + i * .07}s">${w}</span></span>`).join(' ');
});
requestAnimationFrame(() => setTimeout(() => { document.body.classList.add('loaded'); $$('.split').forEach(el => el.classList.add('in')); }, 60));

/* ---------- header, progress, nav pill ---------- */
const header = $('#header'), prog = $('#progress'), pill = $('.nav-pill');
const current = $('#navLinks a[aria-current="page"]');
function movePill(a) {
  if (!pill) return;
  if (!a) { pill.style.opacity = 0; return; }
  pill.style.opacity = 1; pill.style.width = a.offsetWidth + 'px'; pill.style.transform = `translateX(${a.offsetLeft}px)`;
}
$$('#navLinks a').forEach(a => a.addEventListener('mouseenter', () => movePill(a)));
$('#navLinks') && $('#navLinks').addEventListener('mouseleave', () => movePill(current));
const onScroll = () => {
  const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
  header && header.classList.toggle('scrolled', y > 20);
  if (prog) prog.style.transform = `scaleX(${h ? y / h : 0})`;
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();
setTimeout(() => movePill(current), 300);
addEventListener('resize', () => movePill(current));
document.fonts && document.fonts.ready.then(() => movePill(current));

/* mobile menu */
$('#burger') && $('#burger').addEventListener('click', () => document.body.classList.toggle('menu-open'));
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => document.body.classList.remove('menu-open')));

/* ---------- magnetic buttons + spotlight cards (delegated) ---------- */
let lastBtn = null;
document.addEventListener('pointermove', e => {
  const b = e.target.closest && e.target.closest('.btn');
  if (lastBtn && lastBtn !== b) lastBtn.style.transform = '';
  lastBtn = b;
  if (b) {
    const r = b.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    b.style.setProperty('--mx', x + 'px'); b.style.setProperty('--my', y + 'px');
    if (!reduce && b.classList.contains('magnetic')) b.style.transform = `translate(${(x - r.width / 2) * .18}px,${(y - r.height / 2) * .3}px)`;
  }
  const c = e.target.closest && e.target.closest('.spot');
  if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--x', e.clientX - r.left + 'px'); c.style.setProperty('--y', e.clientY - r.top + 'px'); }
}, { passive: true });

/* ---------- join confetti ---------- */
const BC = ['#183898', '#0060b0', '#68a8d8', '#c9a24a', '#16a34a', '#e0662b', '#7c3aed'];
document.addEventListener('click', e => {
  const j = e.target.closest('.join'); if (!j || reduce) return;
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('span'); s.className = 'bp';
    s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; s.style.background = BC[i % BC.length];
    if (i % 3 === 0) s.style.borderRadius = '50%';
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 100;
    s.animate([{ transform: 'translate(-50%,-50%)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d + 50}px)) rotate(${Math.random() * 540}deg) scale(.4)`, opacity: 0 }],
      { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => s.remove();
  }
});

/* ---------- rotating words ---------- */
$$('.rotator').forEach(r => {
  const sp = $$('span', r); let i = 0;
  if (sp.length < 2) return;
  setInterval(() => {
    const prev = sp[i]; prev.classList.remove('on'); prev.classList.add('out');
    i = (i + 1) % sp.length; sp[i].classList.remove('out'); sp[i].classList.add('on');
    setTimeout(() => prev.classList.remove('out'), 700);
  }, +r.dataset.ms || 3000);
});

/* ---------- count up + reveal on scroll ---------- */
function countUp(el) {
  const to = +el.dataset.count, dur = reduce ? 0 : 1600, t0 = performance.now();
  const step = t => { const p = Math.min(1, (t - t0) / (dur || 1)); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))).toLocaleString('en-US'); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  $$('[data-count]', e.target).concat(e.target.matches('[data-count]') ? [e.target] : []).forEach(countUp);
  io.unobserve(e.target);
}), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
$$('[data-reveal]').forEach(el => io.observe(el));

/* ---------- live countdowns: <div class="count" data-until="ISO"> ---------- */
$$('[data-until]').forEach(box => {
  const target = new Date(box.dataset.until).getTime();
  const cells = Object.fromEntries($$('b[data-k]', box).map(b => [b.dataset.k, b]));
  const tick = () => {
    const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    for (const k in v) {
      if (!cells[k]) continue;
      const t = String(v[k]).padStart(2, '0');
      if (cells[k].textContent !== t) { cells[k].textContent = t; cells[k].classList.remove('tick'); void cells[k].offsetWidth; cells[k].classList.add('tick'); }
    }
  };
  tick(); setInterval(tick, 1000);
});

/* ---------- 3D tilt cards ---------- */
if (!reduce && matchMedia('(hover:hover)').matches) $$('.tilt').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.style.transition = 'transform .1s';
    card.style.transform = `perspective(900px) rotateY(${(px - .5) * 10}deg) rotateX(${(.5 - py) * 10}deg)`;
    card.style.setProperty('--gx', px * 100 + '%'); card.style.setProperty('--gy', py * 100 + '%');
  });
  card.addEventListener('pointerleave', () => { card.style.transition = ''; card.style.transform = ''; });
});

window.TFAI = { $, $$, reduce, io, countUp, movePill };
})();
