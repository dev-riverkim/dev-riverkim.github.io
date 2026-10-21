// anonKey는 공개용 키(RLS로 보호)지만 저장소에 직접 두지 않는다 — 배포 때 README의 치환 단계로 채운다.
window.APM_CONFIG = {
  supabaseUrl: 'https://koxnkjytggzbfllhrlmw.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveG5ranl0Z2d6YmZsbGhybG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MTU2MzUsImV4cCI6MjEwODA5MTYzNX0.A06pCxs1Dx4f46q2ywWW6TPfygvb79euqpm6c8P3uuY',
  // 아이폰 사용자에게 보여 줄 웹 미리보기 주소. 없으면 null.
  webPreviewUrl: null,
  issuesUrl: 'https://github.com/dev-riverkim/dev-riverkim.github.io/issues',
};
