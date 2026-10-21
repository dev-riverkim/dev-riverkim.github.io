import { detectOS, iosBrowser } from '/assets/device.js';

// 주소는 config.js 한 곳에서만 관리한다.
const config = window.APM_CONFIG ?? {};

if (config.webPreviewUrl) {
  const link = document.getElementById('web-open-link');
  link.href = config.webPreviewUrl;
  link.textContent = new URL(config.webPreviewUrl).host;
}

// 설치 프로필은 아이폰 Safari에서만 설치 화면으로 넘어간다. 다른 곳에서는 버튼을 숨겨 둔다.
if (config.iosProfileUrl && detectOS() === 'ios' && iosBrowser() === 'safari') {
  document.getElementById('profile-link').href = config.iosProfileUrl;
  document.getElementById('profile-open').hidden = false;
}
