import { qrSvg } from '/assets/qr.js';

const APP_GET_URL = 'https://dev-riverkim.github.io/?get=app';

document.getElementById('poster-qr').innerHTML = qrSvg(APP_GET_URL, { quiet: 0 });
document.getElementById('poster-mini-qr').innerHTML = qrSvg(APP_GET_URL, { quiet: 0 });
document.getElementById('print-btn').addEventListener('click', () => window.print());
