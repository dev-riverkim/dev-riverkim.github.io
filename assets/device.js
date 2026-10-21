// 메인 받기 카드와 설치 안내가 같은 기준으로 기기·브라우저를 가른다.

export function detectOS() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'android';
  // iPadOS 13+는 데스크톱 Safari로 자신을 소개하므로 터치 지점 수로 가른다.
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  return 'pc';
}

// 설치 프로필은 Safari에서만 설치 화면으로 넘어간다.
// 'safari' | 'inapp'(카카오톡·네이버 같은 앱 안 브라우저) | 'other'(크롬 등 다른 브라우저)
export function iosBrowser() {
  const ua = navigator.userAgent;
  if (/KAKAOTALK|NAVER|Line\/|FBAN|FBAV|Instagram|DaumApps|everytimeApp|BAND\//i.test(ua)) return 'inapp';
  if (/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|Whale|DuckDuckGo/i.test(ua)) return 'other';
  // 앱 안 웹뷰는 대개 Version/…Safari/ 표시가 없다
  return /Version\/[\d.]+.*Safari\//.test(ua) ? 'safari' : 'inapp';
}
