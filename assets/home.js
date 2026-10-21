import { qrSvg } from '/assets/qr.js';

const config = window.APM_CONFIG ?? {};
const $ = (sel) => document.querySelector(sel);

function detectOS() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'android';
  // iPadOS 13+는 데스크톱 Safari로 자신을 소개하므로 터치 지점 수로 가른다.
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'pc';
}

function showPane(os) {
  for (const pane of document.querySelectorAll('.get-pane')) {
    pane.hidden = pane.dataset.pane !== os;
  }
  for (const chip of document.querySelectorAll('.other-chip')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.os === os));
  }
  if (os === 'pc') renderPageQR();
}

let pageQRDone = false;
function renderPageQR() {
  if (pageQRDone) return;
  pageQRDone = true;
  $('#qr').innerHTML = qrSvg(location.origin + location.pathname);
}

const dateFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' });

function metaText(latest) {
  const parts = [`v${latest.version}`];
  if (typeof latest.sizeMB === 'number') parts.push(`${latest.sizeMB.toFixed(1)}MB`);
  if (latest.publishedAt) {
    const d = new Date(latest.publishedAt);
    if (!Number.isNaN(d.getTime())) parts.push(`${dateFmt.format(d)} 갱신`);
  } else {
    parts.push('첫 빌드 준비 중');
  }
  return parts.join(' · ');
}

function setApkButton({ enabled, label, href }) {
  const btn = $('#apk-btn');
  $('#apk-label').textContent = label;
  if (enabled) {
    btn.href = href;
    btn.removeAttribute('aria-disabled');
  } else {
    btn.removeAttribute('href');
    btn.setAttribute('aria-disabled', 'true');
  }
}

async function loadLatest() {
  try {
    const res = await fetch('/latest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const latest = await res.json();
    const ready = Boolean(latest.publishedAt && latest.apkUrl);
    setApkButton(ready
      ? { enabled: true, label: 'APK 받기', href: latest.apkUrl }
      : { enabled: false, label: '첫 빌드 준비 중' });
    const meta = metaText(latest);
    $('#apk-meta').textContent = ready ? meta : `v${latest.version} · 올라오면 여기서 받아요`;
    $('#pc-meta').textContent = meta;
    $('#notes-ver').textContent = `v${latest.version}`;
    const list = $('#notes');
    list.replaceChildren(...(latest.notes ?? []).map((note) => {
      const li = document.createElement('li');
      li.textContent = note;
      return li;
    }));
  } catch (err) {
    console.error('latest.json', err);
    setApkButton({ enabled: false, label: '잠시 후 다시 열어 주세요' });
    $('#apk-meta').textContent = '버전 정보를 불러오지 못했어요.';
    $('#pc-meta').textContent = '';
    $('#notes-ver').textContent = '불러오지 못했어요';
  }
}

function setupIOS() {
  if (!config.webPreviewUrl) return;
  const btn = $('#preview-btn');
  btn.href = config.webPreviewUrl;
  btn.hidden = false;
  $('#ios-line').textContent = '웹 미리보기로 먼저 둘러보세요.';
}

function setupCopy() {
  const btn = $('#copy-code');
  const label = btn.querySelector('span');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.code);
      label.textContent = '복사됨';
    } catch {
      label.textContent = '길게 눌러 복사';
    }
    setTimeout(() => { label.textContent = '복사'; }, 2000);
  });
}

function renderDecorQR() {
  for (const el of document.querySelectorAll('[data-qr]')) {
    el.innerHTML = qrSvg(el.dataset.qr, { quiet: 0 });
  }
}

if (config.issuesUrl) $('#issues-link').href = config.issuesUrl;
showPane(detectOS());
for (const chip of document.querySelectorAll('.other-chip')) {
  chip.addEventListener('click', () => showPane(chip.dataset.os));
}
setupIOS();
setupCopy();
renderDecorQR();
loadLatest();
