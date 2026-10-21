import { detectOS, iosBrowser } from '/assets/device.js';

// 웹앱 주소는 config.js 한 곳에서만 관리한다.
const url = (window.APM_CONFIG ?? {}).webPreviewUrl;

if (url) {
  const link = document.getElementById('web-open-link');
  link.href = url;
  link.textContent = new URL(url).host;
  // '홈 화면에 추가'는 아이폰 Safari에서만 되므로 그때만 바로 여는 버튼을 보인다.
  if (detectOS() === 'ios' && iosBrowser() === 'safari') {
    document.getElementById('web-open-btn').href = url;
    document.getElementById('web-open').hidden = false;
  }
}
