// Vercel 서버리스 함수 진입점. /api/* 요청을 Express 앱이 처리한다.
// 화면(dist)은 Vercel이 정적 파일로 직접 서빙한다.
import app from '../server/index.js';

export default app;
