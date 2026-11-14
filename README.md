# jeckathon
2026 젝커톤

## 화장실 허가증

야구 보다가 화장실에 가도 될지 야구신에게 허가받고, 다녀온 뒤 놓친 순간을 오늘 경기 기록으로 남기는 놀이 서비스.

- **프론트**: React (Vite) — `client/`
- **서버**: Node.js / Express — `server/` (빌드된 앱 서빙 + `/api/health`)
- **저장**: DB 없음. 모든 기록은 URL 해시(`#s=...`)에 담긴다. 새로고침해도 유지되고, 링크를 복사해 보내면 그대로 열린다.

### 실행

```bash
npm install
npm run dev          # 개발 서버 (Vite) → http://localhost:5173
npm run build        # dist/ 로 빌드
npm start            # Express로 dist 서빙 → http://localhost:3000
npm test             # 판정 로직 테스트 (명세 T1~T6 포함)
```

### 구조

```
client/src/logic.js     판정·칭호·누적 지표·URL 인코딩 (순수 함수, 테스트 대상)
client/src/state.js     리듀서 + URL 동기화 훅
client/src/screens/     S1 전광판 홈 · S2 외출 중 · S3 복귀 기록 · S4 결과 카드 · S5 박스스코어
server/index.js         Express
tests/logic.test.js     node로 실행하는 테스트
```

### URL에 담기는 것

전광판 상황, 급한 정도, 현재 화면, 외출 시작 시각, 오늘 기록(입력값만). 판정·칭호·적중 여부는 입력에서 결정적으로 다시 계산하므로 URL에 넣지 않는다. 기록 30건이 약 2,000자 이내.
