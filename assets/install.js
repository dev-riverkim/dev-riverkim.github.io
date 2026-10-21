// 아이폰 웹앱 주소는 config.js 한 곳에서만 관리한다. 값이 없으면 버튼을 숨긴 채로 둔다.
(function () {
  var url = window.APM_CONFIG && window.APM_CONFIG.webPreviewUrl;
  if (!url) return;
  document.getElementById('web-open-link').href = url;
  document.getElementById('web-open').hidden = false;
})();
