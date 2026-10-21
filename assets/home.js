import { qrSvg } from '/assets/qr.js';
import { detectOS, iosBrowser } from '/assets/device.js';

const config = window.APM_CONFIG ?? {};
const $ = (sel) => document.querySelector(sel);

// 포스터·PC 화면 QR이 모두 이 주소를 가리킨다. 로컬에서 띄워도 실제 배포 주소를 찍게 고정한다.
const APP_GET_URL = 'https://dev-riverkim.github.io/?get=app';
const AUTO_DL_KEY = 'apm.autoDownload';

// ?get=app(·android)은 QR로 들어왔다는 뜻. 읽자마자 주소에서 지워 새로고침이 다시 받기를 일으키지 않게 한다.
function takeGetParam() {
  const url = new URL(location.href);
  const value = url.searchParams.get('get');
  if (value === null) return false;
  url.searchParams.delete('get');
  history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  return value === 'app' || value === 'android';
}

function showPane(os) {
  for (const pane of document.querySelectorAll('.get-pane')) {
    pane.hidden = pane.dataset.pane !== os;
  }
  for (const chip of document.querySelectorAll('.other-chip')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.os === os));
  }
  if (os === 'pc') renderQR('#qr');
  if (os === 'ios' && detectOS() !== 'ios') renderQR('#ios-qr');
}

const qrDone = new Set();
function renderQR(sel) {
  if (qrDone.has(sel)) return;
  qrDone.add(sel);
  $(sel).innerHTML = qrSvg(APP_GET_URL);
}

const dateFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' });

function sizeText(sizeMB) {
  return sizeMB >= 10 ? `${Math.round(sizeMB)}MB` : `${sizeMB.toFixed(1)}MB`;
}

function metaText(latest, { withSize = true } = {}) {
  const parts = [`v${latest.version}`];
  if (withSize && typeof latest.sizeMB === 'number') parts.push(sizeText(latest.sizeMB));
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

function readMark() {
  try { return sessionStorage.getItem(AUTO_DL_KEY); } catch { return null; }
}
function writeMark(value) {
  try { sessionStorage.setItem(AUTO_DL_KEY, value); } catch { /* 저장 못 해도 주소에서 쿼리를 지웠으니 반복되지 않는다 */ }
}

function showInstallGuide() {
  const box = $('#install');
  box.open = true;
  // 받기 시작(문서 이동)이 부드러운 스크롤을 끊어 버려서 바로 옮긴다.
  box.scrollIntoView({ block: 'start', behavior: 'instant' });
}

// 빌드가 올라와 있을 때만, 이 탭에서 한 번만 받는다.
function autoDownload(latest) {
  const mark = `${latest.version}|${latest.apkUrl}`;
  const alreadyStarted = readMark() === mark;
  $('#apk-meta').textContent = alreadyStarted
    ? '이미 받기를 시작했어요 · 다시 받으려면 버튼을 누르세요'
    : '받기를 시작했어요 · 아래 3단계대로 설치하세요';
  showInstallGuide();
  if (alreadyStarted) return;
  writeMark(mark);
  location.assign(latest.apkUrl);
}

async function loadLatest({ autoStart }) {
  try {
    const res = await fetch('/latest.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const latest = await res.json();
    const ready = Boolean(latest.publishedAt && latest.apkUrl);
    setApkButton(ready
      ? { enabled: true, label: 'APK 받기', href: latest.apkUrl }
      : { enabled: false, label: '첫 빌드 준비 중' });
    const meta = metaText(latest);
    $('#apk-meta').textContent = ready ? metaText(latest, { withSize: false }) : `v${latest.version} · 올라오면 여기서 받아요`;
    const sizeLine = $('#apk-size');
    sizeLine.hidden = !(ready && typeof latest.sizeMB === 'number');
    if (!sizeLine.hidden) sizeLine.textContent = `약 ${sizeText(latest.sizeMB)} · 와이파이에서 받기를 권해요`;
    $('#pc-meta').textContent = meta;
    $('#notes-ver').textContent = `v${latest.version}`;
    const list = $('#notes');
    list.replaceChildren(...(latest.notes ?? []).map((note) => {
      const li = document.createElement('li');
      li.textContent = note;
      return li;
    }));
    // 시연 메모까지 그린 뒤에 스크롤해야 설치 안내 위치가 밀리지 않는다.
    if (ready && autoStart) autoDownload(latest);
  } catch (err) {
    console.error('latest.json', err);
    setApkButton({ enabled: false, label: '잠시 후 다시 열어 주세요' });
    $('#apk-meta').textContent = '버전 정보를 불러오지 못했어요.';
    $('#pc-meta').textContent = '';
    $('#notes-ver').textContent = '불러오지 못했어요';
  }
}

function setupWebApp() {
  if (!config.webPreviewUrl) return;
  const btn = $('#webapp-btn');
  btn.href = config.webPreviewUrl;
  btn.removeAttribute('aria-disabled');
  $('#webapp-label').textContent = '1단계: 앞마당 웹앱 열기';
}

// 아이폰 칸은 기기·브라우저마다 다른 안내를 보인다. '홈 화면에 추가'는 Safari에서만 되므로
// 다른 브라우저에서는 버튼 대신 Safari로 여는 법을 보인다.
function setupIOS(os) {
  const pane = $('[data-pane="ios"]');
  const mode = os === 'ios' ? iosBrowser() : 'device';
  pane.dataset.ios = mode;
  if (mode === 'other') $('#ios-open-line').textContent = '주소를 복사해 Safari에 붙여 넣어요.';
}

function copyOnClick(btn, text) {
  const label = btn.querySelector('span');
  const idle = label.textContent;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      label.textContent = '복사됨';
    } catch {
      label.textContent = '길게 눌러 복사';
    }
    setTimeout(() => { label.textContent = idle; }, 2000);
  });
}

function renderDecorQR() {
  for (const el of document.querySelectorAll('[data-qr]')) {
    el.innerHTML = qrSvg(el.dataset.qr, { quiet: 0 });
  }
}

if (config.issuesUrl) $('#issues-link').href = config.issuesUrl;
const fromQR = takeGetParam();
const os = detectOS();
showPane(os);
for (const chip of document.querySelectorAll('.other-chip')) {
  chip.addEventListener('click', () => showPane(chip.dataset.os));
}
setupWebApp();
setupIOS(os);
copyOnClick($('#copy-code'), $('#copy-code').dataset.code);
copyOnClick($('#copy-url'), APP_GET_URL);
renderDecorQR();
loadLatest({ autoStart: fromQR && os === 'android' });
