import { qrSvg } from '/assets/qr.js';

// 장면 문구·순서의 원본은 /tour/slides.json 하나다(앱 안 소개 화면도 같은 파일을 쓴다).
const GET_URL = 'https://dev-riverkim.github.io/?get=app';
const IMG_DIR = '/assets/tour/';

const $ = (sel) => document.querySelector(sel);
const track = $('#track');
const chaptersEl = $('#chapters');
const dotsEl = $('#dots');
const countEl = $('#count');
const statusEl = $('#status');
const prevBtn = $('#prev');
const nextBtn = $('#next');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let slides = [];
let chapters = [];
let current = -1;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const ICON = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  screen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18h2"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6Z"/><path d="M12 9v4"/><path d="M12 16.5h.01"/></svg>',
  again: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
};

function chapterLabel(c) {
  // '① 골프 오픈런' 처럼 장 번호가 앞에 있으면 탭에도 번호를 붙인다
  const mark = /^[①-⑨]/.exec(c.title)?.[0];
  return mark ? `${mark}${c.short}` : c.short;
}

function phoneHTML(s, i) {
  const ring = s.highlight
    ? `<span class="t-tap" style="--x:${s.highlight.x};--y:${s.highlight.y};--r:${s.highlight.r}" aria-hidden="true"></span>`
    : '';
  const lazy = i < 2 ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<figure class="t-phone">
    <div class="t-screen">
      <img src="${IMG_DIR}${esc(s.image)}" width="780" height="1688" alt="${esc(s.alt)}" decoding="async" ${lazy}>
      ${ring}
    </div>
  </figure>`;
}

function statHTML(stat) {
  if (!stat) return '';
  return `<p class="t-stat"><b class="num">${esc(stat.value)}</b><span>${esc(stat.label)}</span></p>`;
}

function endHTML(s) {
  const real = s.summary.real.map((t) => `<li><span class="t-ico ok">${ICON.check}</span>${esc(t)}</li>`).join('');
  const mock = s.summary.mock
    .map((m) => `<li><span class="t-ico">${ICON.screen}</span><span><b>${esc(m.label)}</b><small>${esc(m.note)}</small></span></li>`)
    .join('');
  return `<div class="t-end">
    <div class="t-copy t-end-head">
      <h2 class="t-title" id="t-${esc(s.id)}">${esc(s.title)}</h2>
      <p class="t-body">${esc(s.body)}</p>
    </div>
    <div class="t-split">
      <section class="t-list card" aria-labelledby="real-title">
        <h3 id="real-title">진짜로 만든 것</h3>
        <ul>${real}</ul>
      </section>
      <section class="t-list t-list-mock" aria-labelledby="mock-title">
        <h3 id="mock-title">흉내만 낸 것</h3>
        <ul>${mock}</ul>
        <p class="t-list-foot">장비가 정해지면 끼울 자리는 남겨 뒀어요.</p>
      </section>
    </div>
    <div class="t-cta card">
      <div class="t-cta-qr">
        <div class="t-qr" id="end-qr" role="img" aria-label="앱 받기 주소 QR 코드"></div>
        <div>
          <p class="t-cta-title">아이폰·안드로이드 모두 카메라로 찍으세요</p>
          <p class="t-cta-line">안드로이드는 바로 받아지고, 아이폰은 홈 화면에 추가해요.</p>
        </div>
      </div>
      <a class="btn btn-brick btn-block t-cta-get" href="/?get=app">${ICON.down}앱 받기</a>
      <div class="t-cta-links">
        <a class="t-link" href="/install/">${ICON.shield}설치 전에 꼭 보세요</a>
        <a class="t-link" href="#${esc(slides[0].id)}" data-go="0">${ICON.again}처음부터 다시</a>
      </div>
    </div>
  </div>`;
}

function slideHTML(s, i) {
  const attrs = `id="${esc(s.id)}" data-i="${i}" role="group" aria-roledescription="장면" aria-labelledby="t-${esc(s.id)}"`;
  if (!s.image) {
    return `<article class="t-slide t-slide-end" ${attrs}>${endHTML(s)}</article>`;
  }
  return `<article class="t-slide${s.stat ? ' has-stat' : ''}" ${attrs}>
    ${phoneHTML(s, i)}
    <div class="t-copy">
      <h2 class="t-title" id="t-${esc(s.id)}">${esc(s.title)}</h2>
      <p class="t-body">${esc(s.body)}</p>
      ${statHTML(s.stat)}
    </div>
  </article>`;
}

function render() {
  chapters = [];
  for (const [i, s] of slides.entries()) {
    let c = chapters.find((x) => x.key === s.chapter);
    if (!c) {
      c = { key: s.chapter, title: s.chapterTitle, short: s.chapterShort ?? s.chapterTitle, first: i, items: [] };
      chapters.push(c);
    }
    c.items.push(i);
  }
  track.innerHTML = slides.map(slideHTML).join('');
  chaptersEl.innerHTML = chapters
    .map((c, k) => `<li><a class="t-chap" href="#${esc(slides[c.first].id)}" data-go="${c.first}" data-k="${k}" title="${esc(c.title)}">${esc(chapterLabel(c))}</a></li>`)
    .join('');
  const qr = $('#end-qr');
  if (qr) qr.innerHTML = qrSvg(GET_URL);
  $('#ctrl').hidden = false;
}

function indexFromHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return 0;
  const bySlide = slides.findIndex((s) => s.id === h);
  if (bySlide >= 0) return bySlide;
  const ch = chapters.find((c) => c.key === h);
  return ch ? ch.first : 0;
}

function go(i, { smooth = true } = {}) {
  const n = Math.max(0, Math.min(slides.length - 1, i));
  const left = n * track.clientWidth;
  track.scrollTo({ left, behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto' });
  setActive(n);
}

function setActive(i) {
  if (i === current) return;
  current = i;
  const s = slides[i];
  const ch = chapters.find((c) => c.key === s.chapter);
  for (const el of track.children) el.classList.toggle('is-active', Number(el.dataset.i) === i);
  for (const a of chaptersEl.querySelectorAll('.t-chap')) {
    const on = chapters[Number(a.dataset.k)] === ch;
    if (on) a.setAttribute('aria-current', 'step');
    else a.removeAttribute('aria-current');
  }
  const pos = ch.items.indexOf(i);
  dotsEl.innerHTML = ch.items
    .map((idx, k) => `<li><a class="t-dot${idx === i ? ' on' : ''}" href="#${esc(slides[idx].id)}" data-go="${idx}" aria-label="${esc(ch.short)} ${k + 1}번째 장면"${idx === i ? ' aria-current="step"' : ''}></a></li>`)
    .join('');
  countEl.textContent = `${i + 1} / ${slides.length}`;
  prevBtn.disabled = i === 0;
  nextBtn.disabled = i === slides.length - 1;
  statusEl.textContent = `${ch.title} ${pos + 1}/${ch.items.length}: ${s.title}`;
  const hash = `#${s.id}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
  // 탭 바가 넘치는 좁은 화면에서 지금 장 탭이 보이게
  chaptersEl.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function watch() {
  let raf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== current && i >= 0 && i < slides.length) setActive(i);
    });
  }, { passive: true });

  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]');
    if (!a) return;
    e.preventDefault();
    go(Number(a.dataset.go));
  });
  prevBtn.addEventListener('click', () => go(current - 1));
  nextBtn.addEventListener('click', () => go(current + 1));

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    const step = { ArrowRight: 1, ArrowLeft: -1, PageDown: 1, PageUp: -1 }[e.key];
    if (step) {
      e.preventDefault();
      go(current + step);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      go(e.key === 'Home' ? 0 : slides.length - 1);
    }
  });

  window.addEventListener('hashchange', () => go(indexFromHash()));

  // Tab으로 화면 밖 장면의 링크에 들어가면 그 장면으로 옮긴다
  track.addEventListener('focusin', (e) => {
    const el = e.target.closest('.t-slide');
    if (el && Number(el.dataset.i) !== current) go(Number(el.dataset.i));
  });

  // 창 크기가 바뀌면 스냅 위치가 어긋나므로 지금 장면에 다시 맞춘다
  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => track.scrollTo({ left: current * track.clientWidth, behavior: 'auto' }), 120);
  });
}

async function start() {
  try {
    const res = await fetch('/tour/slides.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    slides = await res.json();
    if (!Array.isArray(slides) || slides.length === 0) throw new Error('빈 목록');
  } catch {
    track.innerHTML = `<div class="t-error card" role="alert">
      <p class="t-title">장면을 불러오지 못했어요</p>
      <p class="t-body">인터넷 연결을 확인하고 다시 열어 주세요.</p>
      <a class="btn btn-forest" href="">다시 열기</a>
    </div>`;
    return;
  }
  render();
  watch();
  go(indexFromHash(), { smooth: false });
}

// 새로고침 때 브라우저가 옛 가로 위치를 되살리면 주소의 장면과 어긋난다
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
start();
