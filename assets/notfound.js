(function () {
  var config = window.APM_CONFIG || {};
  var STICKER = /^\/e\/([A-Za-z0-9_-]{1,40})\/?$/;
  var ANON_PLACEHOLDER = '__ANON_KEY__';

  function $(id) { return document.getElementById(id); }

  if (config.issuesUrl) $('issues-link').href = config.issuesUrl;

  var match = STICKER.exec(location.pathname);
  if (!match) {
    document.title = '페이지를 찾을 수 없어요 · 앞마당';
    $('lost').hidden = false;
    return;
  }

  var code = match[1].toUpperCase();
  $('sticker').hidden = false;
  $('eq-code').textContent = code;
  $('open-app').href = 'apmadang://report/new?eq=' + encodeURIComponent(code);

  function setTitle(place, isReport) {
    var title = $('eq-title');
    var name = document.createElement('span');
    name.className = 'eq-name';
    name.textContent = place;
    if (isReport === false) {
      title.replaceChildren(name);
      document.title = place + ' · 앞마당';
      return;
    }
    title.replaceChildren(name, document.createTextNode('고장 신고'));
    document.title = place + ' 고장 신고 · 앞마당';
  }

  function setStatus(text) {
    $('eq-status-text').textContent = text;
    $('eq-status').hidden = false;
  }

  function fallback(text) {
    setTitle('설비 ' + code);
    setStatus(text);
  }

  if (!config.supabaseUrl || !config.anonKey || config.anonKey === ANON_PLACEHOLDER) {
    console.warn('APM_CONFIG.anonKey가 비어 있어 설비 이름을 조회하지 않습니다.');
    fallback('설비 이름을 불러올 수 없어요. 앱에서 열면 이어서 신고할 수 있어요.');
    return;
  }

  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, 8000);
  var url = config.supabaseUrl + '/rest/v1/public_equipment?select=code,name,facility_name&code=eq.' + encodeURIComponent(code);

  fetch(url, {
    headers: { apikey: config.anonKey, Authorization: 'Bearer ' + config.anonKey, Accept: 'application/json' },
    signal: controller.signal,
  })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (rows) {
      var row = Array.isArray(rows) ? rows[0] : null;
      if (!row) {
        setTitle('등록되지 않은 스티커예요', false);
        setStatus('코드 ' + code + '를 찾지 못했어요. 관리사무소에 알려 주세요.');
        return;
      }
      var facility = row.facility_name || '';
      var name = row.name || code;
      // 설비 이름에 시설명이 이미 들어 있으면 두 번 쓰지 않는다
      setTitle(facility && name.indexOf(facility) !== 0 ? facility + ' ' + name : name);
    })
    .catch(function (err) {
      console.error('public_equipment', err);
      fallback('설비 이름을 불러오지 못했어요. 앱에서 열면 이어서 신고할 수 있어요.');
    })
    .finally(function () { clearTimeout(timer); });
})();
