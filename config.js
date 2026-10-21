// anonKey는 공개용 키(RLS로 보호)지만 저장소에 직접 두지 않는다 — 배포 때 README의 치환 단계로 채운다.
window.APM_CONFIG = {
  supabaseUrl: 'https://koxnkjytggzbfllhrlmw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveG5ranl0Z2d6YmZsbGhybG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MTU2MzUsImV4cCI6MjEwODA5MTYzNX0.A06pCxs1Dx4f46q2ywWW6TPfygvb79euqpm6c8P3uuY',
  // 아이폰 '직접 홈 화면에 추가' 안내가 여는 웹앱 주소(EAS Hosting). 없으면 null.
  webPreviewUrl: 'https://apmadang.expo.app',
  // 아이폰 앱 아이콘 설치 프로필(Web Clip 1개). Pages는 octet-stream으로 내줘 설치 화면이 안 뜨므로 Supabase Storage에 둔다.
  iosProfileUrl: 'https://koxnkjytggzbfllhrlmw.supabase.co/storage/v1/object/public/download/apmadang.mobileconfig',
  issuesUrl: 'https://github.com/dev-riverkim/dev-riverkim.github.io/issues',
};
